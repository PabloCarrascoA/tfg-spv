import sqlite3
from contextlib import contextmanager

DATABASE_URL = "test.db"

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

def get_db():
    with get_db_connection() as conn:
        yield conn