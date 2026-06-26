'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.scss';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = 'Выберите...', className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerClick = () => {
    if (isPinned) {
      setIsOpen(false);
      setIsPinned(false);
    } else {
      setIsOpen(true);
      setIsPinned(true);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isPinned) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      closeTimerRef.current = setTimeout(() => setIsOpen(false), 400);
    }
  };

  const handleOptionClick = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setIsPinned(false);
  };

  return (
    <div 
      ref={selectRef}
      className={`${styles.select} ${isOpen ? styles.open : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.trigger} onClick={handleTriggerClick}>
        <span className={styles.text}>{displayText}</span>
        <span className={styles.arrow}>▼</span>
      </div>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${opt.value === value ? styles.active : ''}`}
              onClick={() => handleOptionClick(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}