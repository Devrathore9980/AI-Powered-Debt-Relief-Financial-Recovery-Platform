from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import User, DebtRecord
from schemas import UserCreate, UserResponse, NegotiationRequest, DebtRecordCreate, DebtRecordResponse, FinancialHealthResponse, SettlementPredictionResponse
from auth import hash_password, verify_password, create_access_token
from ai_engine import generate_negotiation_strategy, predict_settlement
from fastapi.middleware.cors import CORSMiddleware



Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "FinRelief AI backend zinda hai!"}

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Yeh email already registered hai")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ya password galat hai")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/negotiate")
def negotiate(request: NegotiationRequest):
    strategy = generate_negotiation_strategy(
        loan_amount=request.loan_amount,
        overdue_months=request.overdue_months,
        debt_stress_level=request.debt_stress_level
    )
    return {"strategy": strategy}

@app.post("/debt-record", response_model=DebtRecordResponse)
def create_debt_record(record: DebtRecordCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == record.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    strategy = generate_negotiation_strategy(
        loan_amount=record.loan_amount,
        overdue_months=record.overdue_months,
        debt_stress_level=record.debt_stress_level
    )

    new_record = DebtRecord(
        loan_amount=record.loan_amount,
        overdue_months=record.overdue_months,
        debt_stress_level=record.debt_stress_level,
        ai_strategy=strategy,
        owner_id=user.id
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@app.get("/loans", response_model=list[DebtRecordResponse])
def get_loans(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    loans = db.query(DebtRecord).filter(DebtRecord.owner_id == user.id).all()
    return loans


@app.delete("/loans/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(DebtRecord).filter(DebtRecord.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record nahi mila")

    db.delete(loan)
    db.commit()
    return {"message": "Loan record delete ho gaya"}

@app.get("/financial-health", response_model=FinancialHealthResponse)
def financial_health(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    loans = db.query(DebtRecord).filter(DebtRecord.owner_id == user.id).all()

    if not loans:
        return FinancialHealthResponse(
            total_debt=0,
            total_loans=0,
            average_overdue_months=0,
            health_status="No Data"
        )

    total_debt = sum(loan.loan_amount for loan in loans)
    total_loans = len(loans)
    average_overdue = sum(loan.overdue_months for loan in loans) / total_loans

    if average_overdue <= 2:
        status = "Good"
    elif average_overdue <= 6:
        status = "Moderate"
    else:
        status = "Critical"

    return FinancialHealthResponse(
        total_debt=total_debt,
        total_loans=total_loans,
        average_overdue_months=round(average_overdue, 1),
        health_status=status
    )
@app.post("/settlement-predictor", response_model=SettlementPredictionResponse)
def settlement_predictor(request: NegotiationRequest):
    prediction = predict_settlement(
        loan_amount=request.loan_amount,
        overdue_months=request.overdue_months,
        debt_stress_level=request.debt_stress_level
    )
    return {"prediction": prediction}