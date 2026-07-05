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