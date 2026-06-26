'use client';
import { useState, useEffect } from 'react';
import styles from './ScrollToTop.module.scss';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`${styles.button} ${isVisible ? styles.visible : ''}`}
      aria-label="Подняться наверх"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12H9V20H15V12H20L12 4Z" fill="white"/>
      </svg>
    </button>
  );
}