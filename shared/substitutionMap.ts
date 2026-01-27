// Ingredient category weights for weighted scoring
export const INGREDIENT_WEIGHTS = {
  key: 10,       // Key ingredients: main protein, dish base (chicken, pasta, rice)
  important: 5,  // Important: vegetables, sauces, cheeses, significant additions
  flavor: 2,     // Flavor: spices, herbs, seasonings (except base)
  base: 0        // Base: salt, pepper, oil, water - NOT counted in score
} as const;

// Match type multipliers
export const MATCH_MULTIPLIERS = {
  exact: 1.0,      // Exact match: "chicken" = "chicken"
  substitute: 0.7, // Substitute: sour cream → yogurt (from substitutes list)
  partial: 0.5,    // Partial: parmesan → any hard cheese (general category)
  none: 0          // No match
} as const;

// Weight multiplier for baseIngredients matches (from user profile)
// Main ingredients get full weight (1.0), base ingredients get reduced weight
export const BASE_INGREDIENT_WEIGHT = 0.3;

// Minimum score threshold to show recipe
export const MIN_SCORE_THRESHOLD = 40;

// Require at least one key ingredient to match
export const REQUIRE_KEY_INGREDIENT = true;

// Bonus for having all key ingredients
export const ALL_KEYS_BONUS = 10;

