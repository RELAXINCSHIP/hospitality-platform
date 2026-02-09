from typing import List, Optional
from app.integrations.models import GuestProfile
from uuid import uuid4

class GuestReconciler:
    def __init__(self):
        # In memory store for now
        self.profiles: List[GuestProfile] = []

    def find_profile(self, name: str, email: Optional[str] = None, phone: Optional[str] = None) -> Optional[GuestProfile]:
        """
        Finds a profile based on email, phone, or name similarity.
        """
        for profile in self.profiles:
            if email and profile.email == email:
                return profile
            if phone and profile.phone == phone:
                return profile
            # simplistic name match
            if profile.name.lower() == name.lower():
                return profile
        return None

    def reconcile(self, incoming_data: dict) -> GuestProfile:
        """
        Merges incoming data with existing profile or creates a new one.
        """
        name = incoming_data.get("name", "Unknown Guest")
        email = incoming_data.get("email")
        phone = incoming_data.get("phone")
        
        # Ensure name is a string for find_profile
        if not isinstance(name, str):
            name = "Unknown Guest"
        
        profile = self.find_profile(name, email, phone)
        
        if not profile:
            # Create new
            profile = GuestProfile(
                id=uuid4(),
                name=name,
                email=email,
                phone=phone,
                vip_status=incoming_data.get("vip_status", False),
                preferences=incoming_data.get("preferences", {})
            )
            self.profiles.append(profile)
        else:
            # Update existing
            if email: profile.email = email
            if phone: profile.phone = phone
            # Merge preferences
            if "preferences" in incoming_data:
                profile.preferences.update(incoming_data["preferences"])
            # Update spend
            if "spend" in incoming_data:
                profile.lifetime_spend += incoming_data["spend"]
                
        return profile

reconciler = GuestReconciler()
