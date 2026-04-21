import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LEVELS,
  RECIPES,
  SCORE_PER_INGREDIENT,
  PIZZA_COMPLETE_BONUS,
  MAX_MISTAKES,
  COMBO_MULTIPLIERS,
  type PizzaRecipe,
  type IngredientId,
} from "@/constants/game-data";

export type GamePhase = "home" | "playing" | "result";

export interface GameState {
  phase: GamePhase;
  currentLevel: number;
  score: number;
  highScore: number;
  mistakes: number;
  combo: number;
  maxCombo: number;
  pizzasCompleted: number;
  currentRecipe: PizzaRecipe | null;
  placedIngredients: IngredientId[];
  timeLeft: number;
  isTimerRunning: boolean;
  lastActionCorrect: boolean | null;
}

type GameAction =
  | { type: "START_GAME"; level?: number }
  | { type: "PLACE_INGREDIENT"; ingredientId: IngredientId }
  | { type: "TICK_TIMER" }
  | { type: "END_GAME" }
  | { type: "GO_HOME" }
  | { type: "SET_HIGH_SCORE"; score: number }
  | { type: "NEXT_PIZZA" };

function getRandomRecipe(level: number, excludeId?: string): PizzaRecipe {
  const gameLevel = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
  const available = gameLevel.recipes.filter((r) => r.id !== excludeId);
  return available[Math.floor(Math.random() * available.length)];
}

const initialState: GameState = {
  phase: "home",
  currentLevel: 1,
  score: 0,
  highScore: 0,
  mistakes: 0,
  combo: 0,
  maxCombo: 0,
  pizzasCompleted: 0,
  currentRecipe: null,
  placedIngredients: [],
  timeLeft: 60,
  isTimerRunning: false,
  lastActionCorrect: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const level = action.level ?? 1;
      const gameLevel = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
      const recipe = getRandomRecipe(level);
      return {
        ...state,
        phase: "playing",
        currentLevel: level,
        score: 0,
        mistakes: 0,
        combo: 0,
        maxCombo: 0,
        pizzasCompleted: 0,
        currentRecipe: recipe,
        placedIngredients: [],
        timeLeft: gameLevel.timerSeconds,
        isTimerRunning: true,
        lastActionCorrect: null,
      };
    }

    case "PLACE_INGREDIENT": {
      if (!state.currentRecipe || state.phase !== "playing") return state;

      const nextIndex = state.placedIngredients.length;
      const expectedIngredient = state.currentRecipe.ingredients[nextIndex];
      const isCorrect = action.ingredientId === expectedIngredient;

      if (isCorrect) {
        const newPlaced = [...state.placedIngredients, action.ingredientId];
        const newCombo = state.combo + 1;
        const multiplierIndex = Math.min(newCombo - 1, COMBO_MULTIPLIERS.length - 1);
        const multiplier = COMBO_MULTIPLIERS[multiplierIndex];
        const pointsGained = Math.round(SCORE_PER_INGREDIENT * multiplier);
        const isPizzaComplete = newPlaced.length === state.currentRecipe.ingredients.length;

        const newScore = state.score + pointsGained + (isPizzaComplete ? PIZZA_COMPLETE_BONUS : 0);
        const newMaxCombo = Math.max(state.maxCombo, newCombo);

        if (isPizzaComplete) {
          return {
            ...state,
            score: newScore,
            combo: newCombo,
            maxCombo: newMaxCombo,
            pizzasCompleted: state.pizzasCompleted + 1,
            placedIngredients: newPlaced,
            lastActionCorrect: true,
          };
        }

        return {
          ...state,
          score: newScore,
          combo: newCombo,
          maxCombo: newMaxCombo,
          placedIngredients: newPlaced,
          lastActionCorrect: true,
        };
      } else {
        const newMistakes = state.mistakes + 1;
        const isGameOver = newMistakes >= MAX_MISTAKES;
        return {
          ...state,
          mistakes: newMistakes,
          combo: 0,
          lastActionCorrect: false,
          phase: isGameOver ? "result" : "playing",
          isTimerRunning: !isGameOver,
        };
      }
    }

    case "NEXT_PIZZA": {
      const newRecipe = getRandomRecipe(state.currentLevel, state.currentRecipe?.id);
      return {
        ...state,
        currentRecipe: newRecipe,
        placedIngredients: [],
        lastActionCorrect: null,
      };
    }

    case "TICK_TIMER": {
      if (!state.isTimerRunning || state.timeLeft <= 0) {
        return { ...state, phase: "result", isTimerRunning: false };
      }
      const newTimeLeft = state.timeLeft - 1;
      if (newTimeLeft <= 0) {
        return { ...state, timeLeft: 0, phase: "result", isTimerRunning: false };
      }
      return { ...state, timeLeft: newTimeLeft };
    }

    case "END_GAME": {
      return { ...state, phase: "result", isTimerRunning: false };
    }

    case "GO_HOME": {
      return { ...initialState, highScore: state.highScore };
    }

    case "SET_HIGH_SCORE": {
      return { ...state, highScore: action.score };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  startGame: (level?: number) => void;
  placeIngredient: (id: IngredientId) => void;
  nextPizza: () => void;
  tickTimer: () => void;
  endGame: () => void;
  goHome: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load high score on mount
  useEffect(() => {
    AsyncStorage.getItem("pizza_high_score").then((val) => {
      if (val) {
        const score = parseInt(val, 10);
        if (!isNaN(score) && score > 0) {
          dispatch({ type: "SET_HIGH_SCORE", score });
        }
      }
    }).catch(() => {});
  }, []);

  const startGame = useCallback(async (level = 1) => {
    dispatch({ type: "START_GAME", level });
  }, []);

  const placeIngredient = useCallback(
    async (id: IngredientId) => {
      dispatch({ type: "PLACE_INGREDIENT", ingredientId: id });
      // Check if pizza is complete after placing
      if (state.currentRecipe) {
        const nextIndex = state.placedIngredients.length;
        const expected = state.currentRecipe.ingredients[nextIndex];
        if (id === expected && nextIndex + 1 === state.currentRecipe.ingredients.length) {
          // Will be handled by NEXT_PIZZA action after animation
        }
      }
    },
    [state.currentRecipe, state.placedIngredients.length]
  );

  const nextPizza = useCallback(() => {
    dispatch({ type: "NEXT_PIZZA" });
  }, []);

  const tickTimer = useCallback(() => {
    dispatch({ type: "TICK_TIMER" });
  }, []);

  const endGame = useCallback(async () => {
    dispatch({ type: "END_GAME" });
    // Save high score
    try {
      const stored = await AsyncStorage.getItem("pizza_high_score");
      const currentHigh = stored ? parseInt(stored, 10) : 0;
      if (state.score > currentHigh) {
        await AsyncStorage.setItem("pizza_high_score", String(state.score));
        dispatch({ type: "SET_HIGH_SCORE", score: state.score });
      }
    } catch (_) {}
  }, [state.score]);

  const goHome = useCallback(async () => {
    // Save high score before going home
    try {
      const stored = await AsyncStorage.getItem("pizza_high_score");
      const currentHigh = stored ? parseInt(stored, 10) : 0;
      const newHigh = Math.max(currentHigh, state.score);
      if (newHigh > currentHigh) {
        await AsyncStorage.setItem("pizza_high_score", String(newHigh));
      }
      dispatch({ type: "SET_HIGH_SCORE", score: newHigh });
    } catch (_) {}
    dispatch({ type: "GO_HOME" });
  }, [state.score]);

  return (
    <GameContext.Provider value={{ state, startGame, placeIngredient, nextPizza, tickTimer, endGame, goHome }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
