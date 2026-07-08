# Project Design Phase

## ER Diagram — Entities
- **Users** (user_id PK): name, email, hashed_password
- **Loans / Debt Records** (loan_id PK, user_id FK): loan_amount, overdue_months, debt_stress_level, ai_strategy
- **Financial Profile** (embedded in dashboard logic): monthly_income, health_status
- **Settlement Records**: settlement predictions per loan
- **AI History**: negotiation strategies, emails generated

## Relationships
- One User → Many Loans (1:N)
- One Loan → One Settlement Prediction (1:1 at request time)
- One User → Many AI History records (1:N)

## System Architecture
```
[React Frontend] <--> [FastAPI Backend] <--> [SQLite DB]
                              |
                              v
                     [Google Gemini API]
```