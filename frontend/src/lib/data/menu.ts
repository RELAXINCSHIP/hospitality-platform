export interface MenuItem {
    id: string;
    name: string;
    price: number;
    station: string;
    course: string;
    popular?: boolean;
    upsell?: string;
    prepTime?: string;
    isVip?: boolean;
}

export const MENU_CATEGORIES: Record<string, MenuItem[]> = {
    "Appetizers": [
        { id: "a1", name: "Chicken Tenders", price: 29.00, station: "fry", course: "appetizer", popular: true, prepTime: "15 min" },
        { id: "a2", name: "Tuna Tartare", price: 36.00, station: "garde_manger", course: "appetizer" },
        { id: "a3", name: "Shrimp Cocktail", price: 33.00, station: "garde_manger", course: "appetizer" },
        { id: "a4", name: "Jumbo Crab Cake", price: 35.00, station: "saute", course: "appetizer" },
        { id: "a5", name: "Pigs In A Blanket", price: 26.00, station: "oven", course: "appetizer", popular: true },
        { id: "a6", name: "Caviar Service", price: 131.00, station: "garde_manger", course: "appetizer", upsell: "Vodka shot +$18", isVip: true }
    ],
    "Mains": [
        { id: "m1", name: "Filet Mignon 8oz", price: 77.00, station: "grill", course: "main", popular: true, upsell: "Lobster tail +$45" },
        { id: "m2", name: "Wagyu Tomahawk", price: 225.00, station: "grill", course: "main", isVip: true, prepTime: "45 min" },
        { id: "m3", name: "Lobster Cavatelli", price: 58.00, station: "saute", course: "main" },
        { id: "m4", name: "Roasted Branzino", price: 62.00, station: "grill", course: "main" },
        { id: "m5", name: "Chilean Sea Bass", price: 56.00, station: "saute", course: "main" },
        { id: "m6", name: "Roasted Chicken", price: 48.00, station: "oven", course: "main" },
        { id: "m7", name: "Baby Back Ribs", price: 41.00, station: "grill", course: "main" },
        { id: "m8", name: "Truffle Risotto", price: 59.00, station: "saute", course: "main" }
    ],
    "Sides": [
        { id: "s1", name: "Macaroni Gratinée", price: 24.00, station: "oven", course: "side", popular: true },
        { id: "s2", name: "Famous Carrot Soufflé", price: 18.00, station: "pastry", course: "side" },
        { id: "s3", name: "Mashed Potatoes", price: 16.00, station: "saute", course: "side", upsell: "Lobster +$25" },
        { id: "s4", name: "Roasted Cauliflower", price: 31.00, station: "oven", course: "side" }
    ],
    "Desserts": [
        { id: "d1", name: "Kendall's Slutty Brownie", price: 17.00, station: "pastry", course: "dessert", popular: true },
        { id: "d2", name: "Carrot Cake", price: 16.00, station: "pastry", course: "dessert" },
        { id: "d3", name: "Lemon Pistachio Cheesecake", price: 16.00, station: "pastry", course: "dessert" }
    ],
    "Drinks": [
        { id: "dr1", name: "Caymus Cabernet", price: 45.00, station: "bar", course: "drink" },
        { id: "dr2", name: "Clase Azul Margarita", price: 42.00, station: "bar", course: "drink" },
        { id: "dr3", name: "Delilah Martini", price: 24.00, station: "bar", course: "drink" }
    ]
};
