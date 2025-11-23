import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
UPLOADS_DIR = os.getenv('UPLOADS_DIR', './uploads')
DEV = os.getenv('DEV', 'true').lower() in ('1','true','yes')
