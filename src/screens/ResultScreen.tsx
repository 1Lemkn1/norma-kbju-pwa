import { useState } from "react";
import {
  Apple,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Coffee,
  Copy,
  Info,
  Moon,
  PencilLine,
  SlidersHorizontal,
  Sun,
  UtensilsCrossed,
} from "lucide-react";
import type { Inputs, Results } from "../lib/calc";
import {
  formatDecimal,
  formatNumber,
  MACRO_RANGES,
} from "../lib/calc";
import { cn } from "../utils/cn";
import { Card, SectionLabel, Slider } from "../components/ui";

type Props = {
  results: Results;
  inputs: Inputs;
  onChange: (patch: Partial<Inputs>) => void;
  onCopy: () => void;
  copied: boolean;
  onEdit: () => void;
  onShowFormula: () => void;
};

const macroConfig = [
  {
    key: "protein" as const,
    inputKey: "proteinPerKg" as const,
    label: "Белки",
    letter: "Б",
    color: "#B25F3E",
    soft: "#F5E7DF",
    range: MACRO_RANGES.protein,
  },
  {
    key: "fat" as const,
    inputKey: "fatPerKg" as const,
    label: "Жиры",
    letter: "Ж",
    color: "#A98220",
    soft: "#F8EFD6",
    range: MACRO_RANGES.fat,
  },
  {
    key: "carbs" as const,
    inputKey: "carbsPerKg" as const,
    label: "Углеводы",
    letter: "У",
    color: "#5C7D5B",
    soft: "#EAF0E3",
    range: MACRO_RANGES.carbs,
  },
];

const meals = [
  { key: "breakfast", label: "Завтрак", percent: 25, icon: Coffee },
  { key: "lunch", label: "Обед", percent: 35, icon: UtensilsCrossed },
  { key: "dinner", label: "Ужин", percent: 30, icon: Moon },
  { key: "snack", label: "Перекус", percent: 10, icon: Apple },
] as const;

