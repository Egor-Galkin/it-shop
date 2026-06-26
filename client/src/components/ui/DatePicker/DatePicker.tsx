'use client';
import { useState, useEffect } from 'react';
import styles from './DatePicker.module.scss';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  disabled?: boolean; // ✅ Добавлено
}

export function DatePicker({ 
  label, 
  value, 
  onChange, 
  minDate, 
  maxDate, 
  className = '',
  disabled = false // ✅ Добавлено
}: DatePickerProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onChange(val);
  };

  return (
    <div className={`${styles.datePicker} ${className}`}>
      <label className={styles.label}>{label}</label>
      <input 
        type="date" 
        value={localValue} 
        onChange={handleChange}
        min={minDate}
        max={maxDate}
        disabled={disabled} // ✅ Пробрасываем disabled
        className={`${styles.input} ${disabled ? styles.disabled : ''}`}
      />
    </div>
  );
}