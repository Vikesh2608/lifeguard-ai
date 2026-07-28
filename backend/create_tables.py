from database import engine
from models import *

Base.metadata.create_all(bind=engine)

print("All LifeGuard AI tables created successfully")