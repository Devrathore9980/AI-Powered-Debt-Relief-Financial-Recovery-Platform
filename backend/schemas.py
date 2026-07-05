from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    total_debt: float

    class Config:
        from_attributes = True

class NegotiationRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str

class DebtRecordCreate(BaseModel):
    user_email: EmailStr
    loan_amount: float
    overdue_months: int
    debt_stress_level: str

class DebtRecordResponse(BaseModel):
    id: int
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    ai_strategy: str | None

    class Config:
        from_attributes = True