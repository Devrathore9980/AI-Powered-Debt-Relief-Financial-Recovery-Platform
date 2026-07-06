import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-flash-latest")

def generate_negotiation_strategy(loan_amount: float, overdue_months: int, debt_stress_level: str) -> str:
    prompt = f"""
    Tum ek expert debt negotiation advisor ho. Neeche diye gaye borrower ke details dekho aur
    ek practical, step-by-step negotiation strategy suggest karo jisse woh apne lender se
    baat kar sake apna loan settle karne ke liye.

    Loan Amount: ₹{loan_amount}
    Overdue Months: {overdue_months}
    Debt Stress Level: {debt_stress_level}

    Apna jawaab clear points me do, professional tone me, aur practical suggestions do
    (jaise kitna discount maanga ja sakta hai, kya documents chahiye, kaise approach karein).
    """

    response = model.generate_content(prompt)
    return response.text

def predict_settlement(loan_amount: float, overdue_months: int, debt_stress_level: str) -> str:
    prompt = f"""
    Tum ek settlement prediction expert ho. Neeche diye gaye loan details dekhkar,
    ek REALISTIC settlement estimate do.

    Loan Amount: ₹{loan_amount}
    Overdue Months: {overdue_months}
    Debt Stress Level: {debt_stress_level}

    Sirf yeh 3 cheezein do, bilkul short aur clear:
    1. Estimated Settlement Percentage (jaise "30-40%")
    2. Estimated Settlement Amount (₹ me range)
    3. Ek line ka reasoning (kyun yeh estimate diya)
    """

    response = model.generate_content(prompt)
    return response.text

def generate_negotiation_email(loan_amount: float, overdue_months: int, debt_stress_level: str, lender_name: str = "Lender") -> str:
    prompt = f"""
    Tum ek professional debt negotiation writer ho. Neeche diye gaye details ke basis par,
    ek polite, professional negotiation EMAIL likho jo borrower apne lender ko bhej sake.

    Lender Name: {lender_name}
    Loan Amount: ₹{loan_amount}
    Overdue Months: {overdue_months}
    Debt Stress Level: {debt_stress_level}

    Email format follow karo:
    - Subject line
    - Polite greeting
    - Situation explain karo (financial hardship)
    - One-Time Settlement (OTS) ki request karo
    - Professional closing

    Poora email likho, ready to send.
    """

    response = model.generate_content(prompt)
    return response.text