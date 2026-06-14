from models.shopping import ShoppingCategory

# Keyword → category mapping (German + English terms, lowercase)
_KEYWORDS: dict[ShoppingCategory, list[str]] = {
    ShoppingCategory.dairy: [
        "milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "quark",
        "kefir", "sour cream", "cottage cheese", "mozzarella", "brie", "gouda",
        "cheddar", "parmesan", "feta", "ricotta", "skyr",
        "milch", "käse", "joghurt", "sahne", "schmand", "buttermilch",
        "frischkäse", "schlagsahne", "kaffeesahne",
    ],
    ShoppingCategory.meat: [
        "chicken", "beef", "steak", "sausage", "pork", "lamb", "turkey",
        "bacon", "ham", "salami", "pepperoni", "mince", "minced", "fish",
        "salmon", "tuna", "shrimp", "prawns", "cod", "tilapia", "herring",
        "hähnchen", "huhn", "rindfleisch", "rind", "wurst", "schweinefilet",
        "schwein", "schweinefleisch", "lamm", "truthahn", "pute", "speck",
        "schinken", "hackfleisch", "fisch", "lachs", "thunfisch", "garnelen",
        "hering", "forelle", "kabeljau",
    ],
    ShoppingCategory.vegetables_fruits: [
        "tomato", "apple", "spinach", "banana", "carrot", "onion", "garlic",
        "broccoli", "lettuce", "cucumber", "zucchini", "potato", "lemon",
        "orange", "strawberry", "blueberry", "grape", "pear", "peach", "mango",
        "pineapple", "avocado", "mushroom", "celery", "asparagus", "radish",
        "cabbage", "cauliflower", "leek", "corn", "pumpkin", "melon",
        "tomate", "apfel", "spinat", "banane", "karotte", "möhre", "zwiebel",
        "knoblauch", "brokkoli", "salat", "gurke", "paprika", "kartoffel",
        "zitrone", "erdbeere", "heidelbeere", "traube", "birne", "pfirsich",
        "pilz", "champignon", "sellerie", "spargel", "lauch", "kohl",
        "blumenkohl", "kürbis", "mais", "radieschen", "melone",
    ],
    ShoppingCategory.spices: [
        "pepper", "salt", "cumin", "paprika", "cinnamon", "oregano", "basil",
        "thyme", "rosemary", "turmeric", "ginger", "nutmeg", "cloves",
        "cardamom", "chili", "curry", "mustard", "bay leaf", "dill", "parsley",
        "vanilla", "saffron", "anise", "fennel seed",
        "pfeffer", "salz", "kreuzkümmel", "paprikapulver", "zimt", "lorbeer",
        "thymian", "rosmarin", "kurkuma", "ingwer", "muskat", "nelken",
        "kardamom", "senf", "dill", "petersilie", "schnittlauch", "anis",
    ],
    ShoppingCategory.household: [
        "detergent", "sponge", "toilet paper", "soap", "shampoo", "conditioner",
        "toothpaste", "toothbrush", "dish soap", "laundry", "bleach", "mop",
        "broom", "trash bag", "garbage bag", "paper towel", "tissue",
        "cleaning", "disinfectant", "deodorant", "razor", "cotton pad",
        "waschmittel", "schwamm", "toilettenpapier", "seife", "spülmittel",
        "zahnpasta", "zahnbürste", "weichspüler", "bleichmittel", "besen",
        "mülltüte", "müllbeutel", "küchenrolle", "taschentuch", "reiniger",
        "desinfektionsmittel", "deo", "rasierer", "wattepads",
    ],
}


def auto_categorize(item_name: str) -> ShoppingCategory:
    name_lower = item_name.lower()
    for category, keywords in _KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return category
    return ShoppingCategory.other