export default function ResultScreen({
  results,
  inputs,
  onChange,
  onCopy,
  copied,
  onEdit,
  onShowFormula,
}: Props) {
  const [showMacroSettings, setShowMacroSettings] = useState(false);

  const goalLabel =
    results.goal === "lose"
      ? "Похудение"
      : results.goal === "gain"
        ? "Набор массы"
        : "Поддержание";
  const percentLabel =
    results.deltaPercent === 0
      ? "0%"
      : `${results.deltaPercent > 0 ? "+" : "−"}${Math.abs(results.deltaPercent)}%`;
  const intensityLabel =
    results.deltaPercent === 0
      ? "баланс"
      : results.deltaPercent < 0
        ? "дефицит"
        : "профицит";

  const dateLabel = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const tip =
    results.goal === "lose"
      ? "Комфортный темп — 0,3–0,7 кг в неделю. Если голод сильный, вернитесь к дефициту 10%."
      : results.goal === "gain"
        ? "Добавляйте калории постепенно. Ориентир набора — 0,25–0,5 кг в неделю."
        : "Держите белок ближе к верхней границе коридора — так проще сохранить мышцы.";

  return (
    <div className="space-y-5 px-4 pt-1 pb-8">
      <header className="flex items-end justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-[35px] leading-[1] tracking-[-0.015em] text-ink">
            Ваша норма
          </h1>
          <p className="mt-1.5 text-[11.5px] font-medium text-muted">
            Расчёт на {dateLabel} · {goalLabel.toLowerCase()}
          </p>
        </div>
        <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-moss">
          <UtensilsCrossed className="h-3.5 w-3.5" />
        </span>
      </header>

      <section className="grain relative overflow-hidden rounded-[24px] bg-ink p-4 text-cream shadow-[0_20px_40px_-24px_rgba(22,38,30,0.75)]">
        <span className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full border border-lime/15" />
        <span className="pointer-events-none absolute -top-4 -right-2 h-16 w-16 rounded-full bg-lime/10 blur-xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-cream/50 uppercase">
              <span className="h-1 w-1 rounded-full bg-lime" />
              Каждый день
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cream/15 bg-cream/[0.06] px-2 py-1 text-[10px] font-semibold text-cream/80">
                {goalLabel}
              </span>
              <span className="flex h-8 w-8 flex-col items-center justify-center rounded-full border border-dashed border-lime/40">
                <span className="font-display text-[12px] leading-none text-lime">
                  {percentLabel}
                </span>
                <span className="mt-0.5 text-[5.5px] font-bold tracking-wide text-cream/45 uppercase">
                  {results.deltaPercent === 0 ? "норма" : intensityLabel}
                </span>
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-end gap-2" aria-live="polite">
            <span className="font-display text-[56px] leading-[0.8] tracking-[-0.02em] tabular-nums">
              {formatNumber(results.calories)}
            </span>
            <span className="shrink-0 pb-1 text-[10.5px] font-medium whitespace-nowrap text-cream/50">
              ккал в день
            </span>
          </div>
          <p className="mt-2.5 text-[10.5px] font-medium text-cream/45">
            Вес для формулы —{" "}
            <span className="font-semibold text-cream/75">
              {formatDecimal(results.formulaWeight)} кг
            </span>
            {results.weightWasCapped
              ? ` · цель ${formatDecimal(results.targetWeight)} кг`
              : results.goal === "lose"
                ? ` · цель ${formatDecimal(results.targetWeight)} кг`
                : ""}
          </p>

          <div className="mt-3.5 grid grid-cols-3 gap-1.5">
            {macroConfig.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-cream/10 bg-cream/[0.045] px-2.5 py-2"
              >
                <span className="flex items-center gap-1 text-[9px] font-bold tracking-[0.03em] whitespace-nowrap text-cream/45 uppercase">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="mt-1 block font-display text-[20px] leading-none">
                  {results.macros[item.key].grams}
                  <span className="ml-0.5 font-sans text-[10px] font-medium text-cream/45">
                    г
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-cream/10 bg-cream/[0.04] px-3">
            <div className="flex items-center justify-between border-b border-cream/10 py-2 last:border-0">
              <span className="text-[10px] text-cream/50">Поддержание</span>
              <span className="text-[11px] font-semibold tabular-nums text-cream/90">
                {formatNumber(results.maintenance)} ккал
              </span>
            </div>
            {results.deltaPercent !== 0 ? (
              <div className="flex items-center justify-between border-b border-cream/10 py-2 last:border-0">
                <span className="flex items-center gap-1 text-[10px] text-cream/50">
                  {results.deltaPercent < 0 ? (
                    <ArrowDownRight className="h-3 w-3 text-lime" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 text-lime" />
                  )}
                  {results.deltaPercent < 0 ? "Дефицит" : "Профицит"}{" "}
                  {results.deficit}%
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-lime">
                  {results.deltaKcal > 0 ? "+" : "−"}
                  {formatNumber(Math.abs(results.deltaKcal))}
                </span>
              </div>
            ) : null}
            {results.breastfeedingKcal > 0 ? (
              <div className="flex items-center justify-between border-b border-cream/10 py-2 last:border-0">
                <span className="text-[10px] text-cream/50">
                  Грудное вскармливание
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-lime">
                  + {results.breastfeedingKcal}
                </span>
              </div>
            ) : null}
            {results.floorApplied ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-[10px] text-cream/50">
                  Минимальный порог
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-cream/90">
                  + {formatNumber(results.floorAdjustment)}
                </span>
              </div>
            ) : null}
          </div>

          {results.floorApplied ? (
            <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-snug text-cream/40">
              <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
              Ниже 1200 ккал не опускаемся — безопасный минимум из формулы.
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-[1.35fr_1fr] gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-moss px-3 py-3.5 text-[11px] font-bold text-cream transition active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-lime" strokeWidth={2.8} />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Копировать
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-cream px-3 py-3.5 text-[11px] font-bold text-ink transition active:scale-[0.98]"
        >
          <PencilLine className="h-3.5 w-3.5 text-moss" />
          Изменить
        </button>
      </div>

      <section>
        <SectionLabel
          action={
            <span className="flex items-center gap-1 text-[10.5px] font-semibold text-muted">
              <Sun className="h-3 w-3" />4 приёма
            </span>
          }
        >
          Распределение на день
        </SectionLabel>
        <Card>
          <div className="divide-y divide-line/70">
            {meals.map((meal) => {
              const Icon = meal.icon;
              const kcal = results.mealSplit[meal.key];
              return (
                <div key={meal.key} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-soft text-moss-light">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-ink/85">
                        {meal.label}
                      </span>
                      <span className="text-[11px] font-bold tabular-nums text-ink">
                        {formatNumber(kcal)}
                        <span className="ml-0.5 text-[10.5px] font-medium text-muted">
                          ккал
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/70">
                      <div
                        className="h-full rounded-full bg-moss"
                        style={{ width: `${meal.percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-6 shrink-0 text-right text-[10.5px] font-semibold text-muted tabular-nums">
                    {meal.percent}%
                  </span>
                </div>
              );
            })}
          </div>
          <p className="border-t border-line/70 bg-soft/40 px-3.5 py-2 text-[10.5px] leading-snug text-muted">
            Ориентир по калориям. Порядок приёмов и время подстраивайте под свой
            день.
          </p>
        </Card>
      </section>

      <section>
        <SectionLabel
          action={
            <button
              type="button"
              onClick={() => setShowMacroSettings((value) => !value)}
              aria-expanded={showMacroSettings}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition active:scale-95",
                showMacroSettings
                  ? "bg-moss text-lime"
                  : "border border-line bg-cream text-muted",
              )}
            >
              <SlidersHorizontal className="h-2.5 w-2.5" />
              {showMacroSettings ? "Готово" : "Настроить"}
            </button>
          }
        >
          Баланс БЖУ
        </SectionLabel>
        <Card>
          <div className="divide-y divide-line/70">
            {macroConfig.map((item) => {
              const macro = results.macros[item.key];
              const { min, max } = item.range;
              const position = Math.min(
                100,
                Math.max(0, ((macro.perKg - min) / (max - min)) * 100),
              );
              return (
                <div key={item.key} className="px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="flex h-[18px] w-[18px] items-center justify-center rounded-md text-[10.5px] font-extrabold"
                        style={{
                          backgroundColor: item.soft,
                          color: item.color,
                        }}
                      >
                        {item.letter}
                      </span>
                      <span className="text-[11.5px] font-semibold text-ink/85">
                        {item.label}
                      </span>
                    </span>
                    <span className="text-[10px] font-medium text-muted tabular-nums">
                      {macro.min}–{macro.max} г
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <p className="text-[19px] font-bold leading-tight tracking-tight text-ink tabular-nums">
                      {macro.grams}
                      <span className="ml-0.5 text-[10px] font-medium text-muted">
                        г / день
                      </span>
                    </p>
                    <span className="text-[10.5px] font-medium text-muted">
                      {formatDecimal(macro.perKg)} г/кг
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/70">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(position, 3)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {showMacroSettings ? (
            <div className="animate-pop border-t border-line/70 bg-soft/50 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">
                  Граммы на кг веса
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      proteinPerKg: 1.8,
                      fatPerKg: 0.9,
                      carbsPerKg: 2.5,
                    })
                  }
                  className="text-[10px] font-bold text-moss underline decoration-moss/30 underline-offset-2"
                >
                  по стандарту
                </button>
              </div>
              <div className="space-y-2.5">
                {macroConfig.map((item) => (
                  <div key={item.inputKey}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-ink/75">
                        {item.label}
                      </span>
                      <span className="text-[10.5px] font-bold text-moss tabular-nums">
                        {formatDecimal(inputs[item.inputKey])} г/кг
                      </span>
                    </div>
                    <Slider
                      label={`${item.label}, граммы на кг веса`}
                      value={inputs[item.inputKey]}
                      min={item.range.min}
                      max={item.range.max}
                      step={item.range.step}
                      onChange={(value) =>
                        onChange({ [item.inputKey]: value } as Partial<Inputs>)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
        <p className="mt-1.5 flex items-start gap-1.5 px-1 text-[10.5px] leading-snug text-muted">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Граммы считаются отдельно по весу для формулы, поэтому их калорийность
          может немного отличаться от нормы.
        </p>
      </section>

      <div className="rounded-[18px] bg-lime/70 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss text-lime">
            <Sun className="h-3 w-3" />
          </span>
          <div>
            <p className="text-[10.5px] font-bold tracking-[0.12em] text-moss/70 uppercase">
              Ориентир
            </p>
            <p className="mt-0.5 text-[10px] leading-snug font-medium text-moss/90">
              {tip}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onShowFormula}
        className="flex w-full items-center justify-between rounded-[16px] border border-line bg-cream px-3.5 py-3 text-left active:bg-soft"
      >
        <span className="text-[11px] font-semibold text-ink/80">
          Как получилась эта норма
        </span>
        <ChevronRight className="h-4 w-4 text-muted" />
      </button>

      <p className="px-3 pb-1 text-center text-[10.5px] leading-relaxed text-muted/80">
        Норма — ориентир, а не медицинское назначение. При беременности,
        заболеваниях или расстройствах пищевого поведения согласуйте питание с
        врачом.
      </p>
    </div>
  );
}
