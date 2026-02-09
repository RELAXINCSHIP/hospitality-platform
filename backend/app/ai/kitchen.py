from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger("uvicorn")

class KitchenOptimizer:
    def __init__(self):
        # Station capacities and capabilities
        self.stations = {
            "grill": {"capacity": 10, "current_load": 0},
            "saute": {"capacity": 8, "current_load": 0},
            "fry": {"capacity": 6, "current_load": 0},
            "garde_manger": {"capacity": 12, "current_load": 0},
            "pastry": {"capacity": 5, "current_load": 0}
        }
        
        # Item metadata (prep times in minutes, station affinity)
        # In a real app, this would come from a database
        self.item_registry = {
            "Ribeye 12oz": {"prep_time": 18, "station": "grill", "course": "main"},
            "Risotto": {"prep_time": 20, "station": "saute", "course": "main"},
            "Caesar Salad": {"prep_time": 5, "station": "garde_manger", "course": "appetizer"},
            "Tuna Tartare": {"prep_time": 8, "station": "garde_manger", "course": "appetizer"},
            "Fries": {"prep_time": 6, "station": "fry", "course": "side"},
            "Chocolate Souffle": {"prep_time": 25, "station": "pastry", "course": "dessert"}
        }
        self.completed_items = set()

    def mark_item_complete(self, item_id: str):
        self.completed_items.add(item_id)

    def mark_order_complete(self, items: List[Dict[str, Any]]):
        """
        Marks all items in an order as complete.
        """
        for item in items:
            self.mark_item_complete(str(item.get("item_id", "")))

    def _get_bar_station(self, table_number: Optional[int]) -> str:
        """Route drinks to specific bar based on table number."""
        if table_number is None:
            return "bar"
        if table_number <= 10:
            return "bar 1"
        elif table_number <= 20:
            return "bar 2"
        elif table_number <= 30:
            return "bar 3"
        else:
            return "bar 4"

    def optimize_order(self, items: List[Dict[str, Any]], table_number: Optional[int] = None) -> Dict[str, Any]:
        """
        Calculates fire times and routing for a list of items to ensure
        all items in a course finish simultaneously.
        """
        # Group by course
        courses = {"appetizer": [], "main": [], "dessert": [], "side": [], "drink": []}
        for item in items:
            if item["item_id"] in self.completed_items:
                continue # Skip completed items
            
            name = str(item.get("name", ""))
            # Prefer item metadata over registry
            prep_time = item.get("prep_time")
            if prep_time is None:
                meta = self.item_registry.get(name, {"prep_time": 10})
                prep_time = meta.get("prep_time", 10)
            
            station = item.get("station")
            if not station:
                meta = self.item_registry.get(name, {"station": "grill"})
                station = meta.get("station", "grill")

            course = item.get("course")
            if not course:
                meta = self.item_registry.get(name, {"course": "main"})
                course = meta.get("course", "main")

            # Default to main if unknown course
            course_str = str(course).lower()
            if course_str in ["apps", "appetizers", "appetizer"]:
                course_key = "appetizer"
            elif course_str in ["sides", "side"]:
                course_key = "side"
            elif course_str in ["drinks", "drink", "beverage", "bar"]:
                course_key = "drink"
            elif course_str in ["desserts", "dessert"]:
                course_key = "dessert"
            elif course_str in ["mains", "main", "entree"]:
                course_key = "main"
            else:
                 course_key = "main"
            
            courses[course_key].append({
                **item, 
                "prep_time": prep_time, 
                "station": station, 
                "course": course_key
            })

        optimization_plan = {}
        now = datetime.now()

        # Optimize Main Course (most complex)
        if courses["main"]:
            # Find longest prep time in mains to set the target finish time
            max_prep_time: int = max(int(i.get("prep_time", 10)) for i in courses["main"])
            
            # Logic: We want all mains to FINISH at (now + max_prep_time)
            # So, fire_time = target_finish - item_prep_time
            # We also add a "course delay" if there are appetizers
            
            course_delay = 0
            if courses["appetizer"]:
                # Assume apps take ~15 mins to eat + 5 mins gap
                course_delay = 20 
            
            target_finish_time = now + timedelta(minutes=max_prep_time + course_delay)
            
            for merged_item in courses["main"]:
                prep_time_mins: int = int(merged_item.get("prep_time", 10))
                prep_delta = timedelta(minutes=prep_time_mins)
                fire_time = target_finish_time - prep_delta
                
                # Assign to station & Update load
                station = self._assign_station(str(merged_item.get("station", "grill")))
                item_id = str(merged_item.get("item_id", ""))
                
                optimization_plan[item_id] = {
                    "name": str(merged_item.get("name", "Unknown")),
                    "station": station,
                    "fire_at": fire_time.isoformat(),
                    "prep_time": prep_time_mins,
                    "course": "main"
                }

        # Apps, Sides, and Drinks are fired immediately (or close to it)
        for course_name in ["appetizer", "side", "drink"]:
            for merged_item in courses[course_name]:
                item_id = str(merged_item.get("item_id", ""))
                optimization_plan[item_id] = {
                    "name": str(merged_item.get("name", "Unknown")),
                    "station": str(merged_item.get("station", "garde_manger")),
                    "fire_at": now.isoformat(),
                    "prep_time": int(merged_item.get("prep_time", 5)),
                    "course": course_name
                }
        
        # Desserts fired later (simplified logic)
        for merged_item in courses["dessert"]:
             item_id = str(merged_item.get("item_id", ""))
             # Fire 45 mins from now (simplified)
             fire_time = now + timedelta(minutes=45) 
             optimization_plan[item_id] = {
                "name": str(merged_item.get("name", "Unknown")),
                "station": str(merged_item.get("station", "pastry")),
                "fire_at": fire_time.isoformat(),
                "prep_time": int(merged_item.get("prep_time", 10)),
                "course": "dessert"
            }

        return optimization_plan

    def _assign_station(self, preferred_station: str) -> str:
        """
        Assigns item to preferred station, or load balances if overloaded.
        (Simplified logic)
        """
        # In this v1, we just return the preferred station
        # v2 would check self.stations[preferred_station]["current_load"]
        return preferred_station

kitchen_optimizer = KitchenOptimizer()
