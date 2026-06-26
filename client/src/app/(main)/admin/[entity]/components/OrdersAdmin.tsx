'use client';
import { useState, useEffect, Fragment, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import styles from './OrdersAdmin.module.scss';

interface OrderDevice {
  id: number;
  quantity: number;
  device: {
    name: string;
    basePrice: number;
    finalPrice: number;
    discount: number | null;
  };
  lineTotal: number;
}

interface Order {
  id: number;
  paidAt: string;
  deliveredAt: string | null;
  total: number;
  deliveryOption?: { name: string; type: 'DELIVERY' | 'PICKUP'; price?: number; address?: string };
  user: { email: string };
  devices: OrderDevice[];
}

type SortField = 'id' | 'email' | 'paidAt' | 'total' | 'status';
type SortOrder = 'asc' | 'desc' | null;
type StatusFilter = 'all' | 'pending' | 'delivered';

export function OrdersAdmin() {
  const dispatch = useAppDispatch();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('paidAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [submittingOrderId, setSubmittingOrderId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, [page, limit, debouncedSearch, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const serverSortableFields: SortField[] = ['id', 'email', 'paidAt'];
      
      const params: any = {
        page, limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        orderBy: serverSortableFields.includes(sortField) ? sortField : 'paidAt',
        orderDir: serverSortableFields.includes(sortField) ? sortOrder : 'desc',
      };
      
      const { data } = await api.get('/basket/admin/orders', { params });
      let ordersData = data.data || [];
      
      // ✅ Клиентская сортировка для полей, которые нельзя сортировать в Prisma напрямую
      if (!serverSortableFields.includes(sortField) && sortOrder) {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        ordersData = [...ordersData].sort((a: Order, b: Order) => {
          if (sortField === 'total') return (a.total - b.total) * multiplier;
          if (sortField === 'status') {
            const aReady = !!a.deliveredAt ? 1 : 0;
            const bReady = !!b.deliveredAt ? 1 : 0;
            return (aReady - bReady) * multiplier;
          }
          return 0;
        });
      }
      
      setOrders(ordersData);
      setTotal(data.meta?.total || ordersData.length || 0);
    } catch (e: any) {
      console.error('Load error:', e.response?.data || e.message);
      dispatch(toast.error('Ошибка загрузки заказов'));
    } finally { setLoading(false); }
  };

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  }, [sortField]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field || !sortOrder) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const toggleExpand = (orderId: number) => {
    setExpandedId(expandedId === orderId ? null : orderId);
  };

  const handleToggleDelivery = async (orderId: number, currentDeliveredAt: string | null) => {
    setSubmittingOrderId(orderId);
    try {
      await api.patch(`/basket/${orderId}/deliver`, {
        deliveredAt: currentDeliveredAt ? null : new Date().toISOString()
      });
      await loadData(); // Перезагружаем список для актуализации сортировки/фильтров
      dispatch(toast.success(currentDeliveredAt ? 'Доставка отменена' : 'Заказ выдан/доставлен'));
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка обновления статуса'));
    } finally {
      setSubmittingOrderId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const PaginationBlock = () => {
    if (totalPages <= 1 && total === 0) return null;
    return (
      <div className={styles.paginationWrapper}>
        <div className={styles.limitButtons}>
          {[10, 20, 40].map(limitVal => (
            <button key={limitVal} className={`${styles.limitBtn} ${limit === limitVal ? styles.limitBtnActive : ''}`} onClick={() => { setLimit(limitVal); setPage(1); }}>{limitVal}</button>
          ))}
        </div>
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={styles.pageBtn}>←</button>
          <span className={styles.pageInfo}>{page} / {totalPages || 1}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={styles.pageBtn}>→</button>
        </div>
      </div>
    );
  };

  if (loading) return <Loader text="Загрузка заказов..." size="medium" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление заказами</h1>
      </div>

      {/* ✅ Фильтры и поиск */}
      <div className={styles.filters}>
        <input placeholder="Поиск по email покупателя..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.search} />
        <CustomSelect 
          options={[
            { value: 'all', label: 'Все заказы' },
            { value: 'pending', label: 'В процессе' },
            { value: 'delivered', label: 'Готовые' }
          ]} 
          value={statusFilter} 
          onChange={val => setStatusFilter(val as StatusFilter)} 
        />
      </div>

      {/* ✅ Таблица заказов */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th className={styles.sortable} onClick={() => handleSort('id')} style={{ width: 60 }}>ID <span className={styles.sortIcon}>{getSortIndicator('id')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('email')} style={{ width: 160 }}>Покупатель <span className={styles.sortIcon}>{getSortIndicator('email')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('paidAt')} style={{ width: 160 }}>Дата оплаты <span className={styles.sortIcon}>{getSortIndicator('paidAt')}</span></th>
              <th style={{ width: 160 }}>Тип доставки</th>
              <th className={styles.sortable} onClick={() => handleSort('total')} style={{ width: 120 }}>Сумма <span className={styles.sortIcon}>{getSortIndicator('total')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('status')} style={{ width: 120 }}>Статус <span className={styles.sortIcon}>{getSortIndicator('status')}</span></th>
              <th className={styles.actionsHeader} >Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const isReady = !!order.deliveredAt;
              const paidDate = new Date(order.paidAt);
              
              return (
                <Fragment key={order.id}>
                  <tr className={expandedId === order.id ? styles.rowActive : ''}>
                    <td><button className={styles.expandBtn} onClick={() => toggleExpand(order.id)}>{expandedId === order.id ? '▼' : '▶'}</button></td>
                    <td>{order.id}</td>
                    <td>{order.user.email}</td>
                    <td>{paidDate.toLocaleDateString('ru-RU')}</td>
                    <td>
                      {order.deliveryOption ? (
                        <span className={styles.deliveryTypeCell}>
                          {order.deliveryOption.name}
                          {order.deliveryOption.type === 'DELIVERY' && order.deliveryOption.price && ` (${Number(order.deliveryOption.price).toLocaleString('ru-RU')} ₽)`}
                        </span>
                      ) : '—'}
                    </td>
                    <td><strong>{order.total.toLocaleString('ru-RU')} ₽</strong></td>
                    <td>
                      <span className={`${styles.statusBadge} ${isReady ? styles.statusReady : styles.statusPending}`}>
                        {isReady ? 'Готов' : 'В процессе'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button 
                        onClick={() => handleToggleDelivery(order.id, order.deliveredAt)}
                        disabled={submittingOrderId === order.id}
                        className={`${styles.deliveryBtn} ${isReady ? styles.revoke : ''}`}
                      >
                        {submittingOrderId === order.id ? '...' : isReady ? 'Отменить выдачу' : order.deliveryOption?.type === 'PICKUP' ? 'Выдать заказ' : 'Доставить заказ'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === order.id && (
                    <tr className={styles.expandRow}>
                      <td colSpan={8}>
                        <div className={styles.expandContent}>
                          <div className={styles.orderHeaderRow}>
                            <span className={styles.orderDetail}>Оплачен: {paidDate.toLocaleString('ru-RU')}</span>
                            <span className={styles.orderDetail}>
                              Доставлен: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('ru-RU') : 'Нет'}
                            </span>
                          </div>

                          <div className={styles.orderTableWrapper}>
                            <table className={styles.orderTable}>
                              <thead>
                                <tr>
                                  <th>Товар</th>
                                  <th>Цена</th>
                                  <th>Кол-во</th>
                                  <th>Скидка</th>
                                  <th>Сумма</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.devices.map(item => (
                                  <tr key={item.id}>
                                    <td className={styles.itemName}>{item.device.name}</td>
                                    <td className={styles.itemPrice}>
                                      {item.device.discount ? (
                                        <>
                                          <span className={styles.originalPrice}>{item.device.basePrice.toLocaleString('ru-RU')} ₽</span>
                                          <span className={styles.discountedPrice}>{item.device.finalPrice.toLocaleString('ru-RU')} ₽</span>
                                        </>
                                      ) : (
                                        <span>{item.device.basePrice.toLocaleString('ru-RU')} ₽</span>
                                      )}
                                    </td>
                                    <td className={styles.itemQty}>×{item.quantity}</td>
                                    <td className={styles.itemDiscount}>
                                      {item.device.discount ? <span className={styles.discountBadge}>−{item.device.discount}%</span> : <span className={styles.noDiscount}>—</span>}
                                    </td>
                                    <td className={styles.itemTotal}>{item.lineTotal.toLocaleString('ru-RU')} ₽</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className={styles.orderFooter}>
                            <span className={styles.orderTotal}>Итого: <strong>{order.total.toLocaleString('ru-RU')} ₽</strong></span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationBlock />
    </div>
  );
}