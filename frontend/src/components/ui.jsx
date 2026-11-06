import { X } from "lucide-react"

export function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-sky-100 transition-all dark:bg-[#111827] dark:ring-slate-800 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-sky-100/70 pb-4 dark:border-slate-800">
          <h2 className="text-xl font-bold text-[#0f2744] dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
      <div className="mt-7 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60 dark:bg-rose-700 dark:hover:bg-rose-600"
        >
          {busy ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function StatCard({ label, value, hint, icon }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#111827] dark:ring-slate-800/80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#0f2744] dark:text-white">
            {value}
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
    </article>
  )
}

export function StatusBadge({ status }) {
  const isPositive = status === "completed" || status === "created"
  const isNegative = status === "rejected" || status === "failed"

  const styles = isPositive
    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
    : isNegative
    ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
    : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"

  const display =
    status === "completed"
      ? "Analyzed"
      : status === "failed"
      ? "Action needed"
      : status === "pending"
      ? "Pending review"
      : status

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase ${styles}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isPositive ? "bg-emerald-500" : isNegative ? "bg-rose-500" : "bg-amber-500"
        }`}
      />
      {display}
    </span>
  )
}

export function PageCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sky-100 transition-colors dark:bg-[#111827] dark:ring-slate-800/80">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-sky-100/60 pb-4 dark:border-slate-800">
        <div>
          <h2 className="font-display text-xl font-bold text-[#0f2744] dark:text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function LoadingState({ label = "Loading clinical records..." }) {
  return (
    <div className="flex items-center justify-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-sky-100 dark:bg-[#111827] dark:ring-slate-800">
      <div className="space-y-3">
        <div className="mx-auto size-7 animate-spin rounded-full border-3 border-sky-600 border-t-transparent dark:border-sky-400" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-6 py-5 text-sm font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
      {message}
    </div>
  )
}
