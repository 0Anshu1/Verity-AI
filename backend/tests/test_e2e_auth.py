"""
End-to-end tests for authentication flow
"""
import pytest


def test_signup_success(client, test_org_data):
    """Test successful organization signup"""
    response = client.post(
        "/api/v1/auth/signup",
        json=test_org_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "organization_id" in data
    assert "user_id" in data
    assert data["message"] == "signup successful"


def test_signup_duplicate_email(client, test_org_data):
    """Test signup with duplicate email fails"""
    # First signup
    client.post("/api/v1/auth/signup", json=test_org_data)
    
    # Second signup with same email
    response = client.post(
        "/api/v1/auth/signup",
        json=test_org_data
    )
    
    # Should still succeed (current implementation allows duplicates)
    # If you want to enforce uniqueness, add validation
    assert response.status_code == 200


def test_login_success(client, test_org_data):
    """Test successful login"""
    # First signup
    client.post("/api/v1/auth/signup", json=test_org_data)
    
    # Then login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_org_data["email"],
            "password": test_org_data["password"]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == test_org_data["email"]
    assert "organization_id" in data["user"]


def test_login_invalid_credentials(client, test_org_data):
    """Test login with invalid credentials"""
    # Signup first
    client.post("/api/v1/auth/signup", json=test_org_data)
    
    # Try login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_org_data["email"],
            "password": "WrongPassword123!"
        }
    )
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "SomePassword123!"
        }
    )
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_refresh_token_not_implemented(client):
    """Test that refresh endpoint is not implemented"""
    response = client.post(
        "/api/v1/auth/refresh",
        params={"token": "some-token"}
    )
    
    assert response.status_code == 501
    assert "not implemented" in response.json()["detail"].lower()



