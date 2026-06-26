'use client';
import { useState, useEffect } from 'react';
import { FloatingCart } from '@/components/ui/FloatingCart/FloatingCart';
import styles from './FloatingWidgets.module.scss';

export function FloatingWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Показывать кнопку "наверх" после прокрутки 300px
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.widgets}>
      {/* ✅ Плавающая корзина (показывается только авторизованным) */}
      <FloatingCart />
      
      {/* ✅ Кнопка "Наверх" */}
      {showScrollTop && (
        <button 
          className={styles.scrollTopBtn}
          onClick={scrollToTop}
          aria-label="Наверх"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}