export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    tone = "danger",
    loading = false,
    onCancel,
    onConfirm,
}) {
    if (!open) return null;

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
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={`admin-button ${tone === "danger" ? "admin-button--danger" : ""}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Suppression..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
