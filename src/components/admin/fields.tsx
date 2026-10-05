'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { t } from './strings';

const controlClass =
  'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink shadow-[inset_0_1px_2px_rgb(43_35_38/0.04)] transition-colors placeholder:text-muted/70 focus:border-magenta focus:ring-2 focus:ring-magenta/20 focus:outline-none disabled:bg-cream';

type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Renders the control; receives the ids to wire label/description. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/** Label + control + hint + inline error, wired for screen readers. */
export function Field({ label, hint, error, optional, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-plum">
        {label}
        {optional ? <span className="text-xs font-normal text-muted">({t.optional})</span> : null}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-[#9b1c1c]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'id'> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** For English / URL / email inputs inside the RTL admin. */
  ltr?: boolean;
};

export function TextField({ label, value, onValueChange, hint, error, optional, ltr, className, ...rest }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <input
          {...rest}
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          dir={ltr ? 'ltr' : undefined}
          lang={ltr ? 'en' : undefined}
          className={cx(controlClass, invalid ? 'border-[#c53030]' : 'border-line', ltr && 'text-left', className)}
        />
      )}
    </Field>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<'textarea'>, 'value' | 'onChange' | 'id'> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  ltr?: boolean;
};

export function TextAreaField({ label, value, onValueChange, hint, error, optional, ltr, rows = 3, ...rest }: TextAreaFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <textarea
          {...rest}
          id={id}
          rows={rows}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          dir={ltr ? 'ltr' : undefined}
          lang={ltr ? 'en' : undefined}
          className={cx(controlClass, 'resize-y', invalid ? 'border-[#c53030]' : 'border-line', ltr && 'text-left')}
        />
      )}
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onValueChange,
  options,
  hint,
  optional,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: ReactNode;
  optional?: boolean;
}) {
  return (
    <Field label={label} hint={hint} optional={optional}>
      {({ id, describedBy }) => (
        <select
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={describedBy}
          className={cx(controlClass, 'border-line')}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** Accessible on/off switch. */
export function Toggle({
  checked,
  onChange,
  label,
  showLabel = true,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  showLabel?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 rounded-full text-sm font-medium text-plum disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className={cx(
          'relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-magenta' : 'bg-blush-deep',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200',
            checked ? 'start-[1.375rem]' : 'start-0.5',
          )}
        />
      </span>
      {showLabel ? label : null}
    </button>
  );
}

/** White card used to group form sections. */
export function Panel({ title, description, children, className }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-card bg-white p-5 shadow-soft ring-1 ring-line/70 sm:p-6', className)}>
      {title ? <h2 className="text-xl">{title}</h2> : null}
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className={title || description ? 'mt-5' : undefined}>{children}</div>
    </section>
  );
}

export function PageHeading({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[2rem] leading-tight sm:text-[2.25rem]">{title}</h1>
        {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx('inline-block animate-spin rounded-full border-2 border-current border-e-transparent', className)}
    />
  );
}
