from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    security_question: str      
    security_answer: str        

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

    
class UpdateProfileRequest(BaseModel):
    name: str | None = None
    password: str | None = None


class AddLoanRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str


class AIHistoryItem(BaseModel):
    loan_id: int
    loan_amount: float
    ai_strategy: str | None


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
    language: str = "English"          

class AddLoanRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    language: str = "English"          

class NegotiationRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    language: str = "English"          

class NegotiationEmailRequest(BaseModel):
    loan_amount: float
    overdue_months: int
    debt_stress_level: str
    lender_name: str = "Lender"
    language: str = "English"          

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    security_answer: str
    new_password: str