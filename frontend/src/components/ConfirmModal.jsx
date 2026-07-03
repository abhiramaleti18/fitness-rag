import './ConfirmModal.css';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="confirm-backdrop" onClick={onCancel}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-actions">
                    <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm-delete" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}