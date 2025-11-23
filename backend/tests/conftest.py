"""
Pytest configuration and fixtures for E2E tests
"""
import pytest
import os
import tempfile
import shutil
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db import get_db
from app.models import Base

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"
TEST_UPLOADS_DIR = tempfile.mkdtemp()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    # Override uploads directory
    original_uploads = os.environ.get("UPLOADS_DIR")
    os.environ["UPLOADS_DIR"] = TEST_UPLOADS_DIR
    os.makedirs(TEST_UPLOADS_DIR, exist_ok=True)
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    
    yield client
    
    # Cleanup
    app.dependency_overrides.clear()
    if original_uploads:
        os.environ["UPLOADS_DIR"] = original_uploads
    shutil.rmtree(TEST_UPLOADS_DIR, ignore_errors=True)


@pytest.fixture
def test_org_data():
    """Test organization data"""
    return {
        "email": "test@example.com",
        "password": "Test123!",
        "org_name": "Test Organization"
    }


@pytest.fixture
def test_customer_data():
    """Test customer data"""
    return {
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "customer_phone": "+1234567890",
        "user_info": {
            "fullName": "John Doe",
            "dateOfBirth": "1990-05-15",
            "phone": "+1234567890",
            "address": "123 Test St, Test City, TC 12345"
        }
    }



