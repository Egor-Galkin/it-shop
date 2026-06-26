'use client';
import { useState, useEffect, Fragment, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import styles from './UsersAdmin.module.scss';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    ratings: number;
    baskets: number;
    deliveredBaskets?: number;
  };
}

interface Review {
  id: number;
  userId: number;
  deviceId: number;
  rate: number;
  description: string;
  hidden: boolean;
  createdAt: string;
  device?: { name: string };
}

interface OrderDevice {
  id: number;
  quantity: number;
  device: {
    id: number;
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
  deliveryOption?: { name: string; type: 'DELIVERY' | 'PICKUP', price?: number, address?: string };
  devices: OrderDevice[];
}

type SortField = 'id' | 'email' | 'createdAt' | 'ratings' | 'orders';
type SortOrder = 'asc' | 'desc' | null;
type ExpandedTab = 'reviews' | 'orders' | null;

export function UsersAdmin() {
  const dispatch = useAppDispatch();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ExpandedTab>('reviews');
  const [userReviews, setUserReviews] = useState<Record<number, Review[]>>({});
  const [userOrders, setUserOrders] = useState<Record<number, Order[]>>({});
  const [loadingReviews, setLoadingReviews] = useState<Record<number, boolean>>({});
  const [loadingOrders, setLoadingOrders] = useState<Record<number, boolean>>({});
  const [submittingOrderId, setSubmittingOrderId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, [page, limit, debouncedSearch, sortField, sortOrder]);

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
      const serverSortableFields: SortField[] = ['id', 'email', 'createdAt'];
      
      const params: any = {
        page, limit,
        search: debouncedSearch || undefined,
        role: 'CLIENT',
        orderBy: serverSortableFields.includes(sortField) ? sortField : undefined,
        orderDir: serverSortableFields.includes(sortField) ? sortOrder : undefined
      };
      
      const { data } = await api.get('/users', { params });
      let usersData = data.data || data;
      
      if (!serverSortableFields.includes(sortField) && sortOrder) {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        const sorted = [...usersData].sort((a: User, b: User) => {
          if (sortField === 'ratings') {
            return ((a._count?.ratings || 0) - (b._count?.ratings || 0)) * multiplier;
          }
          if (sortField === 'orders') {
            return ((a._count?.baskets || 0) - (b._count?.baskets || 0)) * multiplier;
          }
          return 0;
        });
        setUsers(sorted);
      } else {
        setUsers(usersData);
      }
      
      setTotal(data.meta?.total || usersData.length || 0);
    } catch (e: any) {
      console.error('Load error:', e.response?.data || e.message);
      dispatch(toast.error('Ошибка загрузки данных'));
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

  const toggleExpand = async (userId: number) => {
    if (expandedId === userId) {
      setExpandedId(null);
      setActiveTab(null);
      return;
    }
    setExpandedId(userId);
    setActiveTab('reviews');
    if (!userReviews[userId]) await loadReviews(userId);
    if (!userOrders[userId]) await loadOrders(userId);
  };

  const loadReviews = async (userId: number) => {
    setLoadingReviews(prev => ({ ...prev, [userId]: true }));
    try {
      const { data } = await api.get(`/users/${userId}/reviews`);
      setUserReviews(prev => ({ ...prev, [userId]: data }));
    } catch (e) {
      console.error('Failed to load reviews:', e);
      setUserReviews(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setLoadingReviews(prev => ({ ...prev, [userId]: false }));
    }
  };

  const loadOrders = async (userId: number) => {
    setLoadingOrders(prev => ({ ...prev, [userId]: true }));
    try {
      const { data } = await api.get(`/users/${userId}/orders`, { params: { limit: 100 } });
      setUserOrders(prev => ({ ...prev, [userId]: data }));
    } catch (e) {
      console.error('Failed to load orders:', e);
      setUserOrders(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setLoadingOrders(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleToggleReviewHidden = async (reviewId: number, currentHidden: boolean) => {
    try {
      await api.patch(`/ratings/${reviewId}`, { hidden: !currentHidden });
      setUserReviews(prev => {
        const updated: Record<number, Review[]> = {};
        Object.entries(prev).forEach(([uid, reviews]) => {
          updated[Number(uid)] = reviews.map(r => 
            r.id === reviewId ? { ...r, hidden: !currentHidden } : r
          );
        });
        return updated;
      });
      dispatch(toast.success(`Отзыв ${currentHidden ? 'показан' : 'скрыт'}`));
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка обновления'));
    }
  };

  const handleToggleDelivery = async (orderId: number, currentDeliveredAt: string | null) => {
    setSubmittingOrderId(orderId);
    try {
      await api.patch(`/basket/${orderId}/deliver`, {
        deliveredAt: currentDeliveredAt ? null : new Date().toISOString()
      });
      setUserOrders(prev => {
        const updated: Record<number, Order[]> = {};
        Object.entries(prev).forEach(([uid, orders]) => {
          updated[Number(uid)] = orders.map(o => 
            o.id === orderId ? { ...o, deliveredAt: currentDeliveredAt ? null : new Date().toISOString() } : o
          );
        });
        return updated;
      });
      dispatch(toast.success(currentDeliveredAt ? 'Доставка отменена' : 'Заказ выдан'));
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка обновления статуса'));
    } finally {
      setSubmittingOrderId(null);
    }
  };

  const renderRatingDots = (rating: number | null) => {
    if (rating == null) return '—';
    const value = Math.round(Number(rating));
    return '•'.repeat(value) + '·'.repeat(5 - value);
  };

  const totalPages = Math.ceil(total / limit);
  const PaginationBlock = () => {
    if (totalPages <= 1 && total === 0) return null;
    return (
      <div className={styles.paginationWrapper}>
        <div className={styles.limitButtons}>
          {[10, 20, 40].map(limitVal => (
            <button
              key={limitVal}
              className={`${styles.limitBtn} ${limit === limitVal ? styles.limitBtnActive : ''}`}
              onClick={() => { setLimit(limitVal); setPage(1); }}
              type="button"
            >
              {limitVal}
            </button>
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

  if (loading) return <Loader text="Загрузка пользователей..." size="medium" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление пользователями</h1>
      </div>

      <div className={styles.filters}>
        <input placeholder="Поиск по email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.search} />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th className={styles.sortable} onClick={() => handleSort('id')} style={{ width: 60 }}>ID <span className={styles.sortIcon}>{getSortIndicator('id')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('email')} style={{ width: 200 }}>Email <span className={styles.sortIcon}>{getSortIndicator('email')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('createdAt')} style={{ width: 100 }}>Регистрация <span className={styles.sortIcon}>{getSortIndicator('createdAt')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('ratings')} style={{ width: 80 }}>Отзывы <span className={styles.sortIcon}>{getSortIndicator('ratings')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('orders')} style={{ width: 200 }}>
                Заказы / готовые / в процессе <span className={styles.sortIcon}>{getSortIndicator('orders')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <Fragment key={user.id}>
                <tr className={expandedId === user.id ? styles.rowActive : ''}>
                  <td><button className={styles.expandBtn} onClick={() => toggleExpand(user.id)}>{expandedId === user.id ? '▼' : '▶'}</button></td>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td><span className={styles.countBadge}>{user._count?.ratings || 0}</span></td>
                  <td>
                    <div className={styles.orderCounts}>
                      <span className={styles.countBox}>{user._count?.baskets || 0}</span>
                      <span className={styles.countBox}>{user._count?.deliveredBaskets || 0}</span>
                      <span className={styles.countBox}>{(user._count?.baskets || 0) - (user._count?.deliveredBaskets || 0)}</span>
                    </div>
                  </td>
                </tr>

                {expandedId === user.id && (
                  <tr className={styles.expandRow}>
                    <td colSpan={6}>
                      <div className={styles.expandContent}>
                        <div className={styles.tabs}>
                          <button className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`} onClick={() => setActiveTab('reviews')}>Отзывы ({userReviews[user.id]?.length || 0})</button>
                          <button className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>Заказы ({userOrders[user.id]?.length || 0})</button>
                        </div>

                        <div className={styles.tabContent}>
                          {activeTab === 'reviews' && (
                            <div className={styles.reviewsSection}>
                              {loadingReviews[user.id] ? <Loader text="Загрузка отзывов..." size="small" /> :
                               (userReviews[user.id] || []).length === 0 ? <p className={styles.emptySmall}>Отзывов нет</p> :
                               <div className={styles.reviewsList}>
                                  {(userReviews[user.id] || []).map(review => (
                                    <div key={review.id} className={`${styles.reviewItem} ${review.hidden ? styles.reviewHidden : ''}`}>
                                      <div className={styles.reviewHeader}>
                                        <span className={styles.reviewRating}>{renderRatingDots(review.rate)}</span>
                                        <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                                        {review.hidden && <span className={styles.hiddenBadge}>Скрыт</span>}
                                      </div>
                                      <div className={styles.reviewDevice}><strong>Товар:</strong> {review.device?.name || `ID: ${review.deviceId}`}</div>
                                      {review.hidden ? <p className={styles.reviewHiddenText}>Данный отзыв был скрыт модерацией.</p> : <p className={styles.reviewText}>{review.description}</p>}
                                      <button onClick={() => handleToggleReviewHidden(review.id, review.hidden)} className={styles.toggleReviewBtn}>{review.hidden ? 'Показать отзыв' : 'Скрыть отзыв'}</button>
                                    </div>
                                  ))}
                                </div>
                              }
                            </div>
                          )}

                          {activeTab === 'orders' && (
                            <div className={styles.ordersSection}>
                              {loadingOrders[user.id] ? <Loader text="Загрузка заказов..." size="small" /> :
                               (userOrders[user.id] || []).length === 0 ? <p className={styles.emptySmall}>Заказов нет</p> :
                               <div className={styles.ordersList}>
                                  {(userOrders[user.id] || []).map(order => {
                                    const isDelivered = !!order.deliveredAt;
                                    const paidDate = new Date(order.paidAt);
                                    const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
                                    
                                    return (
                                      <div key={order.id} className={styles.orderCard}>
                                        {/* Шапка заказа */}
                                        <div className={styles.orderHeader}>
                                          <span className={styles.orderId}>Заказ №{order.id}</span>
                                          {/* ✅ Способ получения */}
                                          {order.deliveryOption && (
                                          <span className={styles.deliveryInfo}>
                                            {order.deliveryOption.name}
                                            {order.deliveryOption.type === 'DELIVERY' && order.deliveryOption.price && (
                                                <> ({Number(order.deliveryOption.price).toLocaleString('ru-RU')} ₽)</>
                                            )}
                                            {order.deliveryOption.type === 'PICKUP' && order.deliveryOption.address && (
                                                <> ({order.deliveryOption.address})</>
                                            )}
                                           </span>
                                          )}
                                          <span className={styles.orderPaidDate}>Оплачен: {paidDate.toLocaleDateString('ru-RU')} {paidDate.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})}</span>
                                          {isDelivered && deliveredDate && (
                                            <span className={styles.orderDeliveredDate}>Получен: {deliveredDate.toLocaleDateString('ru-RU')} {deliveredDate.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})}</span>
                                          )}
                                          <span className={`${styles.orderStatus} ${isDelivered ? styles.delivered : styles.pending}`}>
                                            {isDelivered ? 'Готов' : 'В процессе'}
                                          </span>
                                        </div>

                                        {/* Таблица товаров */}
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
                                                    {item.device.discount ? (
                                                      <span className={styles.discountBadge}>−{item.device.discount}%</span>
                                                    ) : (
                                                      <span className={styles.noDiscount}>—</span>
                                                    )}
                                                  </td>
                                                  <td className={styles.itemTotal}>{item.lineTotal.toLocaleString('ru-RU')} ₽</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>

                                        {/* Футер заказа */}
                                        <div className={styles.orderFooter}>
                                          <span className={styles.orderTotal}>Итого: <strong>{order.total.toLocaleString('ru-RU')} ₽</strong></span>
                                          <button 
                                            onClick={() => handleToggleDelivery(order.id, order.deliveredAt)}
                                            disabled={submittingOrderId === order.id}
                                            className={`${styles.deliveryBtn} ${isDelivered ? styles.revoke : ''}`}
                                          >
                                            {submittingOrderId === order.id ? '...' : isDelivered ? 'Отменить выдачу' : order.deliveryOption?.type === 'PICKUP' ? 'Выдать заказ' : 'Доставить заказ'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBlock />
    </div>
  );
}