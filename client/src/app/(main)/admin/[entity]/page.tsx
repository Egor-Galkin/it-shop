'use client';
import { useParams, useRouter } from 'next/navigation';
import { TypesBrandsAdmin } from './components/TypesBrandsAdmin';
import { DevicesAdmin } from './components/DevicesAdmin';
import { UsersAdmin } from './components/UsersAdmin';
import { OrdersAdmin } from './components/OrdersAdmin';
import { ReviewsAdmin } from './components/ReviewsAdmin';
import { DeliveryOptionsAdmin } from './components/DeliveryOptionsAdmin';
import styles from './page.module.scss';

// ✅ Конфигурация вкладок
const ENTITIES = {
  types: { title: 'Типы товаров' },
  brands: { title: 'Бренды' },
  devices: { title: 'Устройства' },
  users: { title: 'Пользователи' },
  orders: { title: 'Заказы' },
  reviews: { title: 'Отзывы' },
  deliverys: { title: 'Доставки' }
} as const;

type EntityKey = keyof typeof ENTITIES;

export default function AdminEntityPage() {
  const params = useParams();
  const router = useRouter();
  
  const entity = params.entity as EntityKey;
  
  // Защита от несуществующих сущностей
  if (!ENTITIES[entity]) {
    router.push('/404');
    return null;
  }

  return (
    <div className={styles.adminPage}>
      {/* ✅ Панель переключения */}
      <div className={styles.entityTabs}>
        {(Object.keys(ENTITIES) as EntityKey[]).map(key => (
          <button
            key={key}
            className={`${styles.tab} ${entity === key ? styles.active : ''}`}
            onClick={() => {
              // Переход только если вкладка другая
              if (entity !== key) router.push(`/admin/${key}`);
            }}
          >
            {ENTITIES[key].title}
          </button>
        ))}
      </div>

      {/* ✅ Рендеринг нужного компонента */}
      <div className={styles.adminContent}>
        {entity === 'types' && <TypesBrandsAdmin entity="types" />}
        {entity === 'brands' && <TypesBrandsAdmin entity="brands" />}
        {entity === 'devices' && <DevicesAdmin />}
        {entity === 'users' && <UsersAdmin />}
        {entity === 'orders' && <OrdersAdmin />}
        {entity === 'reviews' && <ReviewsAdmin />}
        {entity === 'deliverys' && <DeliveryOptionsAdmin />}
      </div>
    </div>
  );
}