// Popular ingredient substitutions map
export const SUBSTITUTION_MAP: Record<string, string[]> = {
  // Dairy
  "sour cream": ["greek yogurt", "plain yogurt", "cream cheese", "cottage cheese", "creme fraiche"],
  "heavy cream": ["coconut cream", "evaporated milk", "half and half", "milk and butter"],
  "milk": ["almond milk", "oat milk", "soy milk", "coconut milk"],
  "butter": ["margarine", "coconut oil", "olive oil", "ghee"],
  "yogurt": ["sour cream", "kefir", "buttermilk", "cottage cheese"],
  "greek yogurt": ["sour cream", "plain yogurt", "cottage cheese"],
  "cream cheese": ["mascarpone", "ricotta", "neufchatel", "cottage cheese"],
  "parmesan": ["pecorino", "grana padano", "asiago", "aged cheddar", "romano"],
  "mozzarella": ["provolone", "monterey jack", "gouda", "fontina"],
  "cheddar": ["colby", "monterey jack", "gouda", "gruyere"],
  "feta": ["goat cheese", "queso fresco", "cotija", "ricotta salata"],
  "ricotta": ["cottage cheese", "cream cheese", "mascarpone"],

  // Proteins - Poultry
  "chicken breast": ["turkey breast", "pork tenderloin", "tofu", "seitan", "chicken thighs"],
  "chicken thighs": ["chicken breast", "turkey thighs", "duck", "pork chops"],
  "ground chicken": ["ground turkey", "ground pork", "plant-based ground"],
  "turkey": ["chicken", "duck", "pork"],
  "duck": ["chicken", "turkey", "goose"],

  // Proteins - Beef
  "ground beef": ["ground turkey", "ground pork", "ground lamb", "plant-based meat"],
  "beef tenderloin": ["pork tenderloin", "lamb loin", "ribeye"],
  "steak": ["pork chops", "lamb chops", "portobello mushroom"],
  "ribeye": ["new york strip", "sirloin", "tenderloin"],

  // Proteins - Pork
  "pork": ["chicken", "turkey", "beef"],
  "pork chops": ["chicken breast", "turkey cutlets", "veal cutlets"],
  "bacon": ["pancetta", "turkey bacon", "prosciutto", "ham"],
  "ham": ["turkey ham", "prosciutto", "canadian bacon"],
  "sausage": ["chorizo", "turkey sausage", "chicken sausage", "plant-based sausage"],

  // Proteins - Seafood
  "salmon": ["trout", "arctic char", "steelhead", "tuna"],
  "cod": ["haddock", "pollock", "tilapia", "halibut"],
  "tilapia": ["cod", "sole", "flounder", "catfish"],
  "tuna": ["salmon", "swordfish", "mahi mahi"],
  "shrimp": ["prawns", "scallops", "lobster", "crab"],

  // Proteins - Plant-based
  "tofu": ["tempeh", "seitan", "paneer", "chicken breast"],
  "tempeh": ["tofu", "seitan", "jackfruit"],

  // Grains
  "rice": ["quinoa", "bulgur", "couscous", "farro", "barley"],
  "basmati rice": ["jasmine rice", "long grain rice", "brown rice"],
  "quinoa": ["rice", "couscous", "bulgur", "millet"],
  "pasta": ["rice noodles", "egg noodles", "zucchini noodles", "spaghetti squash"],
  "spaghetti": ["linguine", "fettuccine", "angel hair", "bucatini"],
  "penne": ["rigatoni", "ziti", "fusilli", "farfalle"],
  "bread": ["tortilla", "pita", "naan", "flatbread"],
  "breadcrumbs": ["panko", "crushed crackers", "crushed cornflakes"],

  // Vegetables
  "onion": ["shallot", "leek", "green onion", "red onion"],
  "shallot": ["onion", "green onion", "leek"],
  "garlic": ["garlic powder", "shallots", "garlic paste"],
  "tomato": ["canned tomatoes", "sun-dried tomatoes", "tomato paste"],
  "bell pepper": ["poblano", "anaheim pepper", "cubanelle"],
  "spinach": ["kale", "swiss chard", "arugula", "collard greens"],
  "kale": ["spinach", "collard greens", "swiss chard"],
  "zucchini": ["yellow squash", "cucumber", "eggplant"],
  "eggplant": ["zucchini", "portobello mushroom", "tofu"],
  "broccoli": ["cauliflower", "broccolini", "green beans"],
  "cauliflower": ["broccoli", "romanesco", "kohlrabi"],
  "potato": ["sweet potato", "turnip", "parsnip", "celery root"],
  "sweet potato": ["butternut squash", "pumpkin", "regular potato"],
  "carrot": ["parsnip", "sweet potato", "butternut squash"],
  "celery": ["fennel", "celery root", "bok choy stems"],
  "mushrooms": ["portobello", "shiitake", "cremini", "button mushrooms"],
  "asparagus": ["green beans", "broccoli", "snap peas"],
  "corn": ["peas", "edamame", "lima beans"],
  "peas": ["edamame", "corn", "green beans"],
  "cucumber": ["zucchini", "jicama", "celery"],
  "avocado": ["mashed banana", "hummus", "tahini"],
  "lettuce": ["spinach", "arugula", "cabbage", "kale"],
  "cabbage": ["napa cabbage", "brussels sprouts", "kale"],

  // Beans and legumes
  "chickpeas": ["white beans", "cannellini beans", "navy beans"],
  "black beans": ["kidney beans", "pinto beans", "lentils"],
  "kidney beans": ["black beans", "pinto beans", "cannellini beans"],
  "lentils": ["split peas", "beans", "chickpeas"],
  "white beans": ["cannellini beans", "navy beans", "chickpeas"],

  // Herbs
  "basil": ["oregano", "parsley", "cilantro", "mint"],
  "cilantro": ["parsley", "basil", "dill"],
  "parsley": ["cilantro", "chervil", "celery leaves"],
  "dill": ["fennel fronds", "tarragon", "parsley"],
  "mint": ["basil", "parsley"],
  "rosemary": ["thyme", "oregano", "sage"],
  "thyme": ["oregano", "rosemary", "marjoram"],
  "oregano": ["basil", "thyme", "marjoram"],
  "sage": ["rosemary", "thyme", "marjoram"],

  // Spices
  "cumin": ["coriander", "caraway", "chili powder"],
  "paprika": ["cayenne", "chili powder", "smoked paprika"],
  "smoked paprika": ["chipotle powder", "regular paprika", "liquid smoke"],
  "curry powder": ["garam masala", "cumin and turmeric", "madras curry"],
  "garam masala": ["curry powder", "allspice", "cumin and coriander"],
  "cinnamon": ["nutmeg", "allspice", "cardamom"],
  "nutmeg": ["mace", "cinnamon", "allspice"],
  "ginger": ["galangal", "turmeric", "cardamom"],
  "turmeric": ["saffron", "curry powder", "ginger"],
  "cayenne": ["red pepper flakes", "hot paprika", "chili powder"],

  // Acids and vinegars
  "lemon": ["lime", "white wine vinegar", "lemon juice"],
  "lime": ["lemon", "rice vinegar", "lime juice"],
  "lemon juice": ["lime juice", "white wine vinegar", "citric acid"],
  "lime juice": ["lemon juice", "orange juice", "vinegar"],
  "white wine vinegar": ["apple cider vinegar", "champagne vinegar", "lemon juice"],
  "balsamic vinegar": ["red wine vinegar", "sherry vinegar", "pomegranate molasses"],
  "rice vinegar": ["apple cider vinegar", "white wine vinegar", "lime juice"],
  "apple cider vinegar": ["white wine vinegar", "rice vinegar", "lemon juice"],

  // Sauces and condiments
  "soy sauce": ["tamari", "coconut aminos", "worcestershire sauce", "liquid aminos"],
  "tamari": ["soy sauce", "coconut aminos", "fish sauce"],
  "fish sauce": ["soy sauce", "worcestershire sauce", "anchovy paste"],
  "worcestershire sauce": ["soy sauce", "balsamic vinegar", "fish sauce"],
  "oyster sauce": ["hoisin sauce", "soy sauce with sugar", "mushroom sauce"],
  "hoisin sauce": ["oyster sauce", "teriyaki sauce", "plum sauce"],
  "teriyaki": ["soy sauce with sugar", "hoisin", "oyster sauce"],
  "hot sauce": ["sriracha", "cayenne", "chili flakes", "tabasco"],
  "sriracha": ["hot sauce", "sambal oelek", "gochujang", "chili garlic sauce"],
  "tomato paste": ["tomato sauce", "ketchup", "sun-dried tomatoes"],
  "tomato sauce": ["crushed tomatoes", "tomato paste with water", "marinara"],
  "tomato purée": ["tomato paste", "crushed tomatoes", "tomato sauce", "canned tomatoes"],
  "tomato puree": ["tomato paste", "crushed tomatoes", "tomato sauce", "canned tomatoes"],
  "passata": ["tomato paste", "crushed tomatoes", "tomato purée", "tomato sauce"],
  "crushed tomatoes": ["tomato sauce", "tomato purée", "diced tomatoes", "tomato paste with water"],
  "mustard": ["dijon mustard", "honey mustard", "mustard powder"],
  "mayonnaise": ["greek yogurt", "sour cream", "aioli", "avocado"],

  // Broths and stocks
  "chicken broth": ["vegetable broth", "beef broth", "bouillon", "water with bouillon cube"],
  "beef broth": ["vegetable broth", "mushroom broth", "red wine"],
  "vegetable broth": ["chicken broth", "water with bouillon", "mushroom broth"],

  // Oils
  "olive oil": ["vegetable oil", "avocado oil", "grapeseed oil", "canola oil"],
  "vegetable oil": ["canola oil", "corn oil", "sunflower oil", "olive oil"],
  "sesame oil": ["peanut oil", "vegetable oil with sesame seeds"],
  "coconut oil": ["butter", "vegetable oil", "ghee"],

  // Sweeteners
  "sugar": ["honey", "maple syrup", "agave", "coconut sugar"],
  "brown sugar": ["white sugar with molasses", "coconut sugar", "maple syrup"],
  "honey": ["maple syrup", "agave", "golden syrup", "sugar"],
  "maple syrup": ["honey", "agave", "brown sugar syrup"],

  // Nuts
  "almonds": ["cashews", "walnuts", "pecans", "hazelnuts"],
  "walnuts": ["pecans", "almonds", "hazelnuts"],
  "cashews": ["macadamia", "almonds", "pine nuts"],
  "pine nuts": ["walnuts", "almonds", "sunflower seeds", "cashews"],
  "peanuts": ["almonds", "cashews", "sunflower seeds"],

  // Eggs
  "eggs": ["flax egg", "chia egg", "applesauce", "mashed banana", "aquafaba"],

  // Wine
  "white wine": ["chicken broth", "white grape juice", "dry vermouth"],
  "red wine": ["beef broth", "grape juice", "cranberry juice"],

  // Misc
  "cornstarch": ["flour", "arrowroot", "potato starch", "tapioca starch"],
  "flour": ["almond flour", "coconut flour", "oat flour", "gluten-free flour"],
  "coconut milk": ["heavy cream", "almond milk", "cashew cream"]
};

