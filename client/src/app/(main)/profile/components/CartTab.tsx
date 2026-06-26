'use client';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  updateCartItem, 
  removeFromCart, 
  checkoutCart, 
  clearCart, 
  selectCartTotal, 
  setDeliveryOptionId,
  selectCartDeliveryOptionId 
} from '@/store/slices/cart.slice';
import { toast } from '@/store/slices/toast.slice';
import { useConfirm } from '@/providers/ConfirmProvider';
import { Loader } from '@/components/ui/Loader/Loader';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { api } from '@/lib/axios';
import styles from '../page.module.scss';

interface DeliveryOption {
  id: number;
  name: string;
  type: 'DELIVERY' | 'PICKUP';
  price: number | null;
  address: string | null;
  description: string | null;
}

export function CartTab() {
  const dispatch = useAppDispatch();
  const showConfirm = useConfirm();
  
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const cartError = useAppSelector((state) => state.cart.error);
  const cartDeliveryOptionId = useAppSelector(selectCartDeliveryOptionId);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const total = useAppSelector(selectCartTotal);

  // Загрузка вариантов доставки
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        const { data } = await api.get('/delivery-options/client/available');
        setDeliveryOptions(data);
      } catch (err) {
        console.error('Ошибка загрузки доставки:', err);
      }
    };
    fetchDeliveryOptions();
  }, []);

  // Расчёт итога: товары + доставка
  const cartTotal = (() => {
    const itemsTotal = total;
    const selected = deliveryOptions.find(o => o.id === cartDeliveryOptionId);
    const deliveryCost = selected?.type === 'DELIVERY' && selected.price 
      ? Number(selected.price) 
      : 0;
    return itemsTotal + deliveryCost;
  })();

  // Обработчик выбора доставки
  const handleSelectDelivery = async (optionId: number | null) => {
    setDeliveryLoading(true);
    
    try {
      await api.patch('/basket/me', { deliveryOptionId: optionId });
      dispatch(setDeliveryOptionId(optionId));
      toast.success('Способ получения обновлён');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка выбора доставки');
    } finally {
      setDeliveryLoading(false);
    }
  };

  // ✅ Валидация: можно ли оформить заказ
  const canCheckout = cartItems.length > 0 && cartDeliveryOptionId !== null && !checkoutLoading;

  const changeQty = async (id: number, q: number) => {
    if (q < 1) return;
    try { 
      await dispatch(updateCartItem({ itemId: id, quantity: q })).unwrap(); 
    } catch (e: any) { 
      dispatch(toast.error(e.message || 'Ошибка обновления')); 
    }
  };

  const removeItem = async (id: number) => {
    const ok = await showConfirm({ 
      title: 'Удалить товар?', 
      message: 'Товар будет удалён из корзины.', 
      type: 'danger' 
    });
    if (!ok) return;
    try { 
      await dispatch(removeFromCart(id)).unwrap(); 
      dispatch(toast.success('Товар удалён'));
    } catch (e: any) { 
      dispatch(toast.error(e.message || 'Ошибка удаления')); 
    }
  };

  const checkout = async () => {
    // ✅ Проверка: выбран ли способ получения
    if (!cartDeliveryOptionId) {
      toast.error('Выберите способ получения заказа');
      return;
    }
    
    const ok = await showConfirm({ 
      title: 'Оформить заказ?', 
      message: 'Товары будут списаны из корзины. Продолжить?' 
    });
    if (!ok) return;
    
    setCheckoutLoading(true);
    try {
      await dispatch(checkoutCart()).unwrap();
      dispatch(clearCart());
      dispatch(toast.success('Заказ успешно оформлен!'));
    } catch (e: any) { 
      dispatch(toast.error(e.message || 'Ошибка оформления')); 
    }
    finally { setCheckoutLoading(false); }
  };

  if (cartLoading) return <Loader text="Загрузка корзины..." size="medium" />;
  if (cartError) return <p className={styles.error}>{cartError}</p>;
  if (cartItems.length === 0) return <p className={styles.empty}>Корзина пуста</p>;

  // ✅ Формируем опции для CustomSelect (все value — строки, без лишних полей)
  const deliverySelectOptions = [
    { value: '', label: 'Выберите способ получения' }, // ✅ Убрали disabled: true
    ...deliveryOptions.map(option => ({
      value: String(option.id),
      label: `${option.name}${option.price ? ` — ${Number(option.price).toLocaleString('ru-RU')} ₽` : ' — бесплатно'}`
    }))
  ];

  return (
    <div className={styles.card}>
      <div className={styles.gridHead}>
        <span>Товар</span><span>Кол-во</span><span>Цена</span><span>Всего</span><span></span>
      </div>
      
      <div className={styles.list}>
        {cartItems.map(item => {
          const basePrice = Number(item.device.price) || 0;
          const lockedPrice = item.lockedPrice !== undefined ? item.lockedPrice : basePrice;
          const hasDiscount = lockedPrice < basePrice;
          
          return (
            <div key={item.id} className={styles.row}>
              <div className={styles.info}>
                <span className={styles.name}>{item.device.name}</span>
                <span className={styles.meta}>
                  {item.device.type?.name || '—'} • {item.device.brand?.name || '—'}
                </span>
              </div>
              
              <div className={styles.controls}>
                <button 
                  onClick={() => changeQty(item.id, item.quantity - 1)} 
                  disabled={item.quantity <= 1} 
                  className={styles.btnQty}
                  type="button"
                >
                  −
                </button>
                <span className={styles.qty}>{item.quantity}</span>
                <button 
                  onClick={() => changeQty(item.id, item.quantity + 1)} 
                  className={styles.btnQty}
                  type="button"
                >
                  +
                </button>
              </div>
              
              <span className={`${styles.price} ${hasDiscount ? styles.priceWithDiscount : ''}`}>
                {hasDiscount ? (
                  <>
                    <span className={styles.originalPrice}>
                      {basePrice.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className={styles.discountedPrice}>
                      {lockedPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </>
                ) : (
                  <>{lockedPrice.toLocaleString('ru-RU')} ₽</>
                )}
              </span>
              
              <span className={styles.total}>
                {(lockedPrice * item.quantity).toLocaleString('ru-RU')} ₽
              </span>
              
              <button 
                onClick={() => removeItem(item.id)} 
                className={styles.btnDel} 
                aria-label="Удалить"
                type="button"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      
      {/* ✅ Новый футер: слева итог, справа выбор доставки + кнопка */}
      <div className={styles.footer}>
        {/* Левая часть: итог */}
        <span className={styles.totalLabel}>
          Итого: <strong>{cartTotal.toLocaleString('ru-RU')} ₽</strong>
        </span>
        
        {/* Правая часть: выбор доставки + кнопка */}
        <div className={styles.footerActions}>
          <div className={styles.deliverySelectWrapper}>
            {/* ✅ Обёртка для имитации disabled через CSS */}
            <div 
              className={`${styles.deliverySelectContainer} ${(deliveryLoading || checkoutLoading) ? styles.disabled : ''}`}
              style={{
                pointerEvents: (deliveryLoading || checkoutLoading) ? 'none' : 'auto',
                opacity: (deliveryLoading || checkoutLoading) ? 0.6 : 1,
                display: 'inline-block'
              }}
            >
              <CustomSelect
                options={deliverySelectOptions}
                value={cartDeliveryOptionId?.toString() || ''}
                onChange={(value) => handleSelectDelivery(value ? Number(value) : null)}
                placeholder="Выберите способ получения"
                // ✅ Убрали проп disabled, так как компонент его не поддерживает
                className={styles.deliveryCustomSelect}
              />
            </div>
            {deliveryLoading && <span className={styles.deliveryLoading}>...</span>}
          </div>
          
          <button 
            onClick={checkout} 
            disabled={!canCheckout} 
            className={styles.checkoutBtn}
            type="button"
            title={!cartDeliveryOptionId ? 'Сначала выберите способ получения' : undefined}
          >
            {checkoutLoading ? 'Обработка...' : 'Оплатить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
}