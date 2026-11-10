import type { CSSProperties, ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../utils/cn";

export function SectionLabel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 px-1">
      <h2 className="text-[10px] font-extrabold tracking-[0.13em] text-muted uppercase">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-line/90 bg-cream",
        className,
      )}
    >
      {children}
    </div>
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const trim = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(1))).replace(".", ",");

export function StepperRow({
  id,
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 1,
  icon,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  icon?: ReactNode;
}) {
  const parsed = Number.parseFloat(value.replace(",", "."));
  const base = Number.isFinite(parsed) ? parsed : min;

  const nudge = (direction: 1 | -1) =>
    onChange(trim(clamp(Number((base + step * direction).toFixed(1)), min, max)));

  return (
    <div className="flex min-h-[54px] items-center justify-between gap-2 px-3.5 py-2">
      <label
        htmlFor={id}
        className="flex min-w-0 items-center gap-2.5 text-[12.5px] font-semibold text-ink/80"
      >
        {icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-soft text-moss-light">
            {icon}
          </span>
        ) : null}
        <span className="truncate">{label}</span>
      </label>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label={`Уменьшить: ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition active:scale-90 active:bg-line/60"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2.6} />
        </button>
        <div className="flex w-[92px] items-baseline justify-center gap-1 rounded-xl bg-soft px-1.5 py-1.5 ring-1 ring-line/60 transition focus-within:bg-white focus-within:ring-moss/30">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              if (/^\d{0,4}([.,]\d?)?$/.test(next)) onChange(next);
            }}
            onBlur={() => {
              if (value.trim() === "") {
                onChange(trim(min));
                return;
              }
              const current = Number.parseFloat(value.replace(",", "."));
              if (Number.isFinite(current)) {
                onChange(trim(clamp(current, min, max)));
              }
            }}
            className="w-full min-w-0 bg-transparent text-right text-[16px] leading-none font-bold text-ink outline-none"
            aria-label={label}
          />
          <span className="shrink-0 text-[10px] font-medium text-muted">
            {unit}
          </span>
        </div>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label={`Увеличить: ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition active:scale-90 active:bg-line/60"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex gap-1 rounded-2xl bg-soft p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-[11px] font-bold transition-all duration-150 active:scale-[0.97]",
              active
                ? "bg-cream text-ink shadow-[0_2px_8px_rgba(22,38,30,0.08)]"
                : "text-muted",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[28px] w-[48px] shrink-0 rounded-full p-[3px] transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-moss/20 focus-visible:outline-none",
        checked ? "bg-moss" : "bg-line",
      )}
    >
      <span
        className={cn(
          "block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[20px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="range-input"
      style={{ "--fill": `${fill}%` } as CSSProperties}
    />
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onClick,
  active,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const content = (
    <>
      {icon ? (
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            active ? "bg-moss text-lime" : "bg-soft text-moss-light",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[12.5px] font-semibold text-ink">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[10px] font-medium text-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
      {right}
    </>
  );

  if (!onClick) {
    return (
      <div className="flex min-h-[54px] w-full items-center gap-2.5 px-3.5 py-2.5">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[54px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition active:bg-soft",
        active && "bg-soft/70",
      )}
    >
      {content}
    </button>
  );
}
