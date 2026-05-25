import { useTranslation } from "react-i18next";

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone = "danger",
    loading = false,
    onCancel,
    onConfirm,
}) {
    const { t } = useTranslation();

    if (!open) return null;

    const resolvedConfirmLabel = confirmLabel ?? t("admin.confirm.defaultConfirm");
    const resolvedCancelLabel = cancelLabel ?? t("admin.confirm.cancel");

    return (
        <div className="confirm-dialog-backdrop" role="presentation">
            <div
                className="confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >
                <h3 id="confirm-dialog-title">{title}</h3>
                <p>{message}</p>

                <div className="confirm-dialog__actions">
                    <button
                        type="button"
                        className="admin-button admin-button--secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {resolvedCancelLabel}
                    </button>

                    <button
                        type="button"
                        className={`admin-button ${tone === "danger" ? "admin-button--danger" : ""}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? t("admin.confirm.deletingLabel") : resolvedConfirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
