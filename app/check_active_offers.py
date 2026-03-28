import argparse
import asyncio
import os
import sys
import logging
from datetime import datetime
from typing import List, Optional

import aiohttp
from sqlalchemy.exc import IntegrityError
from sqlmodel import delete, select, update

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.db.config import async_session_maker
from backend.db.models.offer import Offer


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"image_checker_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
    ],
)
logger = logging.getLogger(__name__)


async def check_image(session: aiohttp.ClientSession, url: str) -> bool:
    """Проверяет доступность изображения с правильными заголовками"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        async with session.head(url, allow_redirects=True, timeout=10, headers=headers) as response:
            return response.status == 200
    except aiohttp.ClientError, asyncio.TimeoutError:
        # Если HEAD не работает, пробуем GET
        try:
            async with session.get(url, allow_redirects=True, timeout=10, headers=headers) as response:
                return response.status == 200
        except:
            return False


async def delete_or_deactivate_offers(ids: List[int], delete_enabled: bool) -> tuple[int, int]:
    if not ids or not delete_enabled:
        return 0, 0

    deleted = 0
    deactivated = 0

    async with async_session_maker() as session:
        try:
            result = await session.exec(delete(Offer).where(Offer.id.in_(ids)))
            await session.commit()
            return result.rowcount or 0, 0

        except IntegrityError:
            await session.rollback()
            logger.warning(f"FK violation, falling back to per-offer handling")

        for offer_id in ids:
            try:
                result = await session.exec(delete(Offer).where(Offer.id == offer_id))
                await session.commit()
                deleted += result.rowcount or 0

            except IntegrityError:
                await session.rollback()
                await session.exec(update(Offer).where(Offer.id == offer_id).values(is_active=False))
                await session.commit()
                deactivated += 1

    return deleted, deactivated


async def main(concurrency: int = 15, batch_size: int = 5000, delete_enabled: bool = False, max_images: int = 3) -> None:
    sem = asyncio.Semaphore(concurrency)
    total_checked = 0
    total_invalid = 0
    total_deleted = 0
    total_deactivated = 0
    ids_to_process: List[int] = []
    start_time = datetime.now()

    timeout = aiohttp.ClientTimeout(total=10)
    connector = aiohttp.TCPConnector(limit=concurrency)

    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as http:

        async def worker(offer_id: int, images, offer_url: str) -> Optional[int]:
            if not images:
                return None

            # Проверяем первые max_images изображений
            available_count = 0
            for image_url in images[:max_images]:
                async with sem:
                    if await check_image(http, image_url):
                        available_count += 1
                        if available_count > 0:  # Достаточно одного рабочего изображения
                            return None

            # Если ни одного рабочего изображения не найдено
            logger.warning(f"All images unavailable | offer_id={offer_id} | url={offer_url}")
            return offer_id

        last_id = 0
        while True:
            async with async_session_maker() as session:
                result = await session.exec(
                    select(Offer.id, Offer.images_urls, Offer.url).where(Offer.id > last_id).order_by(Offer.id).limit(batch_size)
                )
                rows = result.all()

            if not rows:
                break

            tasks = [asyncio.create_task(worker(oid, images, url)) for oid, images, url in rows]
            results = await asyncio.gather(*tasks)

            for offer_id in results:
                if offer_id:
                    total_invalid += 1
                    ids_to_process.append(offer_id)

                    if len(ids_to_process) >= 100:
                        d, da = await delete_or_deactivate_offers(ids_to_process, delete_enabled)
                        total_deleted += d
                        total_deactivated += da
                        ids_to_process.clear()

            total_checked += len(rows)
            last_id = rows[-1][0]

            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"checked={total_checked}, invalid={total_invalid}, "
                f"deleted={total_deleted}, deactivated={total_deactivated}, "
                f"speed={total_checked / elapsed:.1f}/s"
            )

        if ids_to_process:
            d, da = await delete_or_deactivate_offers(ids_to_process, delete_enabled)
            total_deleted += d
            total_deactivated += da

    logger.info("=" * 60)
    logger.info(
        f"PROCESSING COMPLETED | Checked: {total_checked} | Invalid: {total_invalid} | Deleted: {total_deleted} | Deactivated: {total_deactivated}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--delete", action="store_true")
    parser.add_argument("--concurrency", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=5000)
    parser.add_argument("--max-images", type=int, default=3)

    args = parser.parse_args()

    asyncio.run(main(concurrency=args.concurrency, batch_size=args.batch_size, delete_enabled=args.delete, max_images=args.max_images))
