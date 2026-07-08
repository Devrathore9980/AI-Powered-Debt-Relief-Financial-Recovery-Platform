# Project Testing

## Manual Testing Done
- ✅ User registration & login
- ✅ Add loan → AI negotiation strategy generated
- ✅ Settlement prediction (rule-based risk scoring)
- ✅ Negotiation email generation
- ✅ AI Strategy History & Debt Timeline display correctly
- ✅ Delete loan / Delete account
- ✅ Forgot password flow

## Bugs Found & Fixed
- CORS policy blocking Vercel frontend → fixed by adding frontend origin in `main.py`
- `grpcio-status` dependency conflict on Render → fixed by removing pinned versions in `requirements.txt`
- Case-sensitive import error (`Landing` vs `landing`) on Linux deployment → fixed import path