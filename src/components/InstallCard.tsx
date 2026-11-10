import { useState } from "react";
import {
  Apple,
  Check,
  ChevronDown,
  Download,
  Info,
  Share,
  ShieldCheck,
  Sparkles,
  Smartphone,
  X,
} from "lucide-react";
import type { InstallState } from "../hooks/useInstallPrompt";
import { cn } from "../utils/cn";
import { Card } from "./ui";

type Props = {
  install: InstallState;
};

export default function InstallCard({ install }: Props) {
  const [showSteps, setShowSteps] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const steps = install.isIos
    ? [
        {
          title: "Откройте сайт в Safari",
          text: "Установка на iPhone и iPad работает именно в Safari.",
        },
        {
          title: "Нажмите «Поделиться»",
          text: "Кнопка со стрелкой вверх в нижней панели браузера.",
        },
        {
          title: "Выберите «На экран „Домой“»",
          text: "Пролистайте меню и подтвердите добавление.",
        },
        {
          title: "Нажмите «Добавить»",
          text: "Иконка «Норма» появится среди приложений.",
        },
      ]
    : [
        {
          title: "Откройте меню браузера",
          text: "Три точки в правом верхнем углу Chrome или другого браузера.",
        },
        {
          title: "Выберите «Установить приложение»",
          text: "В некоторых браузерах — «Добавить на главный экран».",
        },
        {
          title: "Подтвердите установку",
          text: "Приложение появится на главном экране и в списке программ.",
        },
        {
          title: "Откройте «Норму»",
          text: "Запускается отдельно от браузера, на весь экран.",
        },
      ];

  const handleInstall = async () => {
    setMessage(null);
    const outcome = await install.install();
    if (outcome === "accepted") {
      setMessage("Готово! «Норма» установлена на устройство.");
      return;
    }
    if (outcome === "dismissed") {
      setMessage("Установка отменена. Можно вернуться к ней позже.");
      return;
    }
    setShowSteps(true);
    setMessage(
      install.isIos
        ? "На iOS установка выполняется вручную — шаги ниже."
        : "Системное окно недоступно. Используйте инструкцию ниже.",
    );
  };

  return (
    <section id="install-card" className="scroll-mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <h2 className="text-[10px] font-extrabold tracking-[0.13em] text-muted uppercase">
          Приложение
        </h2>
        <span className="flex items-center gap-1 rounded-full bg-cream px-1.5 py-0.5 text-[8.5px] font-bold text-moss ring-1 ring-line">
          <Sparkles className="h-2.5 w-2.5" />
          PWA
        </span>
      </div>

      <Card className="border-moss/15 bg-ink p-3.5 text-cream">
        <div className="flex items-start gap-2.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-moss ring-1 ring-lime/25">
            <img
              src="icons/icon-192.png"
              alt="Иконка приложения «Норма»"
              width={30}
              height={30}
              className="h-[30px] w-[30px] rounded-[8px]"
              loading="lazy"
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[12.5px] font-bold">Норма</p>
                <p className="mt-0.5 text-[9px] font-medium text-cream/50">
                  Установите на смартфон
                </p>
              </div>
              {install.installed ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-lime px-2 py-1 text-[8.5px] font-bold text-ink">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  установлено
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[9.5px] leading-snug text-cream/55">
              Иконка на главном экране, запуск на весь экран и работа без
              интернета. Без магазинов приложений, регистрации и лишних
              разрешений.
            </p>
          </div>
        </div>

        {install.installed ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-lime/15 px-2.5 py-2">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-lime" strokeWidth={3} />
            <p className="text-[9.5px] leading-snug text-cream/70">
              Приложение уже установлено. Откройте его с домашнего экрана —
              данные расчёта сохранятся.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstall}
            disabled={install.busy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-3 py-3 text-[11.5px] font-bold text-ink transition active:scale-[0.98] disabled:opacity-70"
          >
            <Download className="h-4 w-4" strokeWidth={2.2} />
            {install.busy
              ? "Открываем установку…"
              : install.promptAvailable
                ? "Установить приложение"
                : install.isIos
                  ? "Как установить на iPhone"
                  : "Установить приложение"}
          </button>
        )}

        {message ? (
          <p className="animate-pop mt-2 text-center text-[9px] leading-snug font-medium text-lime/80">
            {message}
          </p>
        ) : null}

        {!install.installed ? (
          <button
            type="button"
            onClick={() => setShowSteps((value) => !value)}
            aria-expanded={showSteps}
            className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-[9px] font-semibold text-cream/45 active:text-cream/70"
          >
            <span>
              {install.isIos
                ? "Инструкция для Safari"
                : "Пошаговая инструкция"}
            </span>
            <span className="flex items-center gap-1">
              {showSteps ? "свернуть" : "показать"}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  showSteps && "rotate-180",
                )}
              />
            </span>
          </button>
        ) : null}

        {showSteps && !install.installed ? (
          <div className="animate-pop mt-2 rounded-xl border border-cream/10 bg-cream/[0.05] p-2.5">
            {install.isIos ? (
              <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold text-cream/70">
                <Apple className="h-3 w-3 text-lime" /> Safari · iOS
              </div>
            ) : (
              <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold text-cream/70">
                <Smartphone className="h-3 w-3 text-lime" /> Android · Chrome
              </div>
            )}
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime/20 text-[8px] font-extrabold text-lime">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[9.5px] font-bold text-cream/85">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[8.5px] leading-snug text-cream/45">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            {install.isIos ? (
              <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-cream/[0.06] px-2 py-1.5 text-[8.5px] text-cream/50">
                <Share className="h-3 w-3 shrink-0 text-lime" />
                Кнопка «Поделиться» находится внизу экрана Safari
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-cream/10 pt-2.5 text-[8px] font-medium text-cream/40">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-2.5 w-2.5 text-lime/60" />
            без рекламы
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-lime/60" />
            работает офлайн
          </span>
          <span className="flex items-center gap-1">
            <Info className="h-2.5 w-2.5 text-lime/60" />
            данные на устройстве
          </span>
        </div>
      </Card>

      {!install.installed && !install.promptAvailable ? (
        <p className="mt-1.5 px-1 text-[8.5px] leading-snug text-muted">
          {!install.secure
            ? "Установка доступна по защищённому адресу (https). Откройте приложение по ссылке с https, чтобы добавить его на экран."
            : install.isMobile
              ? "Если кнопка не вызвала системное окно, добавьте приложение через меню браузера — инструкция выше."
              : "На компьютере приложение можно закрепить через иконку установки в адресной строке. Полноценная установка — на смартфоне."}
        </p>
      ) : null}

      {install.promptAvailable && !install.hintDismissed ? (
        <div className="mt-1.5 flex items-start gap-1.5 rounded-xl border border-line bg-cream px-2.5 py-2">
          <Info className="mt-0.5 h-2.5 w-2.5 shrink-0 text-moss" />
          <p className="flex-1 text-[8.5px] leading-snug text-muted">
            Браузер готов установить приложение. Это безопасно: скачивается
            только сам интерфейс.
          </p>
          <button
            type="button"
            onClick={install.dismissHint}
            aria-label="Скрыть подсказку"
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted active:bg-soft"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
