import asyncio
import zendriver


class Parser(zendriver.Browser):
    _url: str

    @classmethod
    async def create(cls) -> "Parser":  # Аннотация возвращаемого типа
        # Ваша логика создания, если нужно переопределить
        instance = await super().create()
        return instance

    async def describe(self):
        await asyncio.sleep(1)
        print(f'"{self._url}", {self.cookies}')

    async def parse(self, url: str):
        print("Начали парсить", url)
        page = await super().get(url)  # type: ignore
        await page.sleep(2)
        await page.close()
        print("Завершаем работу", url)


async def main():
    parser = await Parser.create()
    parser2 = await Parser.create()
    task2 = asyncio.create_task(parser2.parse("https://www.google.com/?hl=ru"))
    task1 = asyncio.create_task(parser.parse("https://ya.ru/"))
    await task2
    await task1


if __name__ == "__main__":
    asyncio.run(main())
