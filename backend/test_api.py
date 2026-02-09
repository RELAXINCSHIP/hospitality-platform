import httpx
import asyncio
import json

async def test_order_flow():
    base_url = "http://localhost:8000/api/v1/integrations"
    
    # 1. Create a Manual Order
    order_payload = {
        "id": "ord-python-test-1",
        "source": "manual",
        "table_number": 88,
        "guest_count": 2,
        "total_amount": 55.0,
        "status": "open",
        "items": [
            {
                "item_id": "i1",
                "name": "Ribeye 12oz",
                "quantity": 1,
                "price": 40.0,
                "special_requests": ["Medium Rare"]
            },
            {
                "item_id": "i2",
                "name": "Caesar Salad",
                "quantity": 1,
                "price": 15.0,
                "special_requests": []
            }
        ]
    }
    
    print(f"Sending Order to {base_url}/orders...")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{base_url}/orders", json=order_payload)
            print(f"POST /orders Status: {resp.status_code}")
            if resp.status_code != 200:
                print(f"Error: {resp.text}")
                return

            print("Order created successfully.")
            
            # 2. Verify it appears in Kitchen Queue
            print(f"Fetching Kitchen Queue from {base_url}/kitchen/queue...")
            resp = await client.get(f"{base_url}/kitchen/queue")
            print(f"GET /kitchen/queue Status: {resp.status_code}")
            
            queue = resp.json()
            found = False
            for order in queue:
                if order["order_id"] == "ord-python-test-1":
                    found = True
                    print("SUCCESS: Order found in Kitchen Queue!")
                    print(json.dumps(order, indent=2))
                    break
            
            if not found:
                print("FAILURE: Order NOT found in Kitchen Queue.")
                print("Current Queue:", json.dumps(queue, indent=2))
                
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_order_flow())
