'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  removeFromCart, 
  updateCartItem, 
  selectCartTotal, 
  fetchCart, 
  setDeliveryOptionId, 
  selectCartDeliveryOptionId,
  checkoutCart 
} from '@/store/slices/cart.slice';
import { toast } from '@/store/slices/toast.slice';
import { useConfirm } from '@/providers/ConfirmProvider';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import styles from './FloatingCart.module.scss';

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const showConfirm = useConfirm();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const itemsTotal = useAppSelector(selectCartTotal);
  const cartDeliveryOptionId = useAppSelector(selectCartDeliveryOptionId);
  const user = useAppSelector((state) => state.auth.user);
  
  const itemsCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0), 
    [cartItems]
  );

  // ✅ Инициализация на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Загрузка опций доставки и расчёт стоимости
  useEffect(() => {
    if (!isOpen || !isClient) return;
    
    const loadOptions = async () => {
      try {
        const { data } = await api.get('/delivery-options/client/available');
        setDeliveryOptions(data);
        
        // ✅ Рассчитываем стоимость доставки для текущего выбора
        const selected = data.find((o: any) => o.id === cartDeliveryOptionId);
        setDeliveryCost(selected?.type === 'DELIVERY' && selected.price 
          ? Number(selected.price) 
          : 0);
      } catch (e) {
        console.error('Ошибка загрузки доставки:', e);
      }
    };
    
    loadOptions();
  }, [isOpen, isClient, cartDeliveryOptionId]);

  // ✅ Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ✅ Расчёт итого: товары + доставка (мемоизировано)
  const cartTotal = useMemo(() => {
    return itemsTotal + deliveryCost;
  }, [itemsTotal, deliveryCost]);

  const toggleMenu = useCallback(() => {
    if (!isClient) return;
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 200);
    } else {
      setIsOpen(true);
    }
  }, [isOpen, isClient]);

  // ✅ Изменение количества — БЕЗ fetchCart() для предотвращения мерцания
  const changeQty = useCallback(async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQty })).unwrap();
    } catch (e: any) {
      toast.error(e.message || 'Ошибка изменения количества');
    }
  }, [dispatch]);

  // ✅ Удаление товара
  const removeItem = useCallback(async (id: number) => {
    const ok = await showConfirm({ 
      title: 'Удалить товар?', 
      message: 'Товар будет удалён из корзины.', 
      type: 'danger' 
    });
    if (!ok) return;
    try {
      await dispatch(removeFromCart(id)).unwrap();
    } catch (e: any) {
      toast.error(e.message || 'Ошибка удаления');
    }
  }, [dispatch, showConfirm]);

  // ✅ Выбор доставки через нативный select
  const handleDeliveryChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const optionId = e.target.value ? Number(e.target.value) : null;
    
    // ✅ Обновляем стоимость доставки локально для мгновенного отклика
    const selected = deliveryOptions.find(o => o.id === optionId);
    setDeliveryCost(selected?.type === 'DELIVERY' && selected.price 
      ? Number(selected.price) 
      : 0);
    
    try {
      await api.patch('/basket/me', { deliveryOptionId: optionId });
      dispatch(setDeliveryOptionId(optionId));
      toast.success('Способ получения обновлён');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка выбора доставки');
    }
  }, [deliveryOptions, dispatch]);

  // ✅ Оформление заказа — без редиректа
  const handleCheckout = useCallback(async () => {
    if (!cartDeliveryOptionId) {
      toast.error('Выберите способ получения');
      return;
    }
    
    try {
      await dispatch(checkoutCart()).unwrap();
      toast.success('Заказ успешно оформлен!');
      // ✅ Просто закрываем меню, без редиректа
      setIsOpen(false);
      // ✅ Опционально: обновляем корзину для сброса состояния
      dispatch(fetchCart());
    } catch (e: any) {
      toast.error(e.message || 'Ошибка оформления');
    }
  }, [cartDeliveryOptionId, dispatch]);

  // ✅ Валидация: можно ли оформить заказ
  const canCheckout = itemsCount > 0 && cartDeliveryOptionId !== null && !cartLoading;

  // ✅ Рендер только на клиенте + авторизация
  if (!isClient || !user) return null;

  return (
    <div className={styles.floatingCart} ref={menuRef}>
      <button 
        className={`${styles.cartBtn} ${isOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="Открыть корзину"
        type="button"
      >
        <svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itemsCount > 0 && <span className={styles.badge}>{itemsCount > 99 ? '99+' : itemsCount}</span>}
      </button>

      <div className={`${styles.menu} ${isOpen ? styles.open : ''} ${isAnimating ? styles.closing : ''}`}>
        <div className={styles.menuHeader}>
          <h4>Корзина</h4>
          <button className={styles.closeBtn} onClick={toggleMenu} type="button">✕</button>
        </div>
        
        <div className={styles.menuBody}>
          {cartLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : cartItems.length === 0 ? (
            <p className={styles.empty}>Корзина пуста</p>
          ) : (
            <>
              <div className={styles.itemsList}>
                {cartItems.slice(0, 5).map(item => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName} title={item.device.name}>{item.device.name}</span>
                      <span className={styles.itemPrice}>{item.lockedPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    
                    <div className={styles.qtyControl}>
                      <button onClick={() => changeQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className={styles.qtyBtn} type="button">−</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button onClick={() => changeQty(item.id, item.quantity + 1)} className={styles.qtyBtn} type="button">+</button>
                    </div>

                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Удалить" type="button">✕</button>
                  </div>
                ))}
                {cartItems.length > 5 && <p className={styles.moreItems}>+ ещё {cartItems.length - 5} товаров</p>}
              </div>

              {/* ✅ Нативный стилизованный select для доставки */}
              <div className={styles.deliverySelectWrapper}>
                <select 
                  value={cartDeliveryOptionId ?? ''} 
                  onChange={handleDeliveryChange}
                  className={styles.deliverySelect}
                >
                  <option value="" disabled>Способ получения</option>
                  {deliveryOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.price ? `+${Number(opt.price).toLocaleString('ru-RU')}₽` : '(бесплатно)'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        
        {!cartLoading && cartItems.length > 0 && (
          <div className={styles.menuFooter}>
            <div className={styles.totalRow}>
              <span>Итого:</span>
              <strong>{cartTotal.toLocaleString('ru-RU')} ₽</strong>
            </div>
            <div className={styles.actions}>
              <button className={styles.viewCartBtn} onClick={() => { setIsOpen(false); router.push('/profile?tab=cart'); }} type="button">Подробнее</button>
              <button 
                className={styles.checkoutBtn} 
                onClick={handleCheckout} 
                disabled={!canCheckout}
                type="button"
                title={!cartDeliveryOptionId ? 'Сначала выберите способ получения' : undefined}
              >
                Оформить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}