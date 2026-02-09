import os
import vertexai
from vertexai.generative_models import GenerativeModel
from typing import List, Dict, Any
import random
import logging

logger = logging.getLogger("uvicorn")

class AIEngine:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "hospitality-ai-dev")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        self.model = None
        self._init_vertex()

    def _init_vertex(self):
        try:
            vertexai.init(project=self.project_id, location=self.location)
            self.model = GenerativeModel("gemini-1.5-pro-preview-0409")
            logger.info(f"Vertex AI initialized for project {self.project_id}")
        except Exception as e:
            logger.warning(f"Failed to initialize Vertex AI: {e}. Running in MOCK mode.")

    async def generate_insight(self, context: str) -> Dict[str, Any]:
        """
        Generates an insight based on context using Gemini.
        Falls back to mock data if Vertex AI is not available.
        """
        if self.model is not None:
            try:
                # Real Gemini Call
                model = self.model  # Local binding for type narrowing
                response = await model.generate_content_async(
                    f"Generate a brief, actionable executive insight for a premium restaurant manager regarding '{context}'. "
                    "Format as JSON with 'title' and 'detail' fields."
                )
                # In a real app we'd need robust JSON parsing here as LLMs can be chatty
                # For this demo, we'll assume the model behaves or return a safe fallback
                return {"title": "AI Generated Insight", "detail": response.text[:100] + "..."}
            except Exception as e:
                logger.error(f"Error generating insight: {e}")
                # Fallthrough to mock
        
        # Mocked Gemini Response (Fallback)
        prompts = [
            {"title": "Ribeye Margins Declining", "detail": "Supplier price increased 15%. Recommend adjusting menu price to $68."},
            {"title": "High Vibe Detected", "detail": "Patio section sentiment is 98% positive. \"Great playlist\" mentioned 4x."},
            {"title": "Labor Optimization", "detail": "Rain forecast for Tuesday. Suggest cutting 2 server shifts."},
            {"title": "Inventory Alert", "detail": "Truffle oil usage 20% above projection. Check for spillage or theft."},
        ]
        return random.choice(prompts)

    async def optimize_kitchen_routing(self, order_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Optimizes routing for kitchen items.
        """
        # Mock logic (Optimization usually uses custom models/heuristics, not just LLMs)
        return {
            "routing": "parallel",
            "fire_times": {item["item_id"]: "immediate" for item in order_items}
        }

ai_engine = AIEngine()

