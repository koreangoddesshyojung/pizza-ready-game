# Pizza Ready! - Design Document

## App Concept
피자 재료를 올바른 순서로 쌓아 피자를 완성하는 캐주얼 타이밍 게임.
주문서에 적힌 순서대로 재료를 탭하여 피자를 만들고 점수를 획득한다.

---

## Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | #E84040 | #FF6B6B | 피자 레드, 주요 버튼 |
| background | #FFF8F0 | #1A1208 | 따뜻한 크림 배경 |
| surface | #FFFFFF | #2A1F10 | 카드/재료 버튼 배경 |
| foreground | #2D1B00 | #FFE8C8 | 주요 텍스트 |
| muted | #8B6B4A | #C4A882 | 보조 텍스트 |
| border | #F0D9B5 | #4A3520 | 테두리 |
| success | #4CAF50 | #66BB6A | 정답/완성 |
| warning | #FF9800 | #FFB74D | 경고/타이머 |
| error | #F44336 | #EF5350 | 오답/실패 |
| accent | #FFD700 | #FFC107 | 점수/별 |

---

## Screen List

### 1. Home Screen (홈 화면)
- 앱 로고 및 타이틀 "Pizza Ready!"
- 최고 점수 표시
- **Play** 버튼 (크고 눈에 띄게)
- **How to Play** 버튼
- 피자 애니메이션 배경 요소

### 2. Game Screen (게임 화면)
- 상단: 점수, 레벨, 타이머 바
- 중앙: 피자 빌딩 영역 (현재 쌓인 재료 시각화)
- 주문서 패널: 만들어야 할 피자 레시피 표시
- 하단: 재료 선택 버튼 그리드 (6~8개 재료)
- 콤보 멀티플라이어 표시

### 3. Result Screen (결과 화면)
- 최종 점수
- 별점 (1~3개)
- 완성한 피자 수
- 최고 콤보
- **Play Again** / **Home** 버튼

### 4. How to Play Screen (튜토리얼)
- 간단한 규칙 설명 (3단계 슬라이드)
- 재료 순서 예시

---

## Key User Flows

### Main Game Flow
1. 홈 화면 → Play 탭
2. 주문서의 레시피 확인 (예: 도우 → 소스 → 치즈 → 토핑)
3. 하단 재료 버튼에서 올바른 재료 탭
4. 올바른 순서면 피자 위에 재료 쌓임 + 점수 획득
5. 틀리면 실수 카운트 증가 (3번 실수 시 게임 오버)
6. 피자 완성 시 다음 주문으로 넘어감
7. 타이머 종료 또는 3번 실수 → 결과 화면

### Scoring System
- 올바른 재료 탭: +10점
- 빠른 탭 보너스: 속도에 따라 +1~+5점
- 콤보 보너스: 연속 정답 × 멀티플라이어
- 피자 완성 보너스: +50점

---

## Game Mechanics

### Ingredients (재료 목록)
1. 🍕 도우 (Dough) - 항상 첫 번째
2. 🍅 토마토 소스 (Tomato Sauce)
3. 🧀 치즈 (Cheese)
4. 🍖 페퍼로니 (Pepperoni)
5. 🫑 피망 (Bell Pepper)
6. 🍄 버섯 (Mushroom)
7. 🫒 올리브 (Olive)
8. 🧅 양파 (Onion)

### Difficulty Levels
- Level 1-3: 3~4개 재료, 느린 타이머
- Level 4-6: 5~6개 재료, 보통 타이머
- Level 7+: 7~8개 재료, 빠른 타이머, 페이크 재료 추가

### Pizza Types (레시피)
- Classic Margherita: 도우 → 소스 → 치즈
- Pepperoni: 도우 → 소스 → 치즈 → 페퍼로니
- Veggie: 도우 → 소스 → 치즈 → 피망 → 버섯 → 올리브
- Supreme: 도우 → 소스 → 치즈 → 페퍼로니 → 피망 → 양파

---

## Visual Style
- 밝고 따뜻한 이탈리아 레스토랑 분위기
- 재료 버튼: 이모지 + 텍스트, 둥근 카드 형태
- 피자 빌딩: 레이어가 쌓이는 시각적 피드백
- 애니메이션: 재료 드롭 효과, 완성 시 불꽃 효과
- 폰트: 굵고 재미있는 스타일
