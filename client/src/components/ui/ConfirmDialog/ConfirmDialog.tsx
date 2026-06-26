'use client';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger';
}

export function ConfirmDialog({ 
  title, message, onConfirm, onCancel, 
  confirmText = 'Подтвердить', cancelText = 'Отмена', type = 'default' 
}: ConfirmDialogProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelBtn}>{cancelText}</button>
          <button onClick={onConfirm} className={`${styles.confirmBtn} ${type === 'danger' ? styles.danger : ''}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}