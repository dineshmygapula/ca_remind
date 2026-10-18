"use client";

import { Toaster, toast, resolveValue, type Toast } from "react-hot-toast";

const VARIANTS = {
  success: { color: "#16a34a", title: "Success" },
  error: { color: "#dc2626", title: "Something went wrong" },
  loading: { color: "var(--accent)", title: "Please wait" },
  blank: { color: "var(--accent)", title: "Notice" },
  custom: { color: "var(--accent)", title: "Notice" },
} as const;

function Icon({ type }: { type: Toast["type"] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "success")
    return (
      <svg {...common}>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    );
  if (type === "error")
    return (
      <svg {...common}>
        <path d="M12 7v6M12 17h.01" />
      </svg>
    );
  if (type === "loading")
    return (
      <svg {...common} className="app-toast-spin">
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function ToastCard({ t }: { t: Toast }) {
  const v = VARIANTS[t.type] ?? VARIANTS.blank;
  const showBar = t.type !== "loading" && Number.isFinite(t.duration);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`app-toast ${t.visible ? "app-toast-enter" : "app-toast-leave"}`}
      style={{ ["--toast-color" as string]: v.color }}
    >
      <div className="app-toast-icon">
        <Icon type={t.type} />
      </div>

      <div className="app-toast-body">
        <p className="app-toast-title">{v.title}</p>
        <p className="app-toast-message">{resolveValue(t.message, t)}</p>
      </div>

      {t.type !== "loading" && (
        <button
          type="button"
          aria-label="Dismiss notification"
          className="app-toast-close"
          onClick={() => toast.dismiss(t.id)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}

      {showBar && (
        <span
          className="app-toast-bar"
          style={{ animationDuration: `${t.duration}ms` }}
        />
      )}
    </div>
  );
}

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{ top: 20 }}
      toastOptions={{ duration: 3500 }}
    >
      {(t) => <ToastCard t={t} />}
    </Toaster>
  );
}
