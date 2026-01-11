import asyncio
from typing import Optional

import aiohttp
from sqlmodel import select

from app.backend.db.config import async_session_maker
from app.backend.db.models import Offer


async def check_image(session: aiohttp.ClientSession, img_url: str) -> Optional[int]:
    try:
        async with session.head(img_url, allow_redirects=True, timeout=10) as resp:
            return resp.status
    except Exception:
        return None


async def main(concurrency: int = 50, batch_size: int = 1000) -> None:
    sem = asyncio.Semaphore(concurrency)
    try:
        timeout = aiohttp.ClientTimeout(total=15)
        connector = aiohttp.TCPConnector(limit=concurrency)
        async with aiohttp.ClientSession(timeout=timeout, connector=connector) as http:

            async def worker(id_: int, images, url: str | None) -> None:
                if not images:
                    return
                first = images[0] if isinstance(images, (list, tuple)) and images else None
                if not first or not isinstance(first, str) or not first.startswith("http"):
                    return

                async with sem:
                    status = await check_image(http, first)
                if status == 404:
                    print(url or f"offer id {id_} (no offer.url)")

            last_id = 0
            while True:
                async with async_session_maker() as db_session:
                    stmt = select(Offer.id, Offer.images_urls, Offer.url).where(Offer.id > last_id).order_by(Offer.id).limit(batch_size)
                    result = await db_session.exec(stmt)
                    rows = result.all()

                if not rows:
                    break

                tasks = []
                for row in rows:
                    # row is (id, images_urls, url)
                    try:
                        id_, images, url = row
                    except Exception:
                        # fallback in case Row object behaves differently
                        id_ = row[0]
                        images = row[1]
                        url = row[2] if len(row) > 2 else None
                    tasks.append(asyncio.create_task(worker(id_, images, url)))

                if tasks:
                    await asyncio.gather(*tasks)

                # advance last_id to the greatest id in this batch
                try:
                    last_id = int(rows[-1][0])
                except Exception:
                    break
    except Exception as e:
        print(f"Error occurred: {e}")


if __name__ == "__main__":
    asyncio.run(main())
