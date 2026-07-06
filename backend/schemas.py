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

class FinancialHealthResponse(BaseModel):
    total_debt: float
    total_loans: int
    average_overdue_months: float
    health_status: str

class SettlementPredictionResponse(BaseModel):
    prediction: str

class DashboardDataResponse(BaseModel):
    user_name: str
    user_email: str
    total_debt: float
    total_loans: int
    health_status: str
    loans: list[DebtRecordResponse]

class NegotiationEmailRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    lender_name: str = "Lender"

class NegotiationEmailResponse(BaseModel):
    email_content: str

    # Update Profile ke liye
class UpdateProfileRequest(BaseModel):
    name: str | None = None
    password: str | None = None

# Add Loan ke liye (user_email nahi chahiye - token se aayega)
class AddLoanRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str

# AI History dikhane ke liye
class AIHistoryItem(BaseModel):
    loan_id: int
    loan_amount: float
    ai_strategy: str | None

# Debt Timeline dikhane ke liye
class DebtTimelineItem(BaseModel):
    loan_id: int
    loan_amount: float
    overdue_months: int
    created_at: str

class DebtRecordCreate(BaseModel):
    user_email: EmailStr
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    language: str = "English"          # 👈 naya field, default English

class AddLoanRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    language: str = "English"          # 👈 naya field

class NegotiationRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    language: str = "English"          # 👈 naya field

class NegotiationEmailRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    lender_name: str = "Lender"
    language: str = "English"          # 👈 naya field