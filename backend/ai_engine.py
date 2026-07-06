import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def get_language_instruction(language: str) -> str:
    """User ki choice ke hisaab se AI ko exact instruction deta hai."""
    if language == "Hindi":
        return "Respond only in Hindi (Devanagari script). Do not use English or Hinglish."
    elif language == "Hinglish":
        return "Respond only in Hinglish (Hindi words written in English/Roman script, mixed with common English words), like people naturally text in India. Do not use Devanagari script."
    else:  # default English
        return "Respond only in English (India). Do not use Hindi or Hinglish."


def generate_negotiation_strategy(loan_amount: float, overdue_months: int, debt_stress_level: str, language: str = "English") -> str:
    prompt = f"""
    You are an expert debt negotiation advisor. Based on the borrower details below,
    suggest a practical, step-by-step negotiation strategy they can use to talk to
    their lender and settle their loan.

    Loan Amount: ₹{loan_amount}
    Overdue Months: {overdue_months}
    Debt Stress Level: {debt_stress_level}

    Give the answer in clear points, professional tone, with practical suggestions
    (such as how much discount can be requested, what documents are needed, how to approach the lender).

    {get_language_instruction(language)}
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[AI ERROR - strategy]: {e}")
        return (
            "AI service is temporarily busy, here is a general strategy:\n"
            "1. Explain your financial hardship to the lender (job loss, medical emergency, etc.)\n"
            "2. Request a One-Time Settlement (OTS) — typically a 30-50% discount is possible\n"
            "3. Keep communication in writing (email/letter), avoid verbal-only commitments on calls\n"
            "4. Ask for a flexible payment plan if a full settlement isn't possible\n"
            "5. Get any agreement in writing before signing"
        )


def predict_settlement(loan_amount: float, overdue_months: int, debt_stress_level: str, language: str = "English") -> str:
    prompt = f"""
    You are a settlement prediction expert. Based on the loan details below,
    give a REALISTIC settlement estimate.

    Loan Amount: ₹{loan_amount}
    Overdue Months: {overdue_months}
    Debt Stress Level: {debt_stress_level}

    Give only these 3 things, short and clear:
    1. Estimated Settlement Percentage (e.g. "30-40%")
    2. Estimated Settlement Amount (in ₹ range)
    3. One-line reasoning (why this estimate)

    {get_language_instruction(language)}
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[AI ERROR - settlement]: {e}")
        estimated_pct = 40 if debt_stress_level == "High" else 30 if debt_stress_level == "Medium" else 20
        estimated_amount = loan_amount * estimated_pct / 100
        return (
            f"1. Estimated Settlement Percentage: ~{estimated_pct}%\n"
            f"2. Estimated Settlement Amount: ₹{estimated_amount:.0f}\n"
            f"3. AI service is currently unavailable, this is a general fallback estimate"
        )


def generate_negotiation_email(loan_amount: float, overdue_months: int, debt_stress_level: str, lender_name: str = "Lender", language: str = "English") -> str:
    prompt = f"""
    You are a professional debt negotiation writer. Based on the details below,
    write a polite, professional negotiation EMAIL that the borrower can send to their lender.

    Lender Name: {lender_name}
    Loan Amount: ₹{loan_amount}
    Overdue Months: {overdue_months}
    Debt Stress Level: {debt_stress_level}

    Follow this email format:
    - Subject line
    - Polite greeting
    - Explain the situation (financial hardship)
    - Request a One-Time Settlement (OTS)
    - Professional closing

    Write the complete email, ready to send. {get_language_instruction(language)}
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[AI ERROR - email]: {e}")
        return (
            f"Subject: Request for One-Time Settlement - Loan Account\n\n"
            f"Dear {lender_name},\n\n"
            f"I am writing regarding my outstanding loan of ₹{loan_amount}, which is currently "
            f"{overdue_months} months overdue. Due to financial hardship, I am unable to clear "
            f"the full amount at this time.\n\n"
            f"I would like to request a One-Time Settlement (OTS) arrangement to resolve this "
            f"account. Please let me know a suitable time to discuss this further.\n\n"
            f"Thank you for your understanding.\n\nSincerely,\n[Your Name]"
        )