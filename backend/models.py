from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    total_debt = Column(Float, default=0.0)
    security_question = Column(String, nullable=True)
    security_answer = Column(String, nullable=True)

    debt_records = relationship("DebtRecord", back_populates="owner")
    financial_profile = relationship("FinancialProfile", uselist=False, back_populates="owner")
    settlement_records = relationship("SettlementRecord", back_populates="owner")
    ai_history_records = relationship("AIHistoryRecord", back_populates="owner")


class DebtRecord(Base):
    __tablename__ = "debt_records"

    id = Column(Integer, primary_key=True, index=True)
    loan_amount = Column(Float, nullable=False)
    overdue_months = Column(Integer, nullable=False)
    debt_stress_level = Column(String, nullable=False)
    ai_strategy = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="debt_records")
    settlement_records = relationship("SettlementRecord", back_populates="loan")


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    monthly_income = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    existing_debts = Column(Float, nullable=False)
    financial_health_score = Column(Float, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), unique=True)
    owner = relationship("User", back_populates="financial_profile")


class SettlementRecord(Base):
    __tablename__ = "settlement_records"

    id = Column(Integer, primary_key=True, index=True)
    settlement_prediction = Column(String, nullable=False)
    recommended_amount = Column(Float, nullable=True)
    priority_level = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    loan_id = Column(Integer, ForeignKey("debt_records.id"))

    owner = relationship("User", back_populates="settlement_records")
    loan = relationship("DebtRecord", back_populates="settlement_records")


class AIHistoryRecord(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    negotiation_strategy = Column(Text, nullable=True)
    settlement_letter = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="ai_history_records")