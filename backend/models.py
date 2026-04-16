from sqlalchemy import Column, Integer, String, Float,DateTime
from sqlalchemy.orm import declarative_base
from database import engine
from datetime import datetime, timezone

Base = declarative_base()

# ── USER TABLE ─────────────────────────────
class User(Base):
    __tablename__ = "users"

    email = Column(String(100), primary_key=True)
    name = Column(String(100))
    password = Column(String(100))
    age = Column(Integer)
    gender = Column(String(10))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ── PREDICTION TABLE ───────────────────────
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100))
    disease = Column(String(100))
    confidence = Column(Float)
    symptoms = Column(String(500))


# ── CREATE TABLES ─────────────────────────
Base.metadata.create_all(bind=engine)
