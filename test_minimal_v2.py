import urllib.request
import urllib.error

try:
    print("Testing connection to http://localhost:8001/...")
    with urllib.request.urlopen("http://localhost:8001/", timeout=5) as response:
        print(f"Status: {response.status}")
        print(f"Body: {response.read().decode('utf-8')}")
except urllib.error.URLError as e:
    print(f"Connection failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
