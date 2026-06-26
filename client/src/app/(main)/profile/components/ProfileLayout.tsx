'use client';
import styles from '../page.module.scss';

interface ProfileLayoutProps {
  isAdmin: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function ProfileLayout({ isAdmin, activeTab, onTabChange, children }: ProfileLayoutProps) {
  const tabs = isAdmin
    ? [
        { id: 'management', label: 'Управление' },
        { id: 'stats', label: 'Статистика' },
        { id: 'password', label: 'Безопасность' },
      ]
    : [
        { id: 'cart', label: 'Корзина' },
        { id: 'history', label: 'История заказов' },
        { id: 'password', label: 'Безопасность' },
      ];

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>{isAdmin ? 'Панель администратора' : 'Личный кабинет'}</h1>
        </header>

        <nav className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}