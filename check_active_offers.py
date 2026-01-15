import asyncio
import sys
import logging
from datetime import datetime
from typing import List, Optional

import aiohttp
import asyncpg
from sqlalchemy.exc import IntegrityError
from sqlmodel import delete, select, update

from app.backend.db.models import Offer
from app.backend.db.config import async_session_maker


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"image_checker_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
    ],
)
logger = logging.getLogger(__name__)


async def check_image(session: aiohttp.ClientSession, url: str) -> Optional[int]:
    try:
        async with session.head(url, allow_redirects=True) as response:
            return response.status
    except aiohttp.ClientError:
        return None


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
            logger.warning(f"FK violation on batch delete, falling back to per-offer handling: {ids}")

        for offer_id in ids:
            try:
                result = await session.exec(delete(Offer).where(Offer.id == offer_id))
                await session.commit()
                deleted += result.rowcount or 0

            except IntegrityError as e:
                await session.rollback()

                if "asyncpg.exceptions.ForeignKeyViolationError" in str(e):
                    await session.exec(update(Offer).where(Offer.id == offer_id).values(is_active=False))
                    await session.commit()
                    deactivated += 1
                else:
                    raise

    return deleted, deactivated


async def main(concurrency: int = 50, batch_size: int = 5000, delete_enabled: bool = True) -> None:
    sem = asyncio.Semaphore(concurrency)

    total_checked = 0
    total_404_found = 0
    total_deleted = 0
    total_deactivated = 0
    batch_number = 0
    start_time = datetime.now()

    ids_to_process: List[int] = []
    DELETE_BATCH_SIZE = 100

    timeout = aiohttp.ClientTimeout(total=10)
    connector = aiohttp.TCPConnector(limit=concurrency)

    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as http:

        async def worker(offer_id: int, images, offer_url: str | None) -> Optional[int]:
            if not images:
                return None

            # Проверяем первое изображение
            image_url = images[0] if isinstance(images, (list, tuple)) else None
            if not image_url or not isinstance(image_url, str) or not image_url.startswith("http"):
                return None

            async with sem:
                status = await check_image(http, image_url)
            # if status is not None and status != 404:
            #     logger.info(f"Non-404 status {status} for offer_id={offer_id} | url={image_url}")
            if status != 200:
                logger.warning(f"404 image found | offer_id={offer_id} | offer_url={offer_url}")
                return offer_id

            return None

        last_id = 0

        while True:
            batch_number += 1
            logger.info(f"Batch #{batch_number}, last_id={last_id}")

            async with async_session_maker() as session:
                result = await session.exec(select(Offer.id, Offer.images_urls, Offer.url).where(Offer.id > last_id).order_by(Offer.id).limit(batch_size))
                rows = result.all()

            if not rows:
                break

            tasks = [asyncio.create_task(worker(oid, images, url)) for oid, images, url in rows]
            results = await asyncio.gather(*tasks)

            for offer_id in results:
                if offer_id:
                    total_404_found += 1
                    ids_to_process.append(offer_id)

                    if len(ids_to_process) >= DELETE_BATCH_SIZE:
                        d, da = await delete_or_deactivate_offers(ids_to_process, delete_enabled)
                        total_deleted += d
                        total_deactivated += da
                        ids_to_process.clear()

            total_checked += len(rows)
            last_id = rows[-1][0]

            elapsed = (datetime.now() - start_time).total_seconds()
            speed = total_checked / elapsed if elapsed else 0

            logger.info(f"checked={total_checked}, 404={total_404_found}, deleted={total_deleted}, deactivated={total_deactivated}, speed={speed:.1f}/s")

        if ids_to_process:
            d, da = await delete_or_deactivate_offers(ids_to_process, delete_enabled)
            total_deleted += d
            total_deactivated += da

    total_time = (datetime.now() - start_time).total_seconds()
    logger.info("=" * 60)
    logger.info("PROCESSING COMPLETED")
    logger.info(f"Checked: {total_checked}")
    logger.info(f"404 found: {total_404_found}")
    logger.info(f"Deleted: {total_deleted}")
    logger.info(f"Deactivated: {total_deactivated}")
    logger.info(f"Time: {total_time:.2f}s")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--delete", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--concurrency", type=int, default=50)
    parser.add_argument("--batch-size", type=int, default=5000)

    args = parser.parse_args()

    if args.delete and args.dry_run:
        sys.exit("Cannot use --delete and --dry-run together")

    asyncio.run(
        main(
            concurrency=args.concurrency,
            batch_size=args.batch_size,
            delete_enabled=args.delete,
        )
    )
