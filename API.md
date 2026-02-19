# Meal Planner API

Base URL: `http://localhost:3000` (dev)

---

## Recipes

### `GET /api/recipes`
Returns all recipes, with optional filtering.

| Query param  | Type   | Description                              |
|--------------|--------|------------------------------------------|
| `search`     | string | Case-insensitive title search            |
| `ingredient` | string | Filter by ingredient name (contains)     |
| `tag`        | string | Filter by exact tag match                |

**Response 200**
```json
{ "recipes": [ RecipeWithIngredients ] }
```

---

### `POST /api/recipes`
Creates a new recipe.

**Body**
```json
{
  "title": "Spaghetti Bolognese",
  "description": "Classic Italian pasta",
  "instructions": "1. Cook pasta...",
  "servings": 4,
  "prepTime": 15,
  "cookTime": 45,
  "tags": ["italian", "pasta"],
  "ingredients": [
    { "ingredientName": "spaghetti", "quantity": 400, "unit": "g", "notes": "dry" }
  ]
}
```

Required: `title`, `instructions`, `ingredients` (min 1).

| Status | Meaning                        |
|--------|--------------------------------|
| 201    | Recipe created                 |
| 400    | Missing required fields        |
| 500    | Server error                   |

**Response 201**
```json
{ "recipe": RecipeWithIngredients }
```

---

### `GET /api/recipes/[id]`
Returns a single recipe by ID.

| Status | Meaning          |
|--------|------------------|
| 200    | Recipe found     |
| 404    | Recipe not found |

**Response 200**
```json
{ "recipe": RecipeWithIngredients }
```

---

### `PUT /api/recipes/[id]`
Replaces a recipe's data (deletes and recreates ingredient links in a transaction).

**Body** — same shape as `POST /api/recipes`.

| Status | Meaning                  |
|--------|--------------------------|
| 200    | Recipe updated           |
| 400    | Missing required fields  |
| 404    | Recipe not found         |
| 500    | Server error             |

**Response 200**
```json
{ "recipe": RecipeWithIngredients }
```

---

### `DELETE /api/recipes/[id]`
Deletes a recipe. Cascades to all RecipeIngredient rows.

| Status | Meaning          |
|--------|------------------|
| 200    | Deleted          |
| 404    | Recipe not found |

**Response 200**
```json
{ "message": "Recipe deleted" }
```

---

## Ingredients

### `GET /api/ingredients`
Returns ingredients with optional search and category filter.

| Query param | Type   | Default | Description                            |
|-------------|--------|---------|----------------------------------------|
| `search`    | string | —       | Case-insensitive name search (contains)|
| `category`  | string | —       | Exact category match                   |
| `limit`     | number | 20      | Max results (hard cap: 50)             |

Valid categories: `produce`, `dairy`, `meat`, `seafood`, `pantry`, `spices`, `frozen`, `bakery`, `beverages`, `other`

**Response 200**
```json
{ "ingredients": [ Ingredient & { "_count": { "recipes": 3 } } ] }
```

---

### `POST /api/ingredients`
Creates a new ingredient. Name is lowercased and trimmed before saving.

**Body**
```json
{ "name": "mozzarella", "category": "dairy", "defaultUnit": "g" }
```

Required: `name`. Optional: `category`, `defaultUnit`.

| Status | Meaning                                |
|--------|----------------------------------------|
| 201    | Ingredient created                     |
| 400    | Missing name or invalid category       |
| 409    | Ingredient with this name already exists |

**Response 409**
```json
{ "error": "Ingredient already exists", "ingredient": { ... } }
```

---

### `GET /api/ingredients/[id]`
Returns a single ingredient with recipe count and the list of recipes that use it.

| Status | Meaning              |
|--------|----------------------|
| 200    | Ingredient found     |
| 404    | Ingredient not found |

---

### `PATCH /api/ingredients/[id]`
Updates `category` and/or `defaultUnit`.

**Body**
```json
{ "category": "spices", "defaultUnit": "tsp" }
```

| Status | Meaning              |
|--------|----------------------|
| 200    | Updated              |
| 400    | Invalid category     |
| 404    | Ingredient not found |

---

### `DELETE /api/ingredients/[id]`
Deletes an ingredient. Blocked if the ingredient is used in any recipes.

| Status | Meaning                              |
|--------|--------------------------------------|
| 200    | Deleted                              |
| 404    | Ingredient not found                 |
| 409    | In use — includes `recipeCount` field|

**Response 409**
```json
{ "error": "Cannot delete ingredient used in 3 recipes", "recipeCount": 3 }
```
