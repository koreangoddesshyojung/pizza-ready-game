export type IngredientId =
  | "dough"
  | "sauce"
  | "cheese"
  | "pepperoni"
  | "bell_pepper"
  | "mushroom"
  | "olive"
  | "onion"
  | "basil"
  | "ham";

export interface Ingredient {
  id: IngredientId;
  name: string;
  emoji: string;
  color: string;
}

export interface PizzaRecipe {
  id: string;
  name: string;
  ingredients: IngredientId[];
  difficulty: 1 | 2 | 3;
}

export interface GameLevel {
  level: number;
  timerSeconds: number;
  pizzasToComplete: number;
  availableIngredients: IngredientId[];
  recipes: PizzaRecipe[];
}

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  dough: { id: "dough", name: "도우", emoji: "🫓", color: "#D4A853" },
  sauce: { id: "sauce", name: "토마토 소스", emoji: "🍅", color: "#E84040" },
  cheese: { id: "cheese", name: "치즈", emoji: "🧀", color: "#FFD700" },
  pepperoni: { id: "pepperoni", name: "페퍼로니", emoji: "🥩", color: "#C0392B" },
  bell_pepper: { id: "bell_pepper", name: "피망", emoji: "🫑", color: "#27AE60" },
  mushroom: { id: "mushroom", name: "버섯", emoji: "🍄", color: "#8B6B4A" },
  olive: { id: "olive", name: "올리브", emoji: "🫒", color: "#2C3E50" },
  onion: { id: "onion", name: "양파", emoji: "🧅", color: "#9B59B6" },
  basil: { id: "basil", name: "바질", emoji: "🌿", color: "#1E8449" },
  ham: { id: "ham", name: "햄", emoji: "🍖", color: "#E67E22" },
};

export const RECIPES: PizzaRecipe[] = [
  {
    id: "margherita",
    name: "마르게리타",
    ingredients: ["dough", "sauce", "cheese", "basil"],
    difficulty: 1,
  },
  {
    id: "pepperoni",
    name: "페퍼로니",
    ingredients: ["dough", "sauce", "cheese", "pepperoni"],
    difficulty: 1,
  },
  {
    id: "veggie",
    name: "베지 피자",
    ingredients: ["dough", "sauce", "cheese", "bell_pepper", "mushroom", "olive"],
    difficulty: 2,
  },
  {
    id: "supreme",
    name: "슈프림",
    ingredients: ["dough", "sauce", "cheese", "pepperoni", "bell_pepper", "onion"],
    difficulty: 2,
  },
  {
    id: "ham_mushroom",
    name: "햄 & 버섯",
    ingredients: ["dough", "sauce", "cheese", "ham", "mushroom"],
    difficulty: 2,
  },
  {
    id: "mega",
    name: "메가 피자",
    ingredients: ["dough", "sauce", "cheese", "pepperoni", "ham", "bell_pepper", "mushroom", "olive"],
    difficulty: 3,
  },
];

export const LEVELS: GameLevel[] = [
  {
    level: 1,
    timerSeconds: 60,
    pizzasToComplete: 3,
    availableIngredients: ["dough", "sauce", "cheese", "basil", "pepperoni", "mushroom"],
    recipes: [RECIPES[0], RECIPES[1]],
  },
  {
    level: 2,
    timerSeconds: 55,
    pizzasToComplete: 4,
    availableIngredients: ["dough", "sauce", "cheese", "basil", "pepperoni", "mushroom", "bell_pepper"],
    recipes: [RECIPES[0], RECIPES[1], RECIPES[4]],
  },
  {
    level: 3,
    timerSeconds: 50,
    pizzasToComplete: 4,
    availableIngredients: ["dough", "sauce", "cheese", "pepperoni", "bell_pepper", "mushroom", "olive", "onion"],
    recipes: [RECIPES[1], RECIPES[2], RECIPES[3]],
  },
  {
    level: 4,
    timerSeconds: 45,
    pizzasToComplete: 5,
    availableIngredients: ["dough", "sauce", "cheese", "pepperoni", "bell_pepper", "mushroom", "olive", "onion", "ham"],
    recipes: [RECIPES[2], RECIPES[3], RECIPES[4]],
  },
  {
    level: 5,
    timerSeconds: 40,
    pizzasToComplete: 5,
    availableIngredients: ["dough", "sauce", "cheese", "pepperoni", "bell_pepper", "mushroom", "olive", "onion", "ham", "basil"],
    recipes: [RECIPES[2], RECIPES[3], RECIPES[4], RECIPES[5]],
  },
];

export const SCORE_PER_INGREDIENT = 10;
export const PIZZA_COMPLETE_BONUS = 50;
export const MAX_MISTAKES = 3;
export const COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3];
