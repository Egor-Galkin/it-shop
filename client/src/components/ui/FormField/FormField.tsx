'use client';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './FormField.module.scss';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  error?: string;
  touched?: boolean;
  autoComplete?: string;
  as?: 'input' | 'textarea';
  type?: 'text' | 'password' | 'email';
  rows?: number;
  className?: string;
  disabled?: boolean; // ← Добавлено
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ 
    label, name, value, onChange, onBlur, placeholder, minLength, required, 
    error, touched, autoComplete, as = 'input', type = 'text', rows, className, disabled 
  }, ref) => {
    const hasError = Boolean(touched && error);
    const isValid = Boolean(touched && !error && value);

    const baseProps = {
      id: name,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      minLength,
      required,
      autoComplete,
      disabled, // ← Пробрасываем disabled
      className: `${styles.fieldInput} ${hasError ? styles.stateError : ''} ${isValid ? styles.stateValid : ''} ${disabled ? styles.disabled : ''}`,
      ref,
    };

    return (
      <div className={`${styles.field} ${className}`}>
        <label htmlFor={name} className={styles.label}>{label}</label>
        {as === 'textarea' ? (
          <textarea {...(baseProps as TextareaHTMLAttributes<HTMLTextAreaElement>)} rows={rows || 4} />
        ) : (
          <input {...(baseProps as InputHTMLAttributes<HTMLInputElement>)} type={type} />
        )}
        {hasError && (
          <span className={styles.message} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';