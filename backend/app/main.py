from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router import *
app = FastAPI(title="Booking site", version ="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
                   "http://localhost:3000"
                   ],  # Allow all origins for development
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# cd limo_booking/backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

app.include_router(book.router)
app.include_router(user.router)
app.include_router(admins.router)
app.include_router(auths.router)

