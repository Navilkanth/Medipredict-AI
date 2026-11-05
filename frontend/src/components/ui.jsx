import { X } from "lucide-react"

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close dialog" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-sky-100">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-sky-50" aria-label="Close">
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
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function StatCard({ label, value, hint, icon }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
        </div>
        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">{icon}</div>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-500">{hint}</p>
    </article>
  )
}

export function StatusBadge({ status }) {
  const styles =
    status === "completed" || status === "created"
      ? "bg-emerald-50 text-emerald-700"
      : status === "rejected" || status === "failed"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-800"
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${styles}`}>{status}</span>
}

export function PageCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sky-100">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function LoadingState({ label = "Loading records..." }) {
  return <p className="rounded-2xl bg-white px-5 py-8 text-sm text-slate-500 shadow-sm ring-1 ring-sky-100">{label}</p>
}

export function ErrorState({ message }) {
  return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800 ring-1 ring-rose-100">{message}</p>
}
