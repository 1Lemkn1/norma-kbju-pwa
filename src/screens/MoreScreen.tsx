import { useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Info,
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { Results } from "../lib/calc";
import { formatNumber } from "../lib/calc";
import type { InstallState } from "../hooks/useInstallPrompt";
import InstallCard from "../components/InstallCard";
import { cn } from "../utils/cn";
import { Card, SectionLabel } from "../components/ui";

type Props = {
  results: Results;
  install: InstallState;
  onReset: () => void;
  onShowCalculator: () => void;
  onShowResult: () => void;
  onShowFormula: () => void;
};

const faqItems = [
  {
    question: "Почему вес для расчёта — желаемый, но с ограничением в 5 кг?",
    answer:
      "Так устроена формула: организму не стоит сразу переходить на энергию сильно меньшего веса. Для метаболизма берётся желаемый вес, но не более чем на 5 кг ниже текущего. Процент дефицита при этом зависит от всей цели.",
  },
  {
    question: "Хочу сбросить больше 5 кг. Что тогда?",
    answer:
      "Для метаболизма всё равно используется вес на 5 кг ниже текущего, а дефицит может достигать 20% — верхняя граница для старта. Когда вес снизится, обновите текущий вес: норма пересчитается автоматически.",
  },
  {
    question: "Как учитывается грудное вскармливание?",
    answer:
      "Для женщин с включённым ГВ прибавляем 300 ккал к калорийности после дефицита. Расчёт БЖУ остаётся привязанным к весу из формулы. Итог не опускается ниже 1200 ккал.",
  },
  {
    question: "Почему минимальный порог — 1200 ккал?",
    answer:
      "Это нижний порог дневного потребления из формулы. Приложение не покажет норму меньше 1200 ккал, даже если дефицит получился большим.",
  },
  {
    question: "Сумма калорий из БЖУ не совпадает с нормой. Это ошибка?",
    answer:
      "Нет. Калории считаются по метаболизму и цели, а граммы БЖУ — по диапазонам на килограмм веса. Это два самостоятельных ориентира. Их можно сблизить, настроив граммы внутри коридоров.",
  },
  {
    question: "Подходит ли расчёт при беременности или заболеваниях?",
    answer:
      "Калькулятор даёт общий ориентир. При беременности, ГВ, хронических заболеваниях, расстройствах пищевого поведения или приёме лекарств обязательно согласуйте норму с врачом.",
  },
];

export default function MoreScreen({
  results,
  install,
  onReset,
  onShowCalculator,
  onShowResult,
  onShowFormula,
}: Props) {
  const [open, setOpen] = useState<number | null>(0);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    onReset();
    setResetDone(true);
    window.setTimeout(() => setResetDone(false), 2200);
  };

  return (
    <div className="space-y-5 px-4 pt-1 pb-8">
      <header className="px-1">
        <h1 className="font-display text-[35px] leading-[1] tracking-[-0.015em] text-ink">
          Ещё
        </h1>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
          Помощь, расчёт и данные — всё в одном месте.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-[22px] bg-ink p-4 text-cream">
        <span className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full border border-lime/15" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] text-cream/50 uppercase">
              <span className="h-1 w-1 rounded-full bg-lime" />
              Сохранённый расчёт
            </p>
            <p className="mt-1.5 font-display text-[30px] leading-none">
              {formatNumber(results.calories)}
              <span className="ml-1.5 font-sans text-[10.5px] font-medium text-cream/45">
                ккал / день
              </span>
            </p>
            <p className="mt-1.5 text-[10px] font-medium text-cream/45">
              Б {results.macros.protein.grams} · Ж {results.macros.fat.grams} · У{" "}
              {results.macros.carbs.grams} г
            </p>
          </div>
          <button
            type="button"
            onClick={onShowResult}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition active:scale-90"
            aria-label="Открыть норму"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <section>
        <SectionLabel>Быстрый доступ</SectionLabel>
        <Card>
          <div className="divide-y divide-line/70">
            <button
              type="button"
              onClick={onShowCalculator}
              className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left active:bg-soft"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft text-moss">
                <Flame className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 text-[12px] font-semibold text-ink/85">
                Параметры расчёта
              </span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
            <button
              type="button"
              onClick={onShowFormula}
              className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left active:bg-soft"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft text-moss">
                <BookOpen className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 text-[12px] font-semibold text-ink/85">
                Формула и БЖУ
              </span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
          </div>
        </Card>
      </section>

      <InstallCard install={install} />

      <section>
        <SectionLabel
          action={<CircleHelp className="h-3.5 w-3.5 text-muted" />}
        >
          Вопросы
        </SectionLabel>
        <Card>
          <div className="divide-y divide-line/70">
            {faqItems.map((item, index) => {
              const isOpen = open === index;
              return (
                <div key={item.question}>
                  <h2>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${index}`}
                      className="flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left"
                    >
                      <span
                        className={cn(
                          "text-[11px] leading-snug font-semibold transition-colors",
                          isOpen ? "text-moss" : "text-ink/85",
                        )}
                      >
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-transform duration-200",
                          isOpen
                            ? "rotate-45 border-moss bg-moss text-lime"
                            : "border-line bg-soft text-muted",
                        )}
                      >
                        <Plus className="h-2.5 w-2.5" strokeWidth={2.6} />
                      </span>
                    </button>
                  </h2>
                  {isOpen ? (
                    <div
                      id={`faq-${index}`}
                      className="animate-pop px-3.5 pb-3 pr-8 text-[10px] leading-relaxed text-muted"
                    >
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel>О приложении</SectionLabel>
        <Card className="p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime text-moss">
              <Sparkles className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-[11.5px] font-bold text-ink">Норма · 1.0</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                Приложение для расчёта суточной калорийности и БЖУ по формуле.
                Учитывает пол, возраст, рост, вес, активность, цель, ГВ и
                минимальный порог 1200 ккал.
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 border-t border-line/70 pt-2.5">
            <div className="flex items-start gap-1.5 text-[10.5px] leading-snug text-muted">
              <Lock className="mt-0.5 h-2.5 w-2.5 shrink-0 text-sage" />
              Данные хранятся только на этом устройстве и не отправляются на
              сервер.
            </div>
            <div className="flex items-start gap-1.5 text-[10.5px] leading-snug text-muted">
              <ShieldCheck className="mt-0.5 h-2.5 w-2.5 shrink-0 text-sage" />
              Расчёт информационный и не заменяет консультацию врача.
            </div>
            <div className="flex items-start gap-1.5 text-[10.5px] leading-snug text-muted">
              <Smartphone className="mt-0.5 h-2.5 w-2.5 shrink-0 text-sage" />
              Интерфейс создан для смартфона: работает и без интернета.
            </div>
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel>Данные</SectionLabel>
        <Card>
          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left active:bg-soft"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5E7DC] text-terracotta">
              {resetDone ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="flex-1">
              <span className="block text-[12px] font-semibold text-ink/85">
                {resetDone ? "Параметры сброшены" : "Сбросить параметры"}
              </span>
              <span className="mt-0.5 block text-[10px] text-muted">
                Вернём значения по умолчанию
              </span>
            </span>
            {!resetDone ? (
              <ChevronRight className="h-4 w-4 text-muted" />
            ) : null}
          </button>
        </Card>
      </section>

      <div className="flex items-start gap-2 rounded-[16px] bg-cream/60 px-3 py-2.5">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted" />
        <p className="text-[10.5px] leading-relaxed text-muted">
          Ваша цель — {formatNumber(results.calories)} ккал и{" "}
          {results.macros.protein.grams} г белка в день. Небольшие колебания
          допустимы — важна регулярность.
        </p>
      </div>

      <p className="pt-1 text-center text-[10.5px] font-medium text-muted/70">
        © 2026 Норма · калькулятор калорий и БЖУ
      </p>
    </div>
  );
}
