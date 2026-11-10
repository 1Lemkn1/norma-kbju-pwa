export type Sex = "female" | "male";
export type Goal = "lose" | "maintain" | "gain";
export type Activity = "low" | "medium" | "high";

export type Inputs = {
  sex: Sex;
  age: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  activity: Activity;
  goal: Goal;
  deficit: number;
  autoDeficit: boolean;
  breastfeeding: boolean;
  proteinPerKg: number;
  fatPerKg: number;
  carbsPerKg: number;
};

export const DEFAULT_INPUTS: Inputs = {
  sex: "female",
  age: "29",
  height: "168",
  currentWeight: "72",
  targetWeight: "65",
  activity: "medium",
  goal: "lose",
  deficit: 15,
  autoDeficit: true,
  breastfeeding: false,
  proteinPerKg: 1.8,
  fatPerKg: 0.9,
  carbsPerKg: 2.5,
};

export const ACTIVITIES: {
  id: Activity;
  title: string;
  short: string;
  description: string;
  coefficient: number;
}[] = [
  {
    id: "low",
    title: "Низкая",
    short: "1–2 раза в неделю",
    description: "Легкие тренировки",
    coefficient: 1.2,
  },
  {
    id: "medium",
    title: "Средняя",
    short: "3–4 раза в неделю",
    description: "Умеренные тренировки",
    coefficient: 1.3,
  },
  {
    id: "high",
    title: "Высокая",
    short: "5–6 раз в неделю",
    description: "Интенсивные тренировки",
    coefficient: 1.4,
  },
];

export const GOALS: {
  id: Goal;
  title: string;
  caption: string;
}[] = [
  { id: "lose", title: "Похудеть", caption: "дефицит 10–20%" },
  { id: "maintain", title: "Поддерживать", caption: "0% коридор" },
  { id: "gain", title: "Набрать", caption: "профицит 10–20%" },
];

export const MACRO_RANGES = {
  protein: { min: 1.5, max: 2, step: 0.1, label: "Белки", short: "Б" },
  fat: { min: 0.8, max: 1, step: 0.1, label: "Жиры", short: "Ж" },
  carbs: { min: 2, max: 3, step: 0.1, label: "Углеводы", short: "У" },
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const parse = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatDecimal(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function recommendedDeficit(totalLoss: number) {
  if (totalLoss >= 10) return 20;
  if (totalLoss >= 5) return 15;
  return 10;
}

export function getFormulaWeight(currentWeight: number, targetWeight: number) {
  // По формуле для метаболизма можно отнять не более 5 кг от текущего веса.
  return clamp(targetWeight, currentWeight - 5, currentWeight);
}

export type Results = ReturnType<typeof computeResults>;

export function computeResults(inputs: Inputs) {
  const age = clamp(parse(inputs.age, 29), 14, 90);
  const height = clamp(parse(inputs.height, 168), 120, 220);
  const currentWeight = clamp(parse(inputs.currentWeight, 72), 35, 250);
  const targetWeight = clamp(
    parse(inputs.targetWeight, currentWeight - 5),
    35,
    currentWeight,
  );

  const activity =
    ACTIVITIES.find((item) => item.id === inputs.activity) ?? ACTIVITIES[1];
  const goal = inputs.goal;

  const totalLoss =
    goal === "lose" ? Math.max(0, currentWeight - targetWeight) : 0;
  const autoPercent = recommendedDeficit(totalLoss);
  const deficit =
    goal === "lose" && inputs.autoDeficit
      ? autoPercent
      : clamp(inputs.deficit, 10, 20);

  const formulaWeight =
    goal === "lose"
      ? getFormulaWeight(currentWeight, targetWeight)
      : currentWeight;

  /* Обе формулы — Харрис–Бенедикт, пересмотр 1984 (Roza & Shizgal),
   * чтобы мужчины и женщины считались по одному семейству формул. */
  const femaleBmr =
    655 + 9.6 * formulaWeight + 1.8 * height - 4.7 * age;
  const maleBmr =
    66.5 + 13.75 * formulaWeight + 5 * height - 6.775 * age;
  const bmr = inputs.sex === "female" ? femaleBmr : maleBmr;
  const maintenance = Math.round(bmr * activity.coefficient);

  const deltaPercent =
    goal === "lose" ? -deficit : goal === "gain" ? deficit : 0;
  const deltaKcal = Math.round((maintenance * deltaPercent) / 100);
  const breastfeedingKcal =
    inputs.sex === "female" && inputs.breastfeeding ? 300 : 0;

  const rawCalories = maintenance + deltaKcal + breastfeedingKcal;
  const calories = Math.max(1200, rawCalories);
  const floorApplied = rawCalories < 1200;
  const floorAdjustment = floorApplied ? 1200 - rawCalories : 0;

  const macroFor = (perKg: number) => Math.round(perKg * formulaWeight);
  const macroRange = (perKg: number, range: { min: number; max: number }) => ({
    min: Math.round(range.min * formulaWeight),
    max: Math.round(range.max * formulaWeight),
    grams: macroFor(perKg),
  });

  const macros = {
    protein: {
      ...macroRange(inputs.proteinPerKg, MACRO_RANGES.protein),
      perKg: inputs.proteinPerKg,
    },
    fat: {
      ...macroRange(inputs.fatPerKg, MACRO_RANGES.fat),
      perKg: inputs.fatPerKg,
    },
    carbs: {
      ...macroRange(inputs.carbsPerKg, MACRO_RANGES.carbs),
      perKg: inputs.carbsPerKg,
    },
  };

  const macroCalories =
    macros.protein.grams * 4 + macros.fat.grams * 9 + macros.carbs.grams * 4;

  return {
    age,
    height,
    currentWeight,
    targetWeight,
    totalLoss,
    formulaWeight,
    weightWasCapped: goal === "lose" && totalLoss > 5,
    activity,
    goal,
    autoPercent,
    deficit,
    isAutoDeficit: goal === "lose" && inputs.autoDeficit,
    bmr,
    maintenance,
    deltaPercent,
    deltaKcal,
    breastfeedingKcal,
    rawCalories,
    calories,
    floorApplied,
    floorAdjustment,
    macros,
    macroCalories,
    totalFromTarget: maintenance + deltaKcal,
    mealSplit: {
      breakfast: Math.round(calories * 0.25),
      lunch: Math.round(calories * 0.35),
      dinner: Math.round(calories * 0.3),
      snack: Math.round(calories * 0.1),
    },
  };
}

export function buildSummary(results: Results) {
  const goalLabel =
    results.goal === "lose"
      ? `похудение, дефицит ${results.deficit}%`
      : results.goal === "gain"
        ? `набор массы, профицит ${results.deficit}%`
        : "поддержание веса";

  return [
    "НОРМА · расчёт калорий и БЖУ",
    `Калории: ${formatNumber(results.calories)} ккал в день`,
    `Цель: ${goalLabel}`,
    `Белки: ${results.macros.protein.grams} г · Жиры: ${results.macros.fat.grams} г · Углеводы: ${results.macros.carbs.grams} г`,
    `Расчёт по весу ${formatDecimal(results.formulaWeight)} кг · активность ${results.activity.coefficient}`,
    results.breastfeedingKcal
      ? "Учтено грудное вскармливание: +300 ккал"
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
