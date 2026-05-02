import requests

BASE_URL = "http://localhost:8000/api"

def test_register():
    print("Testing Registration...")
    data = {
        "email": "test@example.com",
        "password": "password123",
        "role": "STUDENT",
        "first_name": "Test",
        "last_name": "User",
        "university_id": "123",
        "wilaya": "Algiers",
        "phone": "0123456789"
    }
    response = requests.post(f"{BASE_URL}/auth/register/", json=data)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")

def test_login():
    print("\nTesting Login...")
    data = {
        "username": "test@example.com",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")

if __name__ == "__main__":
    try:
        test_register()
        test_login()
    except Exception as e:
        print(f"Error: {e}")
