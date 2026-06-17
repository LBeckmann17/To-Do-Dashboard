from models.shopping import ShoppingCategory

# Keyword → category mapping (German + English terms, lowercase)
_KEYWORDS: dict[ShoppingCategory, list[str]] = {
    ShoppingCategory.dairy: [
        "milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "quark",
        "kefir", "sour cream", "cottage cheese", "mozzarella", "brie", "gouda",
        "cheddar", "parmesan", "feta", "ricotta", "skyr",
        "milch", "käse", "joghurt", "sahne", "schmand", "buttermilch",
        "frischkäse", "schlagsahne", "kaffeesahne", "hüttenkäse",
    ],
    ShoppingCategory.meat: [
        "chicken", "beef", "steak", "sausage", "pork", "lamb", "turkey",
        "bacon", "ham", "salami", "pepperoni", "mince", "minced", "fish",
        "salmon", "tuna", "shrimp", "prawns", "cod", "tilapia", "herring",
        "hähnchen", "huhn", "rindfleisch", "rind", "wurst", "schweinefilet",
        "schwein", "schweinefleisch", "lamm", "truthahn", "pute", "speck",
        "schinken", "hackfleisch", "fisch", "lachs", "thunfisch", "garnelen",
        "hering", "forelle", "kabeljau", "mettwurst", "leberwurst", "bratwurst",
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
        "blumenkohl", "kürbis", "mais", "radieschen", "melone", "obst", "gemüse",
    ],
    ShoppingCategory.bakery: [
        "bread", "roll", "bun", "croissant", "baguette", "cake", "muffin",
        "toast", "bagel", "pretzel", "waffle", "pancake", "brioche",
        "brot", "brötchen", "semmel", "croissant", "kuchen", "toastbrot",
        "brezel", "waffel", "pfannkuchen", "baguette", "ciabatta", "laugenbrezel",
        "hefezopf", "stollen", "mohnbrötchen", "körnerbrötchen", "vollkornbrot",
    ],
    ShoppingCategory.beverages: [
        "water", "juice", "beer", "wine", "soda", "cola", "coffee", "tea",
        "milk drink", "smoothie", "lemonade", "energy drink", "sparkling",
        "wasser", "saft", "bier", "wein", "limonade", "kaffee", "tee",
        "sprudel", "mineralwasser", "orangensaft", "apfelsaft", "traubensaft",
        "softdrink", "energy", "kakao", "malzbier", "radler", "sekt", "prosecco",
    ],
    ShoppingCategory.frozen: [
        "frozen", "ice cream", "gelato", "sorbet", "popsicle",
        "tiefkühl", "tk-", "eis", "gefrorene", "gefrorenes", "pizza tiefkühl",
        "tk pizza", "tk gemüse", "tk erbsen", "tk bohnen", "tiefkühlpizza",
        "tiefkühlgemüse", "fischstäbchen", "pommes", "nuggets",
    ],
    ShoppingCategory.snacks: [
        "chips", "crisps", "popcorn", "chocolate", "candy", "sweets",
        "cookie", "biscuit", "cracker", "pretzel stick", "gummy", "lollipop",
        "schokolade", "bonbon", "süßigkeit", "keks", "plätzchen", "waffel snack",
        "gummibärchen", "lakritz", "schokoriegel", "müsliriegel", "nüsse",
        "cashew", "erdnuss", "mandel", "pistazien", "studentenfutter",
        "haribo", "snickers", "twix", "kitkat",
    ],
    ShoppingCategory.pantry: [
        "pasta", "rice", "flour", "oil", "sugar", "salt", "vinegar",
        "can", "canned", "jar", "lentils", "beans", "chickpeas", "oats",
        "cereal", "granola", "honey", "jam", "peanut butter", "sauce", "ketchup",
        "nudeln", "reis", "mehl", "öl", "zucker", "essig", "dose", "konserve",
        "linsen", "bohnen", "kichererbsen", "haferflocken", "müsli", "honig",
        "marmelade", "tomatenmark", "soße", "ketchup", "mayo", "mayonnaise",
        "senf", "olivenöl", "rapsöl", "kokosöl", "backpulver", "hefe",
    ],
    ShoppingCategory.spices: [
        "pepper", "cumin", "paprika spice", "cinnamon", "oregano", "basil",
        "thyme", "rosemary", "turmeric", "ginger", "nutmeg", "cloves",
        "cardamom", "chili", "curry", "mustard seed", "bay leaf", "dill", "parsley",
        "vanilla", "saffron", "anise", "fennel seed",
        "pfeffer", "kreuzkümmel", "paprikapulver", "zimt", "lorbeer",
        "thymian", "rosmarin", "kurkuma", "ingwer", "muskat", "nelken",
        "kardamom", "dill", "petersilie", "schnittlauch", "anis", "gewürz",
    ],
    ShoppingCategory.drugstore: [
        "shampoo", "conditioner", "toothpaste", "toothbrush", "soap",
        "deodorant", "razor", "cotton pad", "sunscreen", "vitamin", "supplement",
        "medicine", "painkiller", "aspirin", "ibuprofen", "bandage", "plaster",
        "zahnpasta", "zahnbürste", "seife", "deo", "rasierer", "wattepads",
        "sonnencreme", "vitamin", "nahrungsergänzung", "medikament", "tablette",
        "ibuprofen", "aspirin", "pflaster", "verband", "lippenpflege", "lotion",
        "parfüm", "nagellack", "wattestäbchen", "q-tips",
    ],
    ShoppingCategory.household: [
        "detergent", "sponge", "toilet paper", "dish soap", "laundry",
        "bleach", "mop", "broom", "trash bag", "garbage bag", "paper towel",
        "tissue", "cleaning", "disinfectant",
        "waschmittel", "schwamm", "toilettenpapier", "spülmittel",
        "weichspüler", "bleichmittel", "besen", "mülltüte", "müllbeutel",
        "küchenrolle", "taschentuch", "reiniger", "desinfektionsmittel",
        "putzmittel", "abwasch", "spülmaschine", "tabs", "geschirrspülmittel",
    ],
}


def auto_categorize(item_name: str) -> ShoppingCategory:
    name_lower = item_name.lower()
    for category, keywords in _KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return category
    return ShoppingCategory.other
