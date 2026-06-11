import urllib.request
import json

data = json.dumps({"username": "shravani", "password": "shravani98", "role": "Admin"}).encode('utf-8')
req = urllib.request.Request("https://cafe-billing-system-pcd5.onrender.com/api/auth/register", data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Admin user created successfully:", response.read().decode('utf-8'))
except Exception as e:
    print("Error creating user:", e)
