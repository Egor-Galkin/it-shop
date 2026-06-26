'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // ✅ Добавил только этот импорт
import styles from './BackgroundPattern.module.scss';

// ✅ Добавил список исключений
const EXCLUDED_PATHS = [
  '/profile',
  '/admin/devices',
  '/admin/types',
  '/admin/brands',
  '/admin/users',
  '/admin/orders',
  '/admin/reviews',
  '/admin/deliverys'
];

export function BackgroundPattern() {
  const pathname = usePathname(); // ✅ Добавил только этот хук
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;
      
      const shouldShow = scrollY > 200;
      
      let isFooterVisible = false;
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < windowH) {
          isFooterVisible = true;
        }
      }
      
      setIsVisible(shouldShow && !isFooterVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Проверка исключений — после всех хуков, чтобы не ломать Rules of Hooks
  //const isExcluded = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));

  const isExactExcluded = EXCLUDED_PATHS.some(path => pathname === path);
  const isProductPage = /^\/catalog\/\d+$/.test(pathname || '');
  const isExcluded = isExactExcluded || isProductPage;

  if (isExcluded) return null;

  return (
    <div className={`${styles.patternOverlay} ${isVisible ? styles.visible : ''}`}>
      <svg className={styles.pattern} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lightning" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path 
              d="M50 15 L48 42 L40 42 L50 68 L52 38 L60 38 Z" 
              fill="rgba(161, 161, 170, 0.1)" 
              stroke="rgba(161, 161, 170, 0.25)" 
              strokeWidth="1"
              transform="rotate(45 30 30)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lightning)" />
      </svg>
      <div className={styles.gradientFade} />
    </div>
  );
}