import httpx
import os
from typing import List, Dict, Any
from app.integrations.models import Order, OrderItem
import logging

logger = logging.getLogger("uvicorn")

class ToastClient:
    def __init__(self):
        self.base_url = os.getenv("TOAST_API_URL", "https://ws-sandbox-api.toasttab.com")
        self.client_id = os.getenv("TOAST_CLIENT_ID", "mock_client_id")
        self.client_secret = os.getenv("TOAST_CLIENT_SECRET", "mock_client_secret")
        self.restaurant_guid = os.getenv("TOAST_RESTAURANT_GUID", "mock_restaurant_guid")
        self.token = None
        self.active_orders = []

    async def _get_token(self):
        # In a real scenario, this would exchange client_id/secret for a bearer token
        # For now, we'll return a mock token
        return "mock_bearer_token"

    async def get_orders(self) -> List[Order]:
        """
        Fetches recent orders from Toast.
        """
        # Verification: If in mock mode, return generated data
        if self.client_id == "mock_client_id":
             if not self.active_orders:
                 self.active_orders = self._mock_orders()
             return self.active_orders

        try:
            token = await self._get_token()
            headers = {"Authorization": f"Bearer {token}", "Toast-Restaurant-External-ID": self.restaurant_guid}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/orders/v2/orders", headers=headers)
                response.raise_for_status()
                data = response.json()
                return [self._map_to_order(o) for o in data]
        except Exception as e:
            logger.error(f"Failed to fetch Toast orders: {e}")
            return []

    def add_order(self, order: Order):
        """
        Manually add an order (for Tablet UI / Testing).
        """
        self.active_orders.append(order)
        return order

    def _map_to_order(self, data: Dict[str, Any]) -> Order:
        """
        Maps Toast JSON schema to our unified Order model.
        """
        # This is a simplified mapping. Real Toast schema is complex.
        items = []
        for check in data.get("checks", []):
            for selection in check.get("selections", []):
                items.append(OrderItem(
                    item_id=str(selection.get("itemGuid")),
                    name=selection.get("displayName", "Unknown Item"),
                    quantity=selection.get("quantity", 1),
                    price=selection.get("price", 0.0),
                    special_requests=selection.get("modifiers", [])
                ))

        return Order(
            id=data.get("guid"),
            source="toast",
            table_number=data.get("table", {}).get("id"), # Simplified
            guest_count=data.get("guestCount", 1),
            items=items,
            total_amount=data.get("totalAmount", 0.0),
            status=data.get("voided") and "voided" or "open", # Simplified status logic
            server=data.get("server", {}).get("displayName") # Map server name if available
        )

    def _mock_orders(self) -> List[Order]:
        """
        Generates realistic mock orders for testing/demo.
        """
        return []

toast_client = ToastClient()
