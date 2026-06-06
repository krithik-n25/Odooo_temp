import requests

def run_test():
    base_url = "http://127.0.0.1:8000"
    
    # Login
    print("Logging in...")
    login_res = requests.post(f"{base_url}/api/auth/login", json={"email": "officer@vendora.com", "password": "password123"})
    print("Login status:", login_res.status_code)
    
    if login_res.status_code != 200:
        print("Login response:", login_res.text)
        return
        
    data = login_res.json()
    token = data.get("token")
    
    print(f"Got token! Length: {len(token)}")
    
    # Create RFQ
    print("Creating RFQ...")
    rfq_payload = {
        "title": "Test RFQ from API",
        "category": "raw_materials",
        "priority": "urgent",
        "deadline": "2026-12-31T23:59:59Z",
        "items": [
            {
                "item_name": "Test Item",
                "quantity": 100,
                "unit": "kg",
                "target_price": 50.0
            }
        ],
        "vendor_ids": []
    }
    create_res = requests.post(f"{base_url}/api/rfqs/", json=rfq_payload, headers={"Authorization": f"Bearer {token}"})
    print("Create Status:", create_res.status_code)
    print("Create Response:", create_res.text)

    # Hit RFQs again
    print("Fetching RFQs...")
    rfq_res = requests.get(f"{base_url}/api/rfqs/", headers={"Authorization": f"Bearer {token}"})
    print("RFQ Status:", rfq_res.status_code)
    if rfq_res.status_code != 200:
        print("RFQ Error Response:", rfq_res.text)
    else:
        print("RFQs length:", len(rfq_res.json()))

if __name__ == "__main__":
    run_test()
