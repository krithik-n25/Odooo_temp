from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (auth, vendors, rfqs, quotations, approvals,
                          purchase_orders, invoices, negotiations,
                          analytics, notifications, utility)

app = FastAPI(title="VENDORA API", version="1.0.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(auth.router,           prefix="/api/auth", tags=["auth"])
app.include_router(vendors.router,        prefix="/api/vendors", tags=["vendors"])
app.include_router(rfqs.router,           prefix="/api/rfqs", tags=["rfqs"])
app.include_router(quotations.router,     prefix="/api/quotations", tags=["quotations"])
app.include_router(approvals.router,      prefix="/api/approvals", tags=["approvals"])
app.include_router(purchase_orders.router,prefix="/api/purchase-orders", tags=["purchase-orders"])
app.include_router(invoices.router,       prefix="/api/invoices", tags=["invoices"])
app.include_router(negotiations.router,   prefix="/api/threads", tags=["threads"])
app.include_router(analytics.router,      prefix="/api/analytics", tags=["analytics"])
app.include_router(notifications.router,  prefix="/api/notifications", tags=["notifications"])
app.include_router(utility.router,        prefix="/api", tags=["utility"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Vendora API"}
