import styles from '../page.module.scss';

const managementItems = [
  { title: 'Типы устройств', desc: 'Настройка типов устройств', href: '/admin/types' },
  { title: 'Бренды', desc: 'Управление производителями', href: '/admin/brands' },
  { title: 'Устройства', desc: 'Каталог товаров', href: '/admin/devices' },
  { title: 'Пользователи', desc: 'Управление аккаунтами', href: '/admin/users' },
  { title: 'Заказы', desc: 'Просмотр и обработка', href: '/admin/orders' },
  { title: 'Отзывы', desc: 'Модерация отзывов', href: '/admin/reviews' },
  { title: 'Доставки', desc: 'Доставки и самовывозы', href: '/admin/deliverys' },
];

export function ManagementTab() {
  return (
    <div className={styles.managementGrid}>
      {managementItems.map(card => (
        <div key={card.title} className={styles.mgmtCard}>
          <h3 className={styles.mgmtTitle}>{card.title}</h3>
          <p className={styles.mgmtDesc}>{card.desc}</p>
          <a href={card.href} className={styles.mgmtLink}>Перейти →</a>
        </div>
      ))}
    </div>
  );
}