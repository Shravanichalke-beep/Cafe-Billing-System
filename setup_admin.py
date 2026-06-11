import urllib.request
import json

data = json.dumps({"username": "admin", "password": "admin123", "role": "Admin"}).encode('utf-8')
req = urllib.request.Request("http://dashboard.render.com/web/srv-d8l5afflk1mc73cj48fg/api/auth/register", data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Admin user created successfully:", response.read().decode('utf-8'))
except Exception as e:
    print("Error creating user:", e)
