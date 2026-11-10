import {
  Activity,
  ArrowRight,
  Calculator,
  ChevronRight,
  Info,
  Sparkles,
  Target,
} from "lucide-react";
import type { Results } from "../lib/calc";
import { formatDecimal, formatNumber } from "../lib/calc";
import { cn } from "../utils/cn";
import { Card, SectionLabel } from "../components/ui";

type Props = {
  results: Results;
  onShowCalculator: () => void;
  onShowResult: () => void;
};

export default function FormulaScreen({
  results,
  onShowCalculator,
  onShowResult,
}: Props) {
  const chain = [
    {
      label: "Основной обмен",
      value: `${formatNumber(results.bmr)} ккал`,
      note: `по весу ${formatDecimal(results.formulaWeight)} кг`,
    },
    {
      label: `Активность × ${results.activity.coefficient.toFixed(1).replace(".", ",")}`,
      value: `${formatNumber(results.maintenance)} ккал`,
      note: "норма поддержания",
    },
    ...(results.deltaPercent !== 0
      ? [
          {
            label:
              results.deltaPercent < 0
                ? `Дефицит ${results.deficit}%`
                : `Профицит ${results.deficit}%`,
            value: `${results.deltaKcal > 0 ? "+" : "−"}${formatNumber(
              Math.abs(results.deltaKcal),
            )} ккал`,
            note: "цель",
          },
        ]
      : []),
    ...(results.breastfeedingKcal
      ? [
          {
            label: "Грудное вскармливание",
            value: `+${results.breastfeedingKcal} ккал`,
            note: "особое условие",
          },
        ]
      : []),
    ...(results.floorApplied
      ? [
          {
            label: "Минимальный порог",
            value: `+${formatNumber(results.floorAdjustment)} ккал`,
            note: "не ниже 1200",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5 px-4 pt-1 pb-8">
      <header className="px-1">
        <h1 className="font-display text-[35px] leading-[1] tracking-[-0.015em] text-ink">
          Формула
        </h1>
        <p className="mt-1.5 max-w-[310px] text-[11.5px] leading-relaxed text-muted">
          Прозрачная математика: ваши параметры, активность и цель. Никаких
          скрытых коэффициентов.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[18px] border border-line bg-cream p-3.5">
          <p className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">
            Норма сейчас
          </p>
          <p className="mt-1 font-display text-[27px] leading-none text-ink tabular-nums">
            {formatNumber(results.calories)}
            <span className="ml-1 font-sans text-[10px] font-medium text-muted">
              ккал
            </span>
          </p>
        </div>
        <div className="rounded-[18px] border border-line bg-lime/60 p-3.5">
          <p className="text-[10.5px] font-bold tracking-[0.1em] text-moss/70 uppercase">
            Цель
          </p>
          <p className="mt-1.5 text-[13px] leading-tight font-bold text-moss">
            {results.goal === "lose"
              ? "Похудение"
              : results.goal === "gain"
                ? "Набор массы"
                : "Поддержание"}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-moss/70">
            {results.deltaPercent === 0
              ? "баланс"
              : `${results.deltaPercent > 0 ? "+" : "−"}${results.deficit}%`}
          </p>
        </div>
      </div>

      <section>
        <SectionLabel>Три шага</SectionLabel>
        <div className="space-y-2.5">
          <Card className="p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-moss text-lime">
                <Calculator className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[12.5px] font-bold text-ink">
                    1. Основной обмен
                  </h2>
                  <span className="font-display text-[20px] leading-none text-line">
                    01
                  </span>
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                  Энергия, которую организм тратит в покое. Вес для формулы —
                  желаемый, но не более 5 кг ниже текущего.
                </p>
                <div className="mt-2 space-y-1.5">
                  <div
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5",
                      results.goal === "lose" || results.goal === "maintain"
                        ? "border-terracotta/25 bg-[#FBF1EB]"
                        : "border-line bg-soft",
                    )}
                  >
                    <p className="text-[10px] font-bold tracking-wider text-terracotta uppercase">
                      Женщины · BMR
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed font-medium text-ink/75">
                      655 + 9,6 × вес + 1,8 × рост − 4,7 × возраст
                    </p>
                  </div>
                  <div className="rounded-lg border border-line bg-soft px-2.5 py-1.5">
                    <p className="text-[10px] font-bold tracking-wider text-sage uppercase">
                      Мужчины · BMR
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed font-medium text-ink/75">
                      66,5 + 13,75 × вес + 5 × рост − 6,8 × возраст
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-moss text-lime">
                <Activity className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[12.5px] font-bold text-ink">
                    2. Активность
                  </h2>
                  <span className="font-display text-[20px] leading-none text-line">
                    02
                  </span>
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                  Умножаем метаболизм на коэффициент тренировок — получаем норму
                  поддержания.
                </p>
                <div className="mt-2 space-y-1">
                  {[
                    ["Низкая", "1–2 лёгкие / неделю", "1,2"],
                    ["Средняя", "3–4 умеренные / неделю", "1,3"],
                    ["Высокая", "5–6 интенсивные / неделю", "1,4"],
                  ].map(([title, subtitle, coefficient]) => {
                    const active =
                      coefficient ===
                      results.activity.coefficient.toFixed(1).replace(".", ",");
                    return (
                      <div
                        key={title}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5",
                          active
                            ? "bg-moss text-cream"
                            : "bg-soft text-ink/75",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block text-[10.5px] font-bold">
                            {title}
                          </span>
                          <span
                            className={cn(
                              "block text-[10.5px]",
                              active ? "text-cream/55" : "text-muted",
                            )}
                          >
                            {subtitle}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums",
                            active ? "bg-lime text-ink" : "bg-cream text-moss",
                          )}
                        >
                          × {coefficient}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-moss text-lime">
                <Target className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[12.5px] font-bold text-ink">
                    3. Цель
                  </h2>
                  <span className="font-display text-[20px] leading-none text-line">
                    03
                  </span>
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                  Добавляем дефицит или профицит, учитываем грудное
                  вскармливание и безопасный минимум.
                </p>
                <div className="mt-2 space-y-1">
                  {[
                    ["− 10–20%", "дефицит для похудения"],
                    ["+ 10–20%", "профицит для набора"],
                    ["+ 300 ккал", "при грудном вскармливании"],
                    ["1 200 ккал", "минимальный порог"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-2 border-b border-dashed border-line pb-1 last:border-0 last:pb-0"
                    >
                      <span className="text-[10px] text-muted">{label}</span>
                      <span className="text-[10.5px] font-bold text-moss tabular-nums">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionLabel
          action={
            <button
              type="button"
              onClick={onShowResult}
              className="flex items-center gap-0.5 text-[10px] font-bold text-moss"
            >
              к результату
              <ChevronRight className="h-3 w-3" />
            </button>
          }
        >
          В вашем случае
        </SectionLabel>
        <Card>
          <div className="divide-y divide-line/70">
            {chain.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 px-3.5 py-2"
              >
                <div>
                  <p className="text-[10.5px] font-semibold text-ink/80">
                    {row.label}
                  </p>
                  <p className="text-[10.5px] font-medium text-muted">{row.note}</p>
                </div>
                <span className="text-[11px] font-bold text-ink tabular-nums">
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 bg-lime/50 px-3.5 py-2.5">
              <p className="text-[11px] font-bold text-moss">Итоговая норма</p>
              <span className="font-display text-[20px] leading-none text-moss">
                {formatNumber(results.calories)}
                <span className="ml-1 font-sans text-[10.5px] font-semibold">
                  ккал
                </span>
              </span>
            </div>
          </div>
        </Card>
        <p className="mt-1.5 flex items-start gap-1.5 px-1 text-[10.5px] leading-snug text-muted">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          Обе формулы — Харрис–Бенедикт (пересмотр 1984): для женщин и для
          мужчин используется своя версия одного и того же уравнения.
        </p>
      </section>

      <section>
        <SectionLabel>Норма БЖУ</SectionLabel>
        <Card className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">
                Граммы на килограмм
              </h2>
              <p className="mt-0.5 text-[10px] leading-snug text-muted">
                Считаются от веса для формулы —{" "}
                {formatDecimal(results.formulaWeight)} кг
              </p>
            </div>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-mustard" />
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {[
              ["Белки", "1,5–2", "#B25F3E", "#F5E7DF", results.macros.protein.grams],
              ["Жиры", "0,8–1", "#A98220", "#F8EFD6", results.macros.fat.grams],
              ["Углеводы", "2–3", "#5C7D5B", "#EAF0E3", results.macros.carbs.grams],
            ].map(([label, range, color, soft, grams]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-line/70 bg-soft/60 p-2"
              >
                <span
                  className="inline-block rounded px-1 py-0.5 text-[8.5px] font-extrabold"
                  style={{ backgroundColor: soft as string, color: color as string }}
                >
                  {String(label).slice(0, 1)}
                </span>
                <p className="mt-1.5 text-[10px] font-bold leading-none text-ink">
                  {range}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted">
                  г/кг
                </p>
                <p
                  className="mt-1.5 border-t border-line/70 pt-1 text-[10.5px] font-bold tabular-nums"
                  style={{ color: color as string }}
                >
                  {grams} г
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] leading-snug text-muted">
            Суточные граммы — это коридор. На экране «Норма» его можно
            настроить внутри рекомендуемых значений.
          </p>
        </Card>
      </section>

      <button
        type="button"
        onClick={onShowCalculator}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-moss py-3.5 text-[12px] font-bold text-cream transition active:scale-[0.985]"
      >
        Пересчитать по своим параметрам
        <ArrowRight className="h-4 w-4" />
      </button>

      <p className="px-3 text-center text-[10.5px] leading-relaxed text-muted/80">
        Калькулятор носит информационный характер и не заменяет консультацию
        врача или диетолога.
      </p>
    </div>
  );
}
