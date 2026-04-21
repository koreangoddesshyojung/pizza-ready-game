import { describe, it, expect } from "vitest";
import {
  INGREDIENTS,
  RECIPES,
  LEVELS,
  SCORE_PER_INGREDIENT,
  PIZZA_COMPLETE_BONUS,
  MAX_MISTAKES,
  COMBO_MULTIPLIERS,
} from "../constants/game-data";

describe("Game Data", () => {
  it("should have all required ingredients", () => {
    const requiredIds = ["dough", "sauce", "cheese", "pepperoni", "bell_pepper", "mushroom", "olive", "onion"];
    for (const id of requiredIds) {
      expect(INGREDIENTS).toHaveProperty(id);
      expect(INGREDIENTS[id as keyof typeof INGREDIENTS].emoji).toBeTruthy();
      expect(INGREDIENTS[id as keyof typeof INGREDIENTS].name).toBeTruthy();
    }
  });

  it("should have valid recipes with at least 3 ingredients", () => {
    for (const recipe of RECIPES) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(3);
      expect(["dough"]).toContain(recipe.ingredients[0]);
    }
  });

  it("should have dough as first ingredient in all recipes", () => {
    for (const recipe of RECIPES) {
      expect(recipe.ingredients[0]).toBe("dough");
    }
  });

  it("should have valid levels", () => {
    expect(LEVELS.length).toBeGreaterThan(0);
    for (const level of LEVELS) {
      expect(level.timerSeconds).toBeGreaterThan(0);
      expect(level.pizzasToComplete).toBeGreaterThan(0);
      expect(level.availableIngredients.length).toBeGreaterThan(0);
      expect(level.recipes.length).toBeGreaterThan(0);
    }
  });

  it("should have correct constants", () => {
    expect(SCORE_PER_INGREDIENT).toBe(10);
    expect(PIZZA_COMPLETE_BONUS).toBe(50);
    expect(MAX_MISTAKES).toBe(3);
    expect(COMBO_MULTIPLIERS.length).toBeGreaterThan(0);
    expect(COMBO_MULTIPLIERS[0]).toBe(1);
  });
});

describe("Score Calculation", () => {
  it("should calculate base score correctly", () => {
    const baseScore = SCORE_PER_INGREDIENT * COMBO_MULTIPLIERS[0];
    expect(baseScore).toBe(10);
  });

  it("should calculate combo score correctly", () => {
    const combo2Score = Math.round(SCORE_PER_INGREDIENT * COMBO_MULTIPLIERS[1]);
    expect(combo2Score).toBe(15);
  });

  it("should cap combo multiplier at max", () => {
    const maxMultiplier = COMBO_MULTIPLIERS[COMBO_MULTIPLIERS.length - 1];
    expect(maxMultiplier).toBeGreaterThanOrEqual(2);
  });

  it("should include pizza complete bonus", () => {
    expect(PIZZA_COMPLETE_BONUS).toBe(50);
  });
});

describe("Recipe Validation", () => {
  it("all recipe ingredients should exist in INGREDIENTS", () => {
    for (const recipe of RECIPES) {
      for (const ingId of recipe.ingredients) {
        expect(INGREDIENTS).toHaveProperty(ingId);
      }
    }
  });

  it("all level recipes should reference valid recipe ids", () => {
    const recipeIds = new Set(RECIPES.map((r) => r.id));
    for (const level of LEVELS) {
      for (const recipe of level.recipes) {
        expect(recipeIds.has(recipe.id)).toBe(true);
      }
    }
  });

  it("all level available ingredients should exist", () => {
    for (const level of LEVELS) {
      for (const ingId of level.availableIngredients) {
        expect(INGREDIENTS).toHaveProperty(ingId);
      }
    }
  });
});