// Rules for auto-categorization of ingredients
export const CATEGORY_RULES = {
  key: [
    "chicken", "beef", "pork", "fish", "salmon", "shrimp", "tofu", "tempeh", "seitan",
    "pasta", "spaghetti", "penne", "fettuccine", "lasagna",
    "rice", "quinoa", "couscous", "bulgur", "noodles",
    "potato", "bread", "tortilla",
    "turkey", "duck", "lamb", "veal",
    "cod", "tilapia", "tuna", "halibut", "trout",
    "crab", "lobster", "scallops", "prawns", "mussels",
    "ground beef", "ground pork", "ground chicken", "ground turkey",
    "steak", "ribeye", "tenderloin", "pork chops", "chicken breast", "chicken thighs"
  ],
  important: [
    "cheese", "parmesan", "mozzarella", "cheddar", "feta", "ricotta", "cream cheese",
    "cream", "milk", "yogurt", "sour cream", "butter",
    "egg", "eggs",
    "tomato", "onion", "carrot", "celery", "bell pepper", "mushroom",
    "broccoli", "cauliflower", "spinach", "kale", "zucchini", "eggplant",
    "beans", "chickpeas", "lentils",
    "sauce", "broth", "stock", "wine",
    "bacon", "ham", "sausage",
    "avocado", "corn", "peas"
  ],
  flavor: [
    "garlic", "ginger", "basil", "oregano", "thyme", "rosemary", "cilantro", "parsley", "dill", "mint",
    "cumin", "paprika", "turmeric", "cinnamon", "nutmeg", "curry", "garam masala",
    "chili", "cayenne", "hot sauce", "sriracha",
    "lemon", "lime", "vinegar",
    "soy sauce", "fish sauce", "worcestershire",
    "honey", "maple syrup",
    "mustard", "ketchup", "mayonnaise"
  ],
  base: [
    "salt", "pepper", "black pepper", "white pepper",
    "oil", "olive oil", "vegetable oil", "cooking oil", "canola oil",
    "water", "sugar", "flour", "cornstarch"
  ]
};
