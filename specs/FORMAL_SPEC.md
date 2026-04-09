# Formal Specification: WMealPlan System

## 1. Introduction
This document serves as the mathematical and logical foundation for the WMealPlan system. It defines the state space, invariants, and transition rules.

## 2. Data Models (The "Truth")

### 2.1 Domain Types
We define the core types using set theory notation (approximated here).

**Type Definitions:**
*   `Budget`: Natural Number (AUD)
*   `Diet`: Enumeration { "None", "Vegan", "Vegetarian", "Keto", "Gluten-Free" }
*   `People`: Natural Number [1..10]
*   `Days`: Natural Number [1..7]
*   `Ingredient`: Struct { name: String, amount: String }
*   `Meal`: Struct { name: String, ingredients: Set<Ingredient>, instructions: List<String> }
*   `DayPlan`: Struct { day: String, breakfast: Meal, lunch: Meal, dinner: Meal }
*   `MealPlan`: List<DayPlan> where length == `Days`

### 2.2 System Invariants
These rules MUST ALWAYS be true.
1.  **Budget Constraint**: `EstimatedTotalCost(MealPlan) <= Budget * 1.2` (Allowing 20% variance for estimation error).
2.  **Completeness**: For every `Day` in `Days`, there MUST be exactly 3 meals (Breakfast, Lunch, Dinner).
3.  **Safety**: No `Ingredient` shall contain prohibited items based on `Diet` (e.g., "Pork" in "Vegan").

## 3. State Machine (Finite Automata)

The system is modeled as a state machine `M = (S, E, T, s0)`

**States (S):**
*   `IDLE`: User is configuring preferences.
*   `VALIDATING`: Checking user input against constraints.
*   `GENERATING`: AI is computing the plan (Remote Procedure Call).
*   `PRICING`: Calculating estimated costs.
*   `SUCCESS`: Plan is displayed and persisted.
*   `ERROR`: System encountered a failure condition.

**Events (E):**
*   `SUBMIT_PREFS(Preferences)`
*   `AI_RESPONSE(Json)`
*   `AI_FAILURE(Error)`
*   `RESET()`

**Transitions (T):**
1.  `IDLE` + `SUBMIT_PREFS` -> `VALIDATING`
    *   *Guard*: `Preferences` matches Schema.
2.  `VALIDATING` -> `GENERATING`
    *   *Effect*: Dispatch API Request.
3.  `GENERATING` + `AI_RESPONSE` -> `SUCCESS`
    *   *Guard*: Response parses and satisfies `Completeness` invariant.
    *   *Else*: -> `ERROR` (Invalid Format)
4.  `GENERATING` + `AI_FAILURE` -> `ERROR`

## 4. Contract Definitions (Zod Equivalent)

### 4.1 Input Contract
```typescript
const PreferencesSchema = z.object({
  days: z.number().int().min(1).max(7),
  people: z.number().int().min(1).max(10),
  budget: z.number().min(10), // Minimum viable budget
  diet: z.enum(["None", "Vegan", "Vegetarian", "Keto", "Gluten-Free"]),
});
```

### 4.2 Output Contract (The "Gate")
Any response from the AI MUST pass this strict validation before being shown to the user.
```typescript
const MealPlanSchema = z.object({
  days: z.array(z.object({
    day: z.string(),
    meals: z.object({
      breakfast: MealSchema,
      lunch: MealSchema,
      dinner: MealSchema
    })
  })).length(Preferences.days) // Invariant Check
});
```

## 5. Failure Modes
*   **Prompt Injection**: Input text will be sanitized.
*   **Hallucination**: AI returns non-JSON or invalid JSON. *Mitigation*: 3 Retries with exponential backoff, then fail gracefully.
*   **Timeout**: If generation > 30s, abort and notify user.
