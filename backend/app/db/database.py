import sqlite3
from contextlib import contextmanager

DATABASE_URL = "test.db"

@contextmanager
def get_db_connection():
    db = sqlite3.connect(DATABASE_URL)
    try:
        yield db
    finally:
        db.close()

def get_db():
    with get_db_connection() as db:
        yield db