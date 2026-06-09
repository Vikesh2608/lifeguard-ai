from fastapi import FastAPI

app = FastAPI(
    title="LifeGuard AI",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to LifeGuard AI"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "LifeGuard AI"
    }