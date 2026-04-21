import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useColors } from "@/hooks/use-colors";
import {
  INGREDIENTS,
  LEVELS,
  MAX_MISTAKES,
  type IngredientId,
} from "@/constants/game-data";

// ─── Home Screen ────────────────────────────────────────────────────────────
function HomeScreen() {
  const { state, startGame } = useGame();
  const colors = useColors();
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounceAnim]);

  const handlePlay = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGame(1);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.homeContainer}>
        {/* Header */}
        <View style={styles.homeHeader}>
          <Animated.Text
            style={[styles.homeTitle, { color: colors.primary, transform: [{ scale: bounceAnim }] }]}
          >
            🍕
          </Animated.Text>
          <Text style={[styles.homeAppName, { color: colors.foreground }]}>Pizza Ready!</Text>
          <Text style={[styles.homeSubtitle, { color: colors.muted }]}>
            피자를 올바른 순서로 만들어보세요!
          </Text>
        </View>

        {/* High Score */}
        <View style={[styles.highScoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.highScoreLabel, { color: colors.muted }]}>🏆 최고 점수</Text>
          <Text style={[styles.highScoreValue, { color: colors.accent }]}>
            {state.highScore.toLocaleString()}
          </Text>
        </View>

        {/* How to Play */}
        <View style={[styles.howToCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.howToTitle, { color: colors.foreground }]}>🎮 게임 방법</Text>
          <Text style={[styles.howToText, { color: colors.muted }]}>
            1. 주문서의 레시피를 확인하세요{"\n"}
            2. 올바른 순서로 재료를 탭하세요{"\n"}
            3. 실수 3번이면 게임 오버!{"\n"}
            4. 콤보를 이어가면 보너스 점수!
          </Text>
        </View>

        {/* Play Button */}
        <Pressable
          onPress={handlePlay}
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: colors.primary },
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.playButtonText}>🍕 게임 시작!</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

// ─── Pizza Visual ────────────────────────────────────────────────────────────
function PizzaVisual({ placedIngredients }: { placedIngredients: IngredientId[] }) {
  const colors = useColors();
  const layers = placedIngredients.map((id) => INGREDIENTS[id]);

  return (
    <View style={[styles.pizzaVisual, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {placedIngredients.length === 0 ? (
        <Text style={[styles.pizzaEmpty, { color: colors.muted }]}>피자 판</Text>
      ) : (
        <View style={styles.pizzaLayers}>
          {layers.map((ing, i) => (
            <View key={i} style={[styles.pizzaLayer, { backgroundColor: ing.color + "33", borderColor: ing.color }]}>
              <Text style={styles.pizzaLayerEmoji}>{ing.emoji}</Text>
              <Text style={[styles.pizzaLayerName, { color: colors.foreground }]}>{ing.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Game Screen ─────────────────────────────────────────────────────────────
function GameScreen() {
  const { state, placeIngredient, nextPizza, tickTimer, endGame } = useGame();
  const colors = useColors();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(1)).current;
  const prevPhase = useRef(state.phase);

  useKeepAwake();

  // Timer
  useEffect(() => {
    if (state.isTimerRunning) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isTimerRunning, tickTimer]);

  // Auto-advance after pizza complete
  const prevPlaced = useRef(state.placedIngredients.length);
  useEffect(() => {
    if (
      state.currentRecipe &&
      state.placedIngredients.length === state.currentRecipe.ingredients.length &&
      state.placedIngredients.length > 0
    ) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Success animation
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const timeout = setTimeout(() => {
        nextPizza();
      }, 800);
      return () => clearTimeout(timeout);
    }
    prevPlaced.current = state.placedIngredients.length;
  }, [state.placedIngredients.length, state.currentRecipe, nextPizza, successAnim]);

  // Shake on wrong
  useEffect(() => {
    if (state.lastActionCorrect === false) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [state.lastActionCorrect, state.mistakes, shakeAnim]);

  if (!state.currentRecipe) return null;

  const gameLevel = LEVELS[Math.min(state.currentLevel - 1, LEVELS.length - 1)];
  const availableIngredients = gameLevel.availableIngredients;
  const nextIngredientIndex = state.placedIngredients.length;
  const nextExpected = state.currentRecipe.ingredients[nextIngredientIndex];
  const timerPercent = state.timeLeft / gameLevel.timerSeconds;
  const timerColor =
    timerPercent > 0.5 ? colors.success : timerPercent > 0.25 ? colors.warning : colors.error;

  const isPizzaComplete =
    state.placedIngredients.length === state.currentRecipe.ingredients.length;

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <View style={styles.gameContainer}>
        {/* Header: Score / Level / Timer */}
        <View style={[styles.gameHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatLabel, { color: colors.muted }]}>점수</Text>
            <Text style={[styles.headerStatValue, { color: colors.foreground }]}>
              {state.score.toLocaleString()}
            </Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatLabel, { color: colors.muted }]}>레벨</Text>
            <Text style={[styles.headerStatValue, { color: colors.primary }]}>
              {state.currentLevel}
            </Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatLabel, { color: colors.muted }]}>콤보</Text>
            <Text style={[styles.headerStatValue, { color: colors.accent }]}>
              {state.combo > 1 ? `×${state.combo}` : state.combo}
            </Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatLabel, { color: colors.muted }]}>실수</Text>
            <Text style={[styles.headerStatValue, { color: colors.error }]}>
              {"❌".repeat(state.mistakes)}{"⬜".repeat(MAX_MISTAKES - state.mistakes)}
            </Text>
          </View>
        </View>

        {/* Timer Bar */}
        <View style={[styles.timerBarBg, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.timerBarFill,
              {
                backgroundColor: timerColor,
                width: `${timerPercent * 100}%` as any,
              },
            ]}
          />
          <Text style={[styles.timerText, { color: colors.foreground }]}>{state.timeLeft}s</Text>
        </View>

        {/* Recipe Card */}
        <View style={[styles.recipeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.recipeTitle, { color: colors.muted }]}>📋 주문서</Text>
          <Text style={[styles.recipeName, { color: colors.foreground }]}>
            {state.currentRecipe.name}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recipeIngredients}>
              {state.currentRecipe.ingredients.map((ingId, idx) => {
                const ing = INGREDIENTS[ingId];
                const isPlaced = idx < state.placedIngredients.length;
                const isCurrent = idx === nextIngredientIndex;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.recipeIngredientChip,
                      {
                        backgroundColor: isPlaced
                          ? colors.success + "33"
                          : isCurrent
                          ? colors.primary + "22"
                          : colors.border,
                        borderColor: isPlaced
                          ? colors.success
                          : isCurrent
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.recipeIngredientEmoji}>{ing.emoji}</Text>
                    <Text
                      style={[
                        styles.recipeIngredientName,
                        {
                          color: isPlaced
                            ? colors.success
                            : isCurrent
                            ? colors.primary
                            : colors.muted,
                          fontWeight: isCurrent ? "700" : "400",
                        },
                      ]}
                    >
                      {isPlaced ? "✓" : isCurrent ? "▶" : ""} {ing.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Pizza Visual */}
        <Animated.View style={{ transform: [{ scale: successAnim }, { translateX: shakeAnim }] }}>
          <PizzaVisual placedIngredients={state.placedIngredients} />
        </Animated.View>

        {/* Ingredient Buttons */}
        {!isPizzaComplete && (
          <View style={styles.ingredientGrid}>
            {availableIngredients.map((ingId) => {
              const ing = INGREDIENTS[ingId];
              const isNext = ingId === nextExpected;
              return (
                <Pressable
                  key={ingId}
                  onPress={() => placeIngredient(ingId)}
                  style={({ pressed }) => [
                    styles.ingredientButton,
                    {
                      backgroundColor: isNext
                        ? colors.primary + "22"
                        : colors.surface,
                      borderColor: isNext ? colors.primary : colors.border,
                    },
                    pressed && { transform: [{ scale: 0.93 }], opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.ingredientEmoji}>{ing.emoji}</Text>
                  <Text style={[styles.ingredientName, { color: colors.foreground }]}>
                    {ing.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {isPizzaComplete && (
          <View style={styles.pizzaCompleteOverlay}>
            <Text style={[styles.pizzaCompleteText, { color: colors.success }]}>
              🎉 피자 완성! +{50}점
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen() {
  const { state, startGame, goHome } = useGame();
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [scaleAnim]);

  const stars = state.pizzasCompleted >= 5 ? 3 : state.pizzasCompleted >= 3 ? 2 : state.pizzasCompleted >= 1 ? 1 : 0;
  const isNewRecord = state.score > 0 && state.score >= state.highScore && state.highScore > 0;

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.resultScroll}>
        <Animated.View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.resultEmoji}>🍕</Text>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>게임 종료!</Text>

          {isNewRecord && (
            <View style={[styles.newRecordBadge, { backgroundColor: colors.accent + "33", borderColor: colors.accent }]}>
              <Text style={[styles.newRecordText, { color: colors.accent }]}>🏆 신기록!</Text>
            </View>
          )}

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <Text key={s} style={[styles.star, { opacity: s <= stars ? 1 : 0.2 }]}>⭐</Text>
            ))}
          </View>

          {/* Stats */}
          <View style={[styles.statsGrid, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {state.score.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>최종 점수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {state.pizzasCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>완성한 피자</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                ×{state.maxCombo}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>최고 콤보</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {state.mistakes}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>실수</Text>
            </View>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Pressable
          onPress={() => startGame(1)}
          style={({ pressed }) => [
            styles.resultButton,
            { backgroundColor: colors.primary },
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.resultButtonText}>🔄 다시 하기</Text>
        </Pressable>

        <Pressable
          onPress={goHome}
          style={({ pressed }) => [
            styles.resultButtonSecondary,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
          ]}
        >
          <Text style={[styles.resultButtonSecondaryText, { color: colors.foreground }]}>
            🏠 홈으로
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PizzaReadyApp() {
  const { state } = useGame();

  if (state.phase === "playing") return <GameScreen />;
  if (state.phase === "result") return <ResultScreen />;
  return <HomeScreen />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Home
  homeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  homeHeader: {
    alignItems: "center",
    gap: 8,
  },
  homeTitle: {
    fontSize: 72,
  },
  homeAppName: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  homeSubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  highScoreCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
  },
  highScoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  highScoreValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  howToCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  howToTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  howToText: {
    fontSize: 14,
    lineHeight: 22,
  },
  playButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#E84040",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // Game
  gameContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  headerStat: {
    alignItems: "center",
    gap: 2,
  },
  headerStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  timerBarBg: {
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
  },
  timerBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 14,
  },
  timerText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    zIndex: 1,
  },
  recipeCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  recipeTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "800",
  },
  recipeIngredients: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
  },
  recipeIngredientChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  recipeIngredientEmoji: {
    fontSize: 16,
  },
  recipeIngredientName: {
    fontSize: 12,
    fontWeight: "600",
  },
  pizzaVisual: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  pizzaEmpty: {
    fontSize: 14,
    fontStyle: "italic",
  },
  pizzaLayers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  pizzaLayer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  pizzaLayerEmoji: {
    fontSize: 18,
  },
  pizzaLayerName: {
    fontSize: 12,
    fontWeight: "600",
  },
  ingredientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    flex: 1,
    alignContent: "center",
  },
  ingredientButton: {
    width: "28%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    maxWidth: 100,
    maxHeight: 100,
  },
  ingredientEmoji: {
    fontSize: 28,
  },
  ingredientName: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  pizzaCompleteOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pizzaCompleteText: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  // Result
  resultScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  resultCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  resultEmoji: {
    fontSize: 56,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "900",
  },
  newRecordBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  newRecordText: {
    fontSize: 14,
    fontWeight: "800",
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
  },
  star: {
    fontSize: 36,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 16,
  },
  statItem: {
    width: "45%",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  resultButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#E84040",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resultButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  resultButtonSecondary: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1.5,
  },
  resultButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
