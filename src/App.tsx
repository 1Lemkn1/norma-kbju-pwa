import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BatteryFull,
  BookOpen,
  Calculator,
  ChartPie,
  Check,
  CircleHelp,
  Copy,
  Leaf,
  ShieldCheck,
  Signal,
  Smartphone,
  Sparkles,
  Wifi,
  Download,
} from "lucide-react";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import CalculatorScreen from "./screens/CalculatorScreen";
import FormulaScreen from "./screens/FormulaScreen";
import MoreScreen from "./screens/MoreScreen";
import ResultScreen from "./screens/ResultScreen";
import {
  buildSummary,
  computeResults,
  DEFAULT_INPUTS,
  formatNumber,
  MACRO_RANGES,
  type Inputs,
} from "./lib/calc";
import { cn } from "./utils/cn";

const STORAGE_KEY = "norma-calculator-v1";

type Screen = "calc" | "result" | "formula" | "more";

const screens: Screen[] = ["calc", "result", "formula", "more"];

const tabs: { id: Screen; label: string; icon: typeof Calculator }[] = [
  { id: "calc", label: "Расчёт", icon: Calculator },
  { id: "result", label: "Норма", icon: ChartPie },
  { id: "formula", label: "Формула", icon: BookOpen },
  { id: "more", label: "Ещё", icon: CircleHelp },
];

function screenFromHash(): Screen {
  const hash = window.location.hash.replace("#", "") as Screen;
  return screens.includes(hash) ? hash : "calc";
}

function formatClock() {
  return new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const numericString = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && /^\d{1,4}([.,]\d{1,2})?$/.test(value.trim())) {
    return value.trim();
  }
  return fallback;
};

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

/* Сохранённые данные могли остаться от старой версии приложения: приводим их
 * к актуальной схеме, иначе мусор в localStorage попадал прямо в расчёт. */
function sanitizeInputs(raw: Partial<Inputs> | null | undefined): Inputs {
  if (!raw || typeof raw !== "object") return DEFAULT_INPUTS;

  return {
    sex: raw.sex === "male" || raw.sex === "female" ? raw.sex : DEFAULT_INPUTS.sex,
    age: numericString(raw.age, DEFAULT_INPUTS.age),
    height: numericString(raw.height, DEFAULT_INPUTS.height),
    currentWeight: numericString(raw.currentWeight, DEFAULT_INPUTS.currentWeight),
    targetWeight: numericString(raw.targetWeight, DEFAULT_INPUTS.targetWeight),
    activity:
      raw.activity === "low" || raw.activity === "medium" || raw.activity === "high"
        ? raw.activity
        : DEFAULT_INPUTS.activity,
    goal:
      raw.goal === "lose" || raw.goal === "maintain" || raw.goal === "gain"
        ? raw.goal
        : DEFAULT_INPUTS.goal,
    deficit: clampNumber(raw.deficit, DEFAULT_INPUTS.deficit, 10, 20),
    autoDeficit:
      typeof raw.autoDeficit === "boolean"
        ? raw.autoDeficit
        : DEFAULT_INPUTS.autoDeficit,
    breastfeeding:
      typeof raw.breastfeeding === "boolean"
        ? raw.breastfeeding
        : DEFAULT_INPUTS.breastfeeding,
    proteinPerKg: clampNumber(
      raw.proteinPerKg,
      DEFAULT_INPUTS.proteinPerKg,
      MACRO_RANGES.protein.min,
      MACRO_RANGES.protein.max,
    ),
    fatPerKg: clampNumber(
      raw.fatPerKg,
      DEFAULT_INPUTS.fatPerKg,
      MACRO_RANGES.fat.min,
      MACRO_RANGES.fat.max,
    ),
    carbsPerKg: clampNumber(
      raw.carbsPerKg,
      DEFAULT_INPUTS.carbsPerKg,
      MACRO_RANGES.carbs.min,
      MACRO_RANGES.carbs.max,
    ),
  };
}

