import requests
try:
    print("Testing connection to http://127.0.0.1:9000/health...")
    response = requests.get("http://127.0.0.1:9000/health", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Connection failed: {e}")
