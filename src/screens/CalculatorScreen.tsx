import type { ReactNode } from "react";
import {
  ArrowRight,
  Baby,
  CalendarDays,
  Calculator,
  Check,
  ChevronRight,
  Info,
  Minus,
  Plus,
  Ruler,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import type { Inputs, Results } from "../lib/calc";
import {
  ACTIVITIES,
  formatDecimal,
  formatNumber,
  MACRO_RANGES,
} from "../lib/calc";
import { cn } from "../utils/cn";
import {
  Card,
  ListRow,
  SectionLabel,
  Segmented,
  Slider,
  StepperRow,
  Switch,
} from "../components/ui";

type Props = {
  inputs: Inputs;
  results: Results;
  onChange: (patch: Partial<Inputs>) => void;
  onReset: () => void;
  onShowResult: () => void;
  onShowFormula: () => void;
};

const toNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const halfStep = (value: number) =>
  Number(value.toFixed(1)).toString().replace(".", ",");

function MacroMini({
  letter,
  grams,
  color,
}: {
  letter: string;
  grams: number;
  color: string;
}) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-cream/70">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {letter} {grams} г
    </span>
  );
}

function NumberBlock({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold tracking-[0.1em] text-muted uppercase">
          {label}
        </p>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="font-display text-[32px] leading-none text-ink">
            {value}
          </span>
        </p>
        {hint ? (
          <p className="mt-1 text-[10px] font-medium text-muted">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function CalculatorScreen({
  inputs,
  results,
  onChange,
  onReset,
  onShowResult,
  onShowFormula,
}: Props) {
  const isLoss = inputs.goal === "lose";
  const isGain = inputs.goal === "gain";

  const handleCurrentWeight = (value: string) => {
    const patch: Partial<Inputs> = { currentWeight: value };
    const next = toNumber(value, results.currentWeight);
    if (next < results.targetWeight + 0.5) {
      patch.targetWeight = halfStep(Math.max(35, next - 5));
    }
    onChange(patch);
  };

  const minTarget = Math.max(35, Math.round(results.currentWeight - 10));
  const maxTarget = Math.max(36, results.currentWeight - 0.5);

  const goalLabel =
    results.goal === "lose"
      ? `Похудение · −${results.deficit}%`
      : results.goal === "gain"
        ? `Набор · +${results.deficit}%`
        : "Поддержание";

  return (
    <div className="space-y-5 px-4 pt-1 pb-8">
      <header className="px-1">
        <h1 className="font-display text-[35px] leading-[1] tracking-[-0.015em] text-ink">
          Рассчитать норму
        </h1>
        <p className="mt-1.5 max-w-[300px] text-[11.5px] leading-relaxed text-muted">
          Калории и БЖУ по формуле — с активностью, целью и особыми условиями.
        </p>
      </header>

      <button
        type="button"
        onClick={onShowResult}
        className="dot-grid relative w-full overflow-hidden rounded-[22px] bg-ink p-4 text-left text-cream shadow-[0_16px_34px_-20px_rgba(22,38,30,0.7)] transition active:scale-[0.992]"
      >
        <span className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full border border-lime/20" />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-cream/50 uppercase">
              <span className="h-1 w-1 rounded-full bg-lime" />
              Норма сейчас
            </p>
            <p className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-display text-[42px] leading-[0.85] tracking-tight text-cream tabular-nums">
                {formatNumber(results.calories)}
              </span>
              <span className="text-[10px] font-medium text-cream/50">
                ккал / день
              </span>
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-cream/15 bg-cream/[0.06] px-2 py-1 text-[10px] font-semibold text-cream/80">
            <Utensils className="h-2.5 w-2.5 text-lime" />
            {results.goal === "lose"
              ? "Похудение"
              : results.goal === "gain"
                ? "Набор"
                : "Баланс"}
          </span>
        </div>
        <div className="mt-3.5 flex items-center gap-3 border-t border-cream/10 pt-2.5">
          <MacroMini letter="Б" grams={results.macros.protein.grams} color="#D98B67" />
          <MacroMini letter="Ж" grams={results.macros.fat.grams} color="#D9B858" />
          <MacroMini letter="У" grams={results.macros.carbs.grams} color="#9DBB93" />
          <span className="ml-auto flex items-center gap-1 text-[10.5px] font-bold text-lime">
            Открыть
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </button>

      <section>
        <SectionLabel>Параметры</SectionLabel>
        <Card>
          <div className="p-3">
            <Segmented
              ariaLabel="Пол"
              value={inputs.sex}
              onChange={(value) => onChange({ sex: value })}
              options={[
                { value: "female", label: "Женщина" },
                { value: "male", label: "Мужчина" },
              ]}
            />
          </div>
          <div className="divide-y divide-line/70 border-t border-line/70 px-1">
            <StepperRow
              id="age"
              label="Возраст"
              unit="лет"
              value={inputs.age}
              onChange={(value) => onChange({ age: value })}
              min={14}
              max={90}
              icon={<CalendarDays className="h-3.5 w-3.5" />}
            />
            <StepperRow
              id="height"
              label="Рост"
              unit="см"
              value={inputs.height}
              onChange={(value) => onChange({ height: value })}
              min={120}
              max={220}
              icon={<Ruler className="h-3.5 w-3.5" />}
            />
            <StepperRow
              id="currentWeight"
              label="Текущий вес"
              unit="кг"
              value={inputs.currentWeight}
              onChange={handleCurrentWeight}
              min={35}
              max={250}
              step={0.5}
              icon={<Scale className="h-3.5 w-3.5" />}
            />
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel
          action={
            <span className="text-[10.5px] font-semibold text-muted">
              × {results.activity.coefficient.toFixed(1).replace(".", ",")}
            </span>
          }
        >
          Активность
        </SectionLabel>
        <Card>
          <div className="divide-y divide-line/70">
            {ACTIVITIES.map((option) => {
              const active = inputs.activity === option.id;
              return (
                <ListRow
                  key={option.id}
                  onClick={() => onChange({ activity: option.id })}
                  active={active}
                  icon={<Calculator className="h-3.5 w-3.5" />}
                  title={option.title}
                  subtitle={option.short}
                  right={
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums",
                          active
                            ? "bg-moss text-lime"
                            : "bg-soft text-muted",
                        )}
                      >
                        × {option.coefficient.toFixed(1).replace(".", ",")}
                      </span>
                      <span
                        className={cn(
                          "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition",
                          active
                            ? "border-moss bg-moss text-lime"
                            : "border-line bg-cream text-transparent",
                        )}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
                      </span>
                    </span>
                  }
                />
              );
            })}
          </div>
          <p className="flex items-center gap-1.5 border-t border-line/70 bg-soft/50 px-3.5 py-2 text-[10.5px] font-medium text-muted">
            <Info className="h-3 w-3 shrink-0" />
            {results.activity.description}
          </p>
        </Card>
      </section>

      <section>
        <SectionLabel
          action={
            <span className="text-[10.5px] font-semibold text-moss">
              {goalLabel}
            </span>
          }
        >
          Цель
        </SectionLabel>
        <Card>
          <div className="p-3">
            <Segmented
              ariaLabel="Цель"
              value={inputs.goal}
              onChange={(value) => onChange({ goal: value })}
              options={[
                {
                  value: "lose",
                  label: "Похудеть",
                  icon: <TrendingDown className="h-3.5 w-3.5" />,
                },
                {
                  value: "maintain",
                  label: "Держать",
                  icon: <Minus className="h-3.5 w-3.5" />,
                },
                {
                  value: "gain",
                  label: "Набрать",
                  icon: <TrendingUp className="h-3.5 w-3.5" />,
                },
              ]}
            />
          </div>

          {isLoss ? (
            <div className="border-t border-line/70 p-3.5">
              <NumberBlock
                label="Желаемый вес"
                value={formatDecimal(results.targetWeight)}
                hint={`−${formatDecimal(results.totalLoss)} кг от текущего · вес для формулы ${formatDecimal(results.formulaWeight)} кг`}
              >
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] font-bold text-muted">кг</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Уменьшить желаемый вес"
                      onClick={() =>
                        onChange({
                          targetWeight: halfStep(
                            Math.max(minTarget, results.targetWeight - 0.5),
                          ),
                        })
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-moss active:scale-90"
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </button>
                    <button
                      type="button"
                      aria-label="Увеличить желаемый вес"
                      onClick={() =>
                        onChange({
                          targetWeight: halfStep(
                            Math.min(maxTarget, results.targetWeight + 0.5),
                          ),
                        })
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-moss active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </button>
                  </div>
                </div>
              </NumberBlock>
              <div className="mt-2">
                <Slider
                  label="Желаемый вес"
                  value={Math.min(maxTarget, results.targetWeight)}
                  min={minTarget}
                  max={maxTarget}
                  step={0.5}
                  onChange={(value) =>
                    onChange({ targetWeight: halfStep(value) })
                  }
                />
                <div className="flex justify-between text-[10px] font-medium text-muted">
                  <span>{minTarget} кг</span>
                  <span>{maxTarget} кг</span>
                </div>
              </div>
              {results.weightWasCapped ? (
                <div className="mt-2.5 flex gap-2 rounded-xl bg-[#FBF3DB] px-2.5 py-2">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-mustard" />
                  <p className="text-[10.5px] leading-snug text-[#7a6224]">
                    Для метаболизма отнимаем не больше 5 кг. Считаем по{" "}
                    <strong className="font-bold">
                      {formatDecimal(results.formulaWeight)} кг
                    </strong>
                    , дефицит — от всей цели.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="flex items-start gap-2 border-t border-line/70 px-3.5 py-2.5 text-[10.5px] leading-snug text-muted">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              {isGain
                ? "Для набора считаем по текущему весу и добавляем 10–20% к норме поддержания."
                : "Норма поддержания — без дефицита и профицита, по текущему весу."}
            </p>
          )}
        </Card>
      </section>

      {inputs.goal !== "maintain" ? (
        <section>
          <SectionLabel
            action={
              <span className="text-[10.5px] font-semibold text-muted">
                {isLoss ? "10–20% ниже нормы" : "10–20% выше нормы"}
              </span>
            }
          >
            {isLoss ? "Дефицит" : "Профицит"}
          </SectionLabel>
          <Card>
            <div className="px-3.5 pt-3 pb-2">
              <NumberBlock
                label={isLoss ? "Снижение" : "Прибавка"}
                value={`${formatNumber(Math.abs(results.deltaKcal))} ккал`}
                hint={`${results.deficit}% от нормы поддержания`}
              />
            </div>
            <div
              className={cn(
                "grid gap-1.5 px-3 pb-3",
                isLoss ? "grid-cols-4" : "grid-cols-3",
              )}
            >
              {isLoss ? (
                <button
                  type="button"
                  onClick={() => onChange({ autoDeficit: true })}
                  aria-pressed={inputs.autoDeficit}
                  className={cn(
                    "rounded-xl px-1 py-2 text-[10.5px] font-bold transition active:scale-95",
                    inputs.autoDeficit
                      ? "bg-moss text-lime"
                      : "bg-soft text-muted",
                  )}
                >
                  Авто
                </button>
              ) : null}
              {[10, 15, 20].map((percent) => {
                const active =
                  (isLoss ? !inputs.autoDeficit : true) &&
                  results.deficit === percent;
                return (
                  <button
                    key={percent}
                    type="button"
                    onClick={() =>
                      onChange({ deficit: percent, autoDeficit: false })
                    }
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl px-1 py-2 text-[10.5px] font-bold tabular-nums transition active:scale-95",
                      active ? "bg-moss text-lime" : "bg-soft text-muted",
                    )}
                  >
                    {isLoss ? "−" : "+"}
                    {percent}%
                  </button>
                );
              })}
            </div>
            <div className="flex items-start gap-2 border-t border-line/70 bg-soft/40 px-3.5 py-2.5">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-mustard" />
              <p className="text-[10.5px] leading-snug text-muted">
                {isLoss ? (
                  <>
                    Рекомендация для цели −{formatDecimal(results.totalLoss)} кг —{" "}
                    <strong className="font-bold text-ink/80">
                      {results.autoPercent}%
                    </strong>
                    .{" "}
                    {inputs.autoDeficit
                      ? "Применяется автоматически."
                      : "Выбрано вручную."}
                  </>
                ) : (
                  <>
                    Комфортный профицит —{" "}
                    <strong className="font-bold text-ink/80">10–20%</strong>.
                    Ориентир набора — 0,25–0,5 кг в неделю.
                  </>
                )}
              </p>
            </div>
          </Card>
        </section>
      ) : null}

      {inputs.sex === "female" ? (
        <section>
          <SectionLabel>Особые условия</SectionLabel>
          <Card>
            <div className="flex items-center gap-2.5 px-3.5 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5E7DC] text-terracotta">
                <Baby className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-ink">
                  Грудное вскармливание
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted">
                  Добавим +300 ккал к норме
                </p>
              </div>
              <Switch
                label="Грудное вскармливание"
                checked={inputs.breastfeeding}
                onChange={(checked) => onChange({ breastfeeding: checked })}
              />
            </div>
          </Card>
        </section>
      ) : null}

      <button
        type="button"
        onClick={onShowFormula}
        className="flex w-full items-center gap-2.5 rounded-[16px] border border-dashed border-line bg-cream/60 px-3 py-2.5 text-left active:bg-soft"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-[10px] font-extrabold text-moss">
          БЖУ
        </span>
        <p className="flex-1 text-[10.5px] leading-snug text-muted">
          Белки {MACRO_RANGES.protein.min}–{MACRO_RANGES.protein.max}, жиры{" "}
          {MACRO_RANGES.fat.min}–{MACRO_RANGES.fat.max}, углеводы{" "}
          {MACRO_RANGES.carbs.min}–{MACRO_RANGES.carbs.max} г/кг. Как считаем?
        </p>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>

      <button
        type="button"
        onClick={onShowResult}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-moss px-4 py-4 text-[12.5px] font-bold text-cream shadow-[0_14px_26px_-16px_rgba(36,81,60,0.9)] transition active:scale-[0.985]"
      >
        Показать норму · {formatNumber(results.calories)} ккал
        <ArrowRight className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onReset}
        className="mx-auto block py-1 text-[10px] font-semibold text-muted underline decoration-line underline-offset-4 active:text-ink"
      >
        Сбросить параметры
      </button>

      <p className="px-3 text-center text-[10.5px] leading-relaxed text-muted/80">
        Расчёт носит информационный характер и не заменяет консультацию врача.
      </p>
    </div>
  );
}
