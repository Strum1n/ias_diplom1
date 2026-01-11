import re
from sqlalchemy.ext.asyncio import create_async_engine  # type: ignore
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.backend.config import settings

DATABASE_URL = settings.DB_URL

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class BaseModel(SQLModel):
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Автоматически преобразует имя класса CamelCase → snake_case.
        Примеры:
            OfferType → offer_type
            WindowViewType → window_view_type
            HTMLParser → html_parser
            PropertyAddress → property_address
        """
        return re.sub(r"(?!^)(?=[A-Z])", "_", cls.__name__).lower()


BaseModel.metadata.naming_convention = convention


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


engine = create_async_engine(DATABASE_URL, echo=False)
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_async_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
