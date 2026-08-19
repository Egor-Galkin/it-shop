'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import styles from './Footer.module.scss';

export function Footer() {
  const user = useAppSelector((state) => state.auth.user);
  const pathname = usePathname();
  const year = new Date().getFullYear();
  
  // ✅ Флаг: компонент смонтирован на клиенте (предотвращает гидратацию)
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const isActive = (path: string) => pathname === path;

  // ✅ Определяем href и текст ссылки ТОЛЬКО после гидратации
  // До этого сервер и клиент видят одинаковый HTML
  const navHref = isHydrated && user ? '/profile' : '/auth';
  const navText = isHydrated && user ? 'Личный кабинет' : 'Войти';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.col}>
          <span className={styles.logo}>ITshop</span>
          <p className={styles.text}>Интернет-магазин электроники и аксессуаров.</p>
        </div>
        <div className={styles.col}>
          <h4 className={styles.title}>Навигация</h4>
          <Link 
            href="/catalog" 
            className={`${styles.link} ${isActive('/catalog') ? styles.active : ''}`}
          >
            Каталог
          </Link>
          <Link 
            href={navHref} 
            className={`${styles.link} ${isActive(navHref) ? styles.active : ''}`}
          >
            {navText}
          </Link>
        </div>
        <div className={styles.col}>
          <h4 className={styles.title}>Контакты</h4>
          <p className={styles.text}>support@itshop.local</p>
          <p className={styles.text}>+7 (999) 000-00-00</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>&copy; {year} ITshop. Все права защищены.</p>
      </div>
    </footer>
  );
}