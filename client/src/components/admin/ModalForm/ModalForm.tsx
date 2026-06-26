'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@/components/ui/Loader/Loader';
import styles from './ModalForm.module.scss';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
  onSubmit: (data: any) => Promise<void>;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea';
    required?: boolean;
    minLength?: number;
    placeholder?: string;
  }>;
  initialValues?: Record<string, any>;
  submitLabel?: string;
  cancelLabel?: string;
}

export function ModalForm({
  isOpen,
  onClose,
  title,
  isLoading = false,
  onSubmit,
  fields,
  initialValues = {},
  submitLabel = 'Сохранить',
  cancelLabel = 'Отмена'
}: ModalFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues || {});
  
  // Закрытие по клику вне модального окна
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Сброс формы при открытии
  useEffect(() => {
    if (isOpen) {
      setFormValues(initialValues || {});
    }
  }, [isOpen, initialValues]);

  const handleChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Закрыть">
            ✕
          </button>
        </div>
        
        {isLoading ? (
          <div className={styles.modalBody}>
            <Loader text="Сохранение..." size="medium" />
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit(formValues);
          }} className={styles.modalBody}>
            {fields.map(field => (
              <div key={field.name} className={styles.formGroup}>
                <label className={styles.label} htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className={styles.required}> *</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    minLength={field.minLength}
                    placeholder={field.placeholder}
                    rows={4}
                    className={styles.input}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    minLength={field.minLength}
                    placeholder={field.placeholder}
                    className={styles.input}
                  />
                )}
                
                {field.minLength && formValues[field.name]?.length > 0 && formValues[field.name].length < field.minLength && (
                  <span className={styles.error}>
                    Минимум {field.minLength} символов
                  </span>
                )}
              </div>
            ))}
            
            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                {cancelLabel}
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}