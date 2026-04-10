from contextlib import asynccontextmanager
from neo4j import AsyncGraphDatabase, AsyncDriver
from .config import settings

_driver: AsyncDriver | None = None


def get_driver() -> AsyncDriver:
    if _driver is None:
        raise RuntimeError("Neo4j driver not initialized. Call init_driver() first.")
    return _driver


async def init_driver():
    global _driver
    _driver = AsyncGraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
    )
    await _driver.verify_connectivity()


async def close_driver():
    global _driver
    if _driver:
        await _driver.close()
        _driver = None


@asynccontextmanager
async def get_session():
    driver = get_driver()
    async with driver.session() as session:
        yield session