function loadInputs(): Inputs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INPUTS;
    return sanitizeInputs(JSON.parse(raw) as Partial<Inputs>);
  } catch {
    return DEFAULT_INPUTS;
  }
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(loadInputs);
  const [screen, setScreen] = useState<Screen>(screenFromHash);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const install = useInstallPrompt();

  const results = useMemo(() => computeResults(inputs), [inputs]);

  const [clock, setClock] = useState(formatClock);
  const pendingScroll = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 20_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      // Autosave is optional — the calculator works without storage.
    }
  }, [inputs]);

  useEffect(() => {
    const handleHash = () => setScreen(screenFromHash());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (window.location.hash.replace("#", "") !== screen) {
      window.location.hash = screen;
    }
    scrollRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const go = (next: Screen) => {
    setScreen(next);
    if (next === "result") setCopied(false);
  };

  const openInstallCard = () => {
    if (screen === "more") {
      document
        .getElementById("install-card")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    pendingScroll.current = true;
    go("more");
  };

  /* После перехода на «Ещё» прокручиваем к карточке установки — раньше
   * первое нажатие кнопки в шапке только переключало экран. */
  useEffect(() => {
    if (screen !== "more" || !pendingScroll.current) return;
    pendingScroll.current = false;
    const id = window.setTimeout(() => {
      document
        .getElementById("install-card")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 260);
    return () => window.clearTimeout(id);
  }, [screen]);

  const updateInputs = (patch: Partial<Inputs>) =>
    setInputs((previous) => ({ ...previous, ...patch }));

  const resetInputs = () => {
    setInputs(DEFAULT_INPUTS);
    setCopied(false);
  };

  const copyCalculation = async () => {
    const text = buildSummary(results);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard unavailable");
      }
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      } catch {
        // Keep the confirmation flow graceful if copying is blocked.
      }
    }
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#e8e3d7] lg:flex lg:items-center lg:justify-center lg:gap-10 lg:px-8 lg:py-8 xl:gap-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 hidden h-[520px] w-[520px] rounded-full bg-[#f7f3e8] blur-[80px] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-48 hidden h-[560px] w-[560px] rounded-full bg-lime/20 blur-[90px] lg:block"
      />

      <DesktopIntro
        calories={results.calories}
        protein={results.macros.protein.grams}
        fat={results.macros.fat.grams}
        carbs={results.macros.carbs.grams}
        goal={results.goal}
        onCalc={() => go("calc")}
        onResult={() => go("result")}
        onFormula={() => go("formula")}
      />

      <div className="relative z-10 flex h-dvh w-full flex-col overflow-hidden bg-canvas lg:h-[min(880px,calc(100dvh-64px))] lg:w-[418px] lg:shrink-0 lg:rounded-[42px] lg:border-[7px] lg:border-[#182820] lg:shadow-[0_50px_90px_-40px_rgba(22,38,30,0.65)]">
        <StatusBar clock={clock} />

        <header className="relative z-20 flex shrink-0 items-center gap-3 border-b border-line/60 bg-canvas/95 px-4 pb-2 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl lg:pt-1.5">
          <button
            type="button"
            onClick={() => go("calc")}
            aria-label="На главный экран"
            className="flex items-center gap-1.5 rounded-full transition active:scale-95"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss text-lime">
              <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="font-display text-[21px] leading-none tracking-tight text-ink">
              норма<span className="text-sage">.</span>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            {!install.installed ? (
              <button
                type="button"
                onClick={openInstallCard}
                aria-label="Установить приложение"
                title="Установить приложение"
                className="flex h-8 items-center gap-1 rounded-full border border-moss/20 bg-lime/60 px-2 text-moss transition active:scale-95"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="text-[9.5px] font-bold">Установить</span>
              </button>
            ) : null}
            {screen === "result" ? (
              <button
                type="button"
                onClick={copyCalculation}
                aria-label="Скопировать расчёт"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-cream text-moss transition active:scale-90"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go("result")}
                className="flex items-center gap-1.5 rounded-full border border-line bg-cream px-2.5 py-1.5 text-[10px] font-bold text-moss transition active:scale-95"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                {formatNumber(results.calories)} ккал
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </header>

        <main
          ref={scrollRef}
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div key={screen} className="animate-screen">
            {screen === "calc" ? (
              <CalculatorScreen
                inputs={inputs}
                results={results}
                onChange={updateInputs}
                onReset={resetInputs}
                onShowResult={() => go("result")}
                onShowFormula={() => go("formula")}
              />
            ) : screen === "result" ? (
              <ResultScreen
                inputs={inputs}
                results={results}
                onChange={updateInputs}
                onCopy={copyCalculation}
                copied={copied}
                onEdit={() => go("calc")}
                onShowFormula={() => go("formula")}
              />
            ) : screen === "formula" ? (
              <FormulaScreen
                results={results}
                onShowCalculator={() => go("calc")}
                onShowResult={() => go("result")}
              />
            ) : (
              <MoreScreen
                results={results}
                install={install}
                onReset={resetInputs}
                onShowCalculator={() => go("calc")}
                onShowResult={() => go("result")}
                onShowFormula={() => go("formula")}
              />
            )}
          </div>
        </main>

        <nav
          aria-label="Экраны приложения"
          className="relative z-20 shrink-0 border-t border-line/80 bg-cream/95 px-2 pt-1 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur-xl"
        >
          <div className="flex items-center">
            {tabs.map((tab) => {
              const active = screen === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => go(tab.id)}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 transition active:scale-95"
                >
                  <span
                    className={cn(
                      "flex h-7 w-11 items-center justify-center rounded-full transition-colors duration-200",
                      active ? "bg-lime text-moss" : "text-muted",
                    )}
                  >
                    <Icon
                      className="h-[17px] w-[17px]"
                      strokeWidth={active ? 2.3 : 1.9}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-bold tracking-tight transition-colors",
                      active ? "text-moss" : "text-muted/80",
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {copied ? (
          <div
            role="status"
            className="animate-pop pointer-events-none absolute inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 flex items-center justify-center gap-2 rounded-full bg-moss px-4 py-2.5 text-[11px] font-semibold text-cream shadow-lg"
          >
            <Check className="h-3.5 w-3.5 text-lime" strokeWidth={2.8} />
            Расчёт скопирован
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatusBar({ clock }: { clock: string }) {
  return (
    <div className="hidden shrink-0 items-center justify-between px-6 pt-2 pb-0.5 text-ink lg:flex">
      <span className="text-[10px] font-extrabold tracking-tight tabular-nums">
        {clock}
      </span>
      <span className="ml-2 flex flex-1 justify-center">
        <span className="h-[18px] w-[70px] rounded-full bg-[#182820]" />
      </span>
      <span className="flex items-center gap-1">
        <Signal className="h-3 w-3" strokeWidth={2.4} />
        <Wifi className="h-3 w-3" strokeWidth={2.4} />
        <BatteryFull className="h-4 w-4" strokeWidth={2} />
      </span>
    </div>
  );
}

function DesktopIntro({
  calories,
  protein,
  fat,
  carbs,
  goal,
  onCalc,
  onResult,
  onFormula,
}: {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  goal: Inputs["goal"];
  onCalc: () => void;
  onResult: () => void;
  onFormula: () => void;
}) {
  const goalLabel =
    goal === "lose" ? "Похудение" : goal === "gain" ? "Набор" : "Поддержание";

  return (
    <aside className="relative z-10 hidden h-[min(880px,calc(100dvh-64px))] w-[340px] shrink-0 flex-col justify-center lg:flex xl:w-[390px]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss text-lime">
          <Leaf className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div className="leading-none">
          <p className="font-display text-[30px] leading-none tracking-tight text-ink">
            норма<span className="text-sage">.</span>
          </p>
          <p className="mt-1.5 text-[8px] font-bold tracking-[0.22em] text-muted uppercase">
            питание без догадок
          </p>
        </div>
      </div>

      <h1 className="mt-9 font-display text-[50px] leading-[0.94] tracking-[-0.02em] text-ink xl:text-[58px]">
        Норма всегда
        <br />
        <em className="text-moss">под рукой.</em>
      </h1>
      <p className="mt-4 max-w-[330px] text-[12.5px] leading-relaxed text-muted">
        Калории и БЖУ по формуле — с активностью, целью и грудным
        вскармливанием. Всё в телефоне, без лишних экранов.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-line bg-cream/80 p-3.5">
          <p className="text-[8px] font-bold tracking-[0.1em] text-muted uppercase">
            сейчас
          </p>
          <p className="mt-1 font-display text-[27px] leading-none text-ink tabular-nums">
            {formatNumber(calories)}
            <span className="ml-1 font-sans text-[8.5px] font-medium text-muted">
              ккал
            </span>
          </p>
          <p className="mt-1 text-[8.5px] font-semibold text-moss">{goalLabel}</p>
        </div>
        <div className="rounded-2xl border border-line bg-cream/80 p-3.5">
          <p className="text-[8px] font-bold tracking-[0.1em] text-muted uppercase">
            бжу
          </p>
          <p className="mt-1.5 text-[10px] font-bold leading-relaxed text-ink/80">
            Б {protein} · Ж {fat}
            <br />У {carbs} г
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {[
          {
            icon: Calculator,
            title: "Один расчёт — четыре экрана",
            text: "Параметры, норма, формула и помощь",
          },
          {
            icon: ShieldCheck,
            title: "Данные только на устройстве",
            text: "Без регистрации и отправки на сервер",
          },
          {
            icon: Sparkles,
            title: "Порог 1200 ккал и учёт ГВ",
            text: "Безопасные границы из формулы",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss">
                <Icon className="h-3 w-3" />
              </span>
              <div>
                <p className="text-[10.5px] font-bold text-ink/80">{item.title}</p>
                <p className="mt-0.5 text-[9.5px] text-muted">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onCalc}
          className="rounded-full bg-ink px-3 py-1.5 text-[9.5px] font-bold text-cream transition hover:bg-moss"
        >
          Параметры
        </button>
        <button
          type="button"
          onClick={onResult}
          className="rounded-full border border-line bg-cream px-3 py-1.5 text-[9.5px] font-bold text-muted transition hover:text-ink"
        >
          Моя норма
        </button>
        <button
          type="button"
          onClick={onFormula}
          className="rounded-full border border-line bg-cream px-3 py-1.5 text-[9.5px] font-bold text-muted transition hover:text-ink"
        >
          Формула
        </button>
      </div>

      <div className="mt-8 flex items-center gap-1.5 text-[9px] font-medium text-muted">
        <Smartphone className="h-3.5 w-3.5" />
        Откройте на смартфоне — интерфейс уже адаптирован
      </div>
    </aside>
  );
}


