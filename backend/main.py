from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FinRelief AI backend zinda hai!"}