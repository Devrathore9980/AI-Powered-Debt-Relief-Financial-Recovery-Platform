from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    total_debt = Column(Float, default=0.0)

    debt_records = relationship("DebtRecord", back_populates="owner")


class DebtRecord(Base):
    __tablename__ = "debt_records"

    id = Column(Integer, primary_key=True, index=True)
    loan_amount = Column(Float, nullable=False)
    overdue_months = Column(Integer, nullable=False)
    debt_stress_level = Column(String, nullable=False)
    ai_strategy = Column(Text, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="debt_records")