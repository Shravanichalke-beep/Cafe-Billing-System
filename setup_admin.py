import urllib.request
import json

data = json.dumps({"username": "admin", "password": "admin123", "role": "Admin"}).encode('utf-8')
req = urllib.request.Request("http://127.0.0.1:5000/api/auth/register", data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Admin user created successfully:", response.read().decode('utf-8'))
except Exception as e:
    print("Error creating user:", e)
