from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import User, DebtRecord
from schemas import (
    UserCreate, UserResponse, NegotiationRequest, DebtRecordCreate, DebtRecordResponse,
    FinancialHealthResponse, SettlementPredictionResponse, DashboardDataResponse,
    NegotiationEmailRequest, NegotiationEmailResponse,
    UpdateProfileRequest, AddLoanRequest, AIHistoryItem, DebtTimelineItem
)
from auth import hash_password, verify_password, create_access_token, get_current_user_email
from ai_engine import generate_negotiation_strategy, predict_settlement, generate_negotiation_email
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-powered-debt-relief-financial-re-ten.vercel.app",       
                   ],
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


# ======================================================
# AUTH & PROFILE
# ======================================================

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


@app.get("/debug_user")
def debug_user(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")
    return {"id": user.id, "name": user.name, "email": user.email}


@app.put("/update-profile", response_model=UserResponse)
def update_profile(
    updates: UpdateProfileRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    if updates.name:
        user.name = updates.name
    if updates.password:
        user.hashed_password = hash_password(updates.password)

    db.commit()
    db.refresh(user)
    return user


# ======================================================
# LOANS
# ======================================================

@app.post("/add-loan", response_model=DebtRecordResponse)
def add_loan(
    loan: AddLoanRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    strategy = generate_negotiation_strategy(
        loan_amount=loan.loan_amount,
        overdue_months=loan.overdue_months,
        debt_stress_level=loan.debt_stress_level,
        language=loan.language                 # 👈 YE LINE ADD KARO
    )

    new_loan = DebtRecord(
        loan_amount=loan.loan_amount,
        overdue_months=loan.overdue_months,
        debt_stress_level=loan.debt_stress_level,
        ai_strategy=strategy,
        owner_id=user.id
    )
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    return new_loan


@app.post("/debt-record", response_model=DebtRecordResponse)
def create_debt_record(record: DebtRecordCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == record.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    strategy = generate_negotiation_strategy(
        loan_amount=record.loan_amount,
        overdue_months=record.overdue_months,
        debt_stress_level=record.debt_stress_level,
        language=record.language              # 👈 YE LINE ADD KARO
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
def get_loans(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")
    return db.query(DebtRecord).filter(DebtRecord.owner_id == user.id).all()


@app.delete("/loans/{loan_id}")
def delete_loan(
    loan_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    loan = db.query(DebtRecord).filter(
        DebtRecord.id == loan_id, DebtRecord.owner_id == user.id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record nahi mila")
    db.delete(loan)
    db.commit()
    return {"message": "Loan record delete ho gaya"}


# ======================================================
# AI FEATURES (negotiation, settlement, email)
# ======================================================

@app.post("/negotiate")
def negotiate(request: NegotiationRequest):
    strategy = generate_negotiation_strategy(
        loan_amount=request.loan_amount,
        overdue_months=request.overdue_months,
        debt_stress_level=request.debt_stress_level,
        language=request.language               # 👈 YE LINE ADD KARO
    )
    return {"strategy": strategy}

@app.get("/ai-negotiation-strategy")
def ai_negotiation_strategy(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    latest_loan = db.query(DebtRecord).filter(
        DebtRecord.owner_id == user.id
    ).order_by(DebtRecord.created_at.desc()).first()

    if not latest_loan:
        raise HTTPException(status_code=404, detail="Koi loan record nahi mila")

    return {"loan_id": latest_loan.id, "strategy": latest_loan.ai_strategy}


@app.get("/ai-history", response_model=list[AIHistoryItem])
def ai_history(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    loans = db.query(DebtRecord).filter(DebtRecord.owner_id == user.id).all()

    return [
        {"loan_id": loan.id, "loan_amount": loan.loan_amount, "ai_strategy": loan.ai_strategy}
        for loan in loans
    ]


@app.post("/settlement-predictor", response_model=SettlementPredictionResponse)
def settlement_predictor(request: NegotiationRequest):
    prediction = predict_settlement(
        loan_amount=request.loan_amount,
        overdue_months=request.overdue_months,
        debt_stress_level=request.debt_stress_level,
        language=request.language               # 👈 YE LINE ADD KARO
    )
    return {"prediction": prediction}

@app.post("/generate-negotiation-email", response_model=NegotiationEmailResponse)
def negotiation_email(request: NegotiationEmailRequest):
    email_content = generate_negotiation_email(
        loan_amount=request.loan_amount,
        overdue_months=request.overdue_months,
        debt_stress_level=request.debt_stress_level,
        lender_name=request.lender_name,
        language=request.language                # 👈 YE LINE ADD KARO
    )
    return {"email_content": email_content}

@app.get("/generate-negotiation-email/{loan_id}", response_model=NegotiationEmailResponse)
def negotiation_email_for_loan(
    loan_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    loan = db.query(DebtRecord).filter(
        DebtRecord.id == loan_id, DebtRecord.owner_id == user.id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record nahi mila")

    email_content = generate_negotiation_email(
        loan_amount=loan.loan_amount,
        overdue_months=loan.overdue_months,
        debt_stress_level=loan.debt_stress_level,
        lender_name="Lender"
    )
    return {"email_content": email_content}


# ======================================================
# DASHBOARD & ANALYTICS
# ======================================================

@app.get("/financial-health", response_model=FinancialHealthResponse)
def financial_health(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
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


@app.get("/dashboard-data", response_model=DashboardDataResponse)
def dashboard_data(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User nahi mila")

    loans = db.query(DebtRecord).filter(DebtRecord.owner_id == user.id).all()

    total_debt = sum(loan.loan_amount for loan in loans)
    total_loans = len(loans)

    if total_loans == 0:
        health_status = "No Data"
    else:
        average_overdue = sum(loan.overdue_months for loan in loans) / total_loans
        if average_overdue <= 2:
            health_status = "Good"
        elif average_overdue <= 6:
            health_status = "Moderate"
        else:
            health_status = "Critical"

    return DashboardDataResponse(
        user_name=user.name,
        user_email=user.email,
        total_debt=total_debt,
        total_loans=total_loans,
        health_status=health_status,
        loans=loans
    )


@app.get("/debt-timeline", response_model=list[DebtTimelineItem])
def debt_timeline(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    loans = db.query(DebtRecord).filter(
        DebtRecord.owner_id == user.id
    ).order_by(DebtRecord.created_at.asc()).all()

    return [
        {
            "loan_id": loan.id,
            "loan_amount": loan.loan_amount,
            "overdue_months": loan.overdue_months,
            "created_at": str(loan.created_at)
        }
        for loan in loans
    ]




