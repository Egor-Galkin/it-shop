'use client';
import { useState, useEffect } from 'react';
import { useConfirm } from '@/providers/ConfirmProvider';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { generateReceiptPDF } from '@/lib/pdf/receipt';
import { toast } from '@/store/slices/toast.slice';
import styles from '../page.module.scss';

export function HistoryTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [receiptLoading, setReceiptLoading] = useState<number | null>(null);
  const showConfirm = useConfirm();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/basket/me/history');
      setOrders(data || []);
    } catch { setOrders([]); } finally { setLoading(false); }
  };

  const cancelOrder = async (orderId: number) => {
    const ok = await showConfirm({ 
      title: 'Отменить заказ?', 
      message: 'Заказ будет удалён из истории. Товары не вернутся в корзину.', 
      type: 'danger',
      confirmText: 'Отменить',
      cancelText: 'Оставить'
    });
    if (!ok) return;
    setCancelLoading(orderId);
    try {
      await api.patch(`/basket/me/orders/${orderId}/cancel`);
      loadHistory();
    } catch (e: any) {
      toast.error(e.message || 'Ошибка отмены заказа');
    } finally {
      setCancelLoading(null);
    }
  };

  // ✅ Скачивание чека
  const downloadReceipt = async (order: any) => {
    setReceiptLoading(order.id);
    try {
      await generateReceiptPDF(order);
      toast.success('Чек скачан');
    } catch (err: any) {
      console.error('Ошибка генерации чека:', err);
      toast.error('Не удалось скачать чек');
    } finally {
      setReceiptLoading(null);
    }
  };

  // ✅ Форматирование типа доставки (без дублирования "Доставка:" / "Самовывоз:")
  const formatDeliveryType = (order: any) => {
    if (!order.deliveryOption) return 'Неизвестно';
    return order.deliveryOption.name;
  };

  // ✅ Статус доставки: • для ожидания, + для завершения (без эмодзи)
  const getDeliveryStatus = (order: any) => {
    if (!order.deliveryOption) return '';
    
    if (order.deliveryOption.type === 'PICKUP') {
      return order.deliveredAt ? '+ Получен' : '• Ожидает выдачи';
    } else {
      return order.deliveredAt ? '+ Доставлен' : '• В пути';
    }
  };

  if (loading) return <Loader text="Загрузка истории..." size="medium" />;
  if (orders.length === 0) return <p className={styles.empty}>Заказов ещё не было</p>;

  return (
    <div className={styles.card}>
      <div className={styles.ordersList}>
        {orders.map(order => {
          const orderTotal = order.total || order.devices.reduce((sum: number, d: any) => {
            const price = d.paidPrice !== undefined ? d.paidPrice : Number(d.device.price);
            return sum + price * d.quantity;
          }, 0);
          
          const paidDate = new Date(order.paidAt);
          const dateStr = paidDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = paidDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span>Оплачен: <strong>{dateStr} в {timeStr}</strong></span>
                {/* ✅ Тип доставки без префикса */}
                <span className={styles.deliveryType}>
                  {formatDeliveryType(order)}
                </span>
                {/* ✅ Статус с • или + вместо эмодзи */}
                {order.deliveryOption && (
                  <span className={styles.deliveryStatus}>
                    {getDeliveryStatus(order)}
                  </span>
                )}
              </div>
              <div className={styles.gridHead}>
                <span>Товар</span><span>Кол-во</span><span>Цена</span><span>Всего</span><span></span>
              </div>
              <div className={styles.orderRows}>
                {order.devices.map((d: any) => {
                  const basePrice = Number(d.device.price);
                  const paidPrice = d.paidPrice !== undefined ? d.paidPrice : basePrice;
                  const hasDiscount = d.discountApplied && paidPrice < basePrice;
                  
                  return (
                    <div key={d.id} className={styles.row}>
                      <div className={styles.info}>
                        <span className={styles.name}>{d.device.name}</span>
                        <span className={styles.meta}>
                          {d.device.type?.name || '—'} • {d.device.brand?.name || '—'}
                        </span>
                      </div>
                      
                      <span className={styles.qty}>{d.quantity}</span>
                      
                      <span className={`${styles.price} ${hasDiscount ? styles.priceWithDiscount : ''}`}>
                        {hasDiscount ? (
                          <>
                            <span className={styles.originalPrice}>
                              {basePrice.toLocaleString('ru-RU')} ₽
                            </span>
                            <span className={styles.discountedPrice}>
                              {paidPrice.toLocaleString('ru-RU')} ₽
                            </span>
                            {d.discountApplied && (
                              <span className={styles.discountBadge}>
                                −{d.discountApplied.value}%
                              </span>
                            )}
                          </>
                        ) : (
                          <>{basePrice.toLocaleString('ru-RU')} ₽</>
                        )}
                      </span>
                      
                      <span className={styles.total}>
                        {(paidPrice * d.quantity).toLocaleString('ru-RU')} ₽
                      </span>
                      
                      <span></span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.footer}>
                <span>Итого: <strong>{orderTotal.toLocaleString('ru-RU')} ₽</strong></span>
                <div className={styles.orderActions}>
                  {/* ✅ Кнопка скачивания чека */}
                  <button 
                    onClick={() => downloadReceipt(order)} 
                    disabled={receiptLoading === order.id}
                    className={styles.receiptBtn}
                    type="button"
                  >
                    {receiptLoading === order.id ? '...' : 'Чек'}
                  </button>
                  {/* ✅ Кнопка отмены заказа */}
                  <button 
                    onClick={() => cancelOrder(order.id)} 
                    disabled={cancelLoading === order.id} 
                    className={styles.cancelBtn}
                    type="button"
                  >
                    {cancelLoading === order.id ? '...' : 'Отменить'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}