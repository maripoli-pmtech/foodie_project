// Ingredient categories for dropdowns and grouping
export const INGREDIENT_CATEGORIES = [
  "produce",
  "dairy",
  "meat",
  "seafood",
  "pantry",
  "spices",
  "frozen",
  "bakery",
  "beverages",
  "other",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

// Units for ingredient measurements
export const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "pinch",
] as const;

export type Unit = (typeof UNITS)[number];

// Meal types for calendar slots
export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

// API response types (Prisma models with relations included)
export type RecipeWithIngredients = {
  id: string;
  title: string;
  description: string | null;
  instructions: string;
  imageUrl: string | null;
  servings: number;
  prepTime: number | null;
  cookTime: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  ingredients: {
    id: string;
    quantity: number;
    unit: string;
    notes: string | null;
    ingredient: {
      id: string;
      name: string;
      category: string | null;
    };
  }[];
};

export type MealSlotWithRecipe = {
  id: string;
  date: Date;
  mealType: string;
  servings: number;
  recipe: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
};

// Form input types
export type RecipeIngredientInput = {
  ingredientName: string;
  quantity: number;
  unit: string;
  notes?: string;
};

export type RecipeFormInput = {
  title: string;
  description?: string;
  instructions: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  tags: string[];
  ingredients: RecipeIngredientInput[];
};

// Shopping list types (computed, not stored)
export type ShoppingListItem = {
  ingredientId: string;
  ingredientName: string;
  category: string | null;
  totalQuantity: number;
  unit: string;
  fromRecipes: string[]; // recipe titles
};
