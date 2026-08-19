'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth.slice';
import Image from 'next/image';
import styles from './Header.module.scss';

export function Header() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  
  // ✅ Флаг: компонент смонтирован на клиенте (предотвращает гидратацию)
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [isEmailPinned, setIsEmailPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Устанавливаем isHydrated после монтирования
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const header = headerRef.current;

    if (!footer || !header) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = window.innerHeight * 0.5;
      const footerRect = footer.getBoundingClientRect();
      const windowH = window.innerHeight;
      const fadeZone = 150;
      
      if (scrollY < scrollThreshold) {
        header.style.opacity = '1';
        return;
      }
      
      if (footerRect.top < windowH) {
        const progress = (windowH - footerRect.top) / fadeZone;
        header.style.opacity = String(Math.max(0, 1 - progress));
      } else {
        header.style.opacity = '1';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    router.refresh();
    setIsEmailPinned(false);
  };

  const isActive = (path: string) => pathname === path;

  // ✅ Показывать email, если: зафиксирован ИЛИ наведение (и не мобильный)
  const showEmail = isEmailPinned || (isHovered && typeof window !== 'undefined' && window.innerWidth > 768);

  return (
    <header 
      ref={headerRef} 
      className={styles.header}
      style={{ willChange: 'opacity', transition: 'opacity 0.1s linear' }}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/logo.svg" 
                alt="ITshop" 
                width={40} 
                height={40} 
                className={styles.logoImage}
                priority
              />
              <span className={styles.logoText}>ITshop</span>
            </div>
          </Link>
          
          <nav className={styles.nav}>
            <Link 
              href="/catalog" 
              className={`${styles.navLink} ${isActive('/catalog') ? styles.active : ''}`}
            >
              Каталог
            </Link>
            
            {/* ✅ Рендерим ссылку "Профиль" ТОЛЬКО после гидратации */}
            {/* Это предотвращает mismatch: сервер и клиент видят одинаковый HTML до isHydrated */}
            {isHydrated && user && (
              <Link 
                href="/profile" 
                className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}
              >
                Профиль
              </Link>
            )}
          </nav>
        </div>
        
        <div className={styles.right}>
          {/* ✅ Рендерим авторизованный блок ТОЛЬКО после гидратации */}
          {isHydrated && user ? (
            <>
              <div 
                className={styles.userBlock}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsEmailPinned(prev => !prev)}
              >
                {showEmail && (
                  <span className={`${styles.userEmail} ${isEmailPinned ? styles.pinned : ''}`}>
                    {user.email}
                  </span>
                )}
                
                <button 
                  className={`${styles.userAvatar} ${isEmailPinned ? styles.pinned : ''}`}
                  aria-label={isEmailPinned ? 'Скрыть email' : 'Показать email'}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              </div>
              
              <button 
                onClick={handleLogout} 
                className={styles.logoutBtn}
                aria-label="Выйти из аккаунта"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className={`${styles.loginBtn} ${isActive('/auth') ? styles.active : ''}`}
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}