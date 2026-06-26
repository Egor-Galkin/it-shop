'use client';
import { useState, useEffect, Fragment, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { ProductEditModal } from '@/components/product/ProductEditModal/ProductEditModal';
import styles from './DevicesAdmin.module.scss';

interface Device {
  id: number;
  name: string;
  price: number;
  typeId: number;
  brandId: number;
  img: string | null;
  rating: number | string | null;
  type?: { name: string };
  brand?: { name: string };
  _count?: { ratings: number; basketItems: number };
  deviceInfos?: any[];
  deviceImages?: any[];
  discounts?: any[];
}

interface Review {
  id: number;
  userId: number;
  rate: number;
  description: string;
  hidden: boolean;
  createdAt: string;
  user?: { email: string };
}

type SortField = 'id' | 'name' | 'price' | 'rating' | 'ratings' | 'basketItems';
type SortOrder = 'asc' | 'desc' | null;
type ExpandedTab = 'specs' | 'discounts' | 'reviews' | null;

export function DevicesAdmin() {
  const dispatch = useAppDispatch();

  const [devices, setDevices] = useState<Device[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Пагинация и фильтры
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // ✅ По умолчанию 10
  const [total, setTotal] = useState(0);
  
  // ✅ Поиск с дебаунсом
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [filterTypeId, setFilterTypeId] = useState<string>('');
  const [filterBrandId, setFilterBrandId] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<{ id: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ExpandedTab>('specs');
  const [reviews, setReviews] = useState<Record<number, Review[]>>({});
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // ✅ Загрузка справочников
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [tRes, bRes] = await Promise.all([api.get('/types'), api.get('/brands')]);
        setTypes(tRes.data);
        setBrands(bRes.data);
      } catch (e) { console.error('Failed to load refs', e); }
    };
    loadRefs();
  }, []);

  // ✅ Дебаунс поиска (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Загрузка устройств с параметрами
  useEffect(() => {
    loadData();
  }, [page, limit, debouncedSearch, filterTypeId, filterBrandId, sortField, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const serverSortableFields: SortField[] = ['name', 'price', 'rating'];
      
      const params: any = {
        page,
        limit,
        search: debouncedSearch || undefined,
        typeId: filterTypeId || undefined,
        brandId: filterBrandId || undefined,
        orderBy: serverSortableFields.includes(sortField) ? sortField : undefined,
        orderDir: serverSortableFields.includes(sortField) ? sortOrder : undefined
      };
      
      const { data } = await api.get('/devices', { params });
      let devicesData = data.data || data;
      
      // ✅ Загружаем активные скидки для каждого товара
      const now = new Date();
      const enrichedDevices = await Promise.all(
        devicesData.map(async (device: Device) => {
          if (device.discounts) return device;
          try {
            const { data: discounts } = await api.get('/discounts', { params: { deviceId: device.id } });
            return { ...device, discounts };
          } catch {
            return { ...device, discounts: [] };
          }
        })
      );
      
      // ✅ Клиентская сортировка для id, ratings, basketItems
      if (!serverSortableFields.includes(sortField) && sortOrder) {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        const sorted = [...enrichedDevices].sort((a: Device, b: Device) => {
          if (sortField === 'id') return (a.id - b.id) * multiplier;
          if (sortField === 'ratings') {
            const aVal = a._count?.ratings || 0;
            const bVal = b._count?.ratings || 0;
            return (aVal - bVal) * multiplier;
          }
          if (sortField === 'basketItems') {
            const aVal = a._count?.basketItems || 0;
            const bVal = b._count?.basketItems || 0;
            return (aVal - bVal) * multiplier;
          }
          return 0;
        });
        setDevices(sorted);
      } else {
        setDevices(enrichedDevices);
      }
      
      setTotal(data.meta?.total || enrichedDevices.length || 0);
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

  // ✅ Расчёт активной скидки для товара
  const getActiveDiscount = (device: Device) => {
    if (!device.discounts?.length) return null;
    
    const now = new Date();
    const active = device.discounts.find((d: any) => {
      const start = new Date(d.dateStart);
      const end = new Date(d.dateEnd);
      return now >= start && now <= end && d.value > 0;
    });
    
    if (!active) return null;
    
    const basePrice = Number(device.price);
    const discountValue = Number(active.value);
    const discountedPrice = basePrice * (1 - discountValue / 100);
    
    return {
      value: discountValue,
      basePrice,
      discountedPrice: Number(discountedPrice.toFixed(2))
    };
  };

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setActiveTab(null);
      return;
    }
    setExpandedId(id);
    setActiveTab('specs');
    if (!reviews[id]) await loadReviews(id);
  };

  const loadReviews = async (deviceId: number) => {
    setReviewsLoading(true);
    try {
      const { data } = await api.get(`/ratings?deviceId=${deviceId}`);
      setReviews(prev => ({ ...prev, [deviceId]: data }));
    } catch { setReviews(prev => ({ ...prev, [deviceId]: [] })); }
    finally { setReviewsLoading(false); }
  };

  const loadDiscounts = async (deviceId: number) => {
    try {
      const { data } = await api.get(`/discounts`, { params: { deviceId } });
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, discounts: data } : d));
    } catch (e) {
      console.error('Failed to load discounts:', e);
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, discounts: [] } : d));
    }
  };

  const handleToggleReviewHidden = async (deviceId: number, reviewId: number, currentHidden: boolean) => {
    try {
      await api.patch(`/ratings/${reviewId}`, { hidden: !currentHidden });
      setReviews(prev => ({
        ...prev,
        [deviceId]: prev[deviceId]?.map(r => r.id === reviewId ? { ...r, hidden: !currentHidden } : r)
      }));
      dispatch(toast.success(`Отзыв ${currentHidden ? 'показан' : 'скрыт'}`));
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка обновления'));
    }
  };

  // ✅ Проверка: можно ли удалить товар
  const canDeleteDevice = (device: Device) => {
    const hasReviews = device._count?.ratings && device._count.ratings > 0;
    const hasOrders = device._count?.basketItems && device._count.basketItems > 0;
    return !hasReviews && !hasOrders;
  };

  const handleDeleteClick = (id: number, name: string) => {
    const device = devices.find(d => d.id === id);
    if (device && !canDeleteDevice(device)) {
      toast.error('Нельзя удалить товар с отзывами или заказами');
      return;
    }
    setDeviceToDelete({ id, name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/devices/${deviceToDelete.id}`);
      dispatch(toast.success('Товар удалён'));
      await loadData();
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка удаления'));
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
      setDeviceToDelete(null);
    }
  };

  const handleSaveDevice = async (updatedDevice: any) => {
    await loadData();
    setModalOpen(false);
    setEditingDevice(null);
  };

  const renderRatingDots = (rating: number | string | null) => {
    if (rating == null) return '—';
    const value = Math.round(Number(rating));
    return '•'.repeat(value) + '·'.repeat(5 - value);
  };

  // ✅ Пагинация с кнопками лимита (10/20/40)
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
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            className={styles.pageBtn}
            type="button"
          >
            ←
          </button>
          <span className={styles.pageInfo}>{page} / {totalPages || 1}</span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            className={styles.pageBtn}
            type="button"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <Loader text="Загрузка товаров..." size="medium" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление товарами</h1>
        <button 
          onClick={() => { 
            setEditingDevice({ types, brands } as any); 
            setModalOpen(true); 
          }} 
          className={styles.addBtn}
        >
          + Добавить товар
        </button>
      </div>

      {/* ✅ Фильтры и поиск */}
      <div className={styles.filters}>
        <input 
          placeholder="Поиск по названию..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className={styles.search} 
        />
        <CustomSelect 
          options={[{ value: '', label: 'Все типы' }, ...types.map((t: any) => ({ value: String(t.id), label: t.name }))]} 
          value={filterTypeId} 
          onChange={val => { setFilterTypeId(val); setPage(1); }} 
        />
        <CustomSelect 
          options={[{ value: '', label: 'Все бренды' }, ...brands.map((b: any) => ({ value: String(b.id), label: b.name }))]} 
          value={filterBrandId} 
          onChange={val => { setFilterBrandId(val); setPage(1); }} 
        />
      </div>

      {/* ✅ Таблица товаров */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th className={styles.sortable} onClick={() => handleSort('id')} style={{ width: 60 }}>
                ID <span className={styles.sortIcon}>{getSortIndicator('id')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('name')} style={{ width: 200 }}>
                Товар <span className={styles.sortIcon}>{getSortIndicator('name')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('price')} style={{ width: 160 }}>
                Цена <span className={styles.sortIcon}>{getSortIndicator('price')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('rating')} style={{ width: 100 }}>
                Рейтинг <span className={styles.sortIcon}>{getSortIndicator('rating')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('ratings')} style={{ width: 100 }}>
                Отзывы <span className={styles.sortIcon}>{getSortIndicator('ratings')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('basketItems')} style={{ width: 100 }}>
                Заказы <span className={styles.sortIcon}>{getSortIndicator('basketItems')}</span>
              </th>
              <th className={styles.actionsHeader}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => {
              const isDeletable = canDeleteDevice(device);
              const discount = getActiveDiscount(device);
              
              return (
                <Fragment key={device.id}>
                  <tr className={expandedId === device.id ? styles.rowActive : ''}>
                    <td>
                      <button className={styles.expandBtn} onClick={() => toggleExpand(device.id)}>
                        {expandedId === device.id ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>{device.id}</td>
                    <td>
                      <div className={styles.productInfo}>
                        <strong>{device.name}</strong>
                        <span className={styles.productMeta}>{device.type?.name} / {device.brand?.name}</span>
                      </div>
                    </td>
                    
                    {/* ✅ Ячейка цены со скидкой */}
                    <td className={styles.priceCell}>
                      {discount ? (
                        <div className={styles.priceWithDiscount}>
                          <span className={styles.originalPrice}>
                            {discount.basePrice.toLocaleString('ru-RU')} ₽
                          </span>
                          <span className={styles.discountedPrice}>
                            {discount.discountedPrice.toLocaleString('ru-RU')} ₽
                          </span>
                          <span className={styles.discountBadge}>
                            −{discount.value}%
                          </span>
                        </div>
                      ) : (
                        <span>{Number(device.price).toLocaleString('ru-RU')} ₽</span>
                      )}
                    </td>
                    
                    <td className={styles.ratingCell}>{renderRatingDots(device.rating)}</td>
                    <td><span className={styles.countBadge}>{device._count?.ratings || 0}</span></td>
                    <td><span className={styles.countBadge}>{device._count?.basketItems || 0}</span></td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => { setEditingDevice(device); setModalOpen(true); }} className={styles.editBtn}>Редактировать</button>
                      <button 
                        onClick={() => handleDeleteClick(device.id, device.name)} 
                        className={`${styles.deleteBtn} ${!isDeletable ? styles.deleteBtnDisabled : ''}`}
                        disabled={!isDeletable}
                        title={!isDeletable ? 'Нельзя удалить товар с отзывами или заказами' : undefined}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>

                  {/* ✅ Раскрывающаяся панель с вкладками */}
                  {expandedId === device.id && (
                    <tr className={styles.expandRow}>
                      <td colSpan={8}>
                        <div className={styles.expandContent}>
                          {/* Вкладки */}
                          <div className={styles.tabs}>
                            <button 
                              className={`${styles.tab} ${activeTab === 'specs' ? styles.active : ''}`} 
                              onClick={() => setActiveTab('specs')}
                              type="button"
                            >
                              Характеристики
                            </button>
                            <button 
                              className={`${styles.tab} ${activeTab === 'discounts' ? styles.active : ''}`} 
                              onClick={async () => {
                                const device = devices.find(d => d.id === expandedId);
                                if (expandedId && activeTab !== 'discounts' && !device?.discounts) {
                                  await loadDiscounts(expandedId);
                                }
                                setActiveTab('discounts');
                              }}
                              type="button"
                            >
                              Скидки
                            </button>
                            <button 
                              className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`} 
                              onClick={() => setActiveTab('reviews')}
                              type="button"
                            >
                              Отзывы ({reviews[device.id]?.length || 0})
                            </button>
                          </div>

                          {/* Контент вкладок */}
                          <div className={styles.tabContent}>
                            {/* ✅ Вкладка: Характеристики */}
                            {activeTab === 'specs' && (
                              <div className={styles.specsGrid}>
                                <div className={styles.specsSection}>
                                  <h4>Характеристики</h4>
                                  {device.deviceInfos?.length ? (
                                    <table className={styles.specsTable}>
                                      <tbody>
                                        {device.deviceInfos.map((info: any) => (
                                          <tr key={info.id}>
                                            <td className={styles.specTitle}>{info.title}</td>
                                            <td className={styles.specValue}>{info.description}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : <p className={styles.emptySmall}>Нет характеристик</p>}
                                </div>
                                
                                <div className={styles.specsSection}>
                                  <h4>Изображения</h4>
                                  <div className={styles.imagesGrid}>
                                    {device.img && (
                                      <div className={styles.imageCard}>
                                        <img 
                                          src={`${process.env.NEXT_PUBLIC_API_URL}${device.img}`} 
                                          alt="Основное" 
                                          className={styles.imageThumb} 
                                          onError={(e) => {
                                            e.currentTarget.src = '/display.svg';
                                            e.currentTarget.alt = 'Изображение не найдено';
                                          }}
                                        />
                                        <span className={styles.imageLabel}>Основное</span>
                                      </div>
                                    )}
                                    {device.deviceImages?.map((img: any) => (
                                      <div key={img.id} className={styles.imageCard}>
                                        <img 
                                          src={`${process.env.NEXT_PUBLIC_API_URL}${img.img}`} 
                                          alt="" 
                                          className={styles.imageThumb} 
                                          onError={(e) => {
                                            e.currentTarget.src = '/display.svg';
                                            e.currentTarget.alt = 'Изображение не найдено';
                                          }}
                                        />
                                        <span className={styles.imageLabel}>Доп.</span>
                                      </div>
                                    ))}
                                    {!device.img && !device.deviceImages?.length && (
                                      <p className={styles.emptySmall}>Нет изображений</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ✅ Вкладка: Скидки */}
                            {activeTab === 'discounts' && (
                              <div className={styles.discountsSection}>
                                {device.discounts?.length ? (
                                  <table className={styles.discountsTable}>
                                    <thead>
                                      <tr>
                                        <th>Скидка</th>
                                        <th>Действует с</th>
                                        <th>Действует до</th>
                                        <th>Статус</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {device.discounts.map((d: any) => {
                                        const now = new Date();
                                        const start = new Date(d.dateStart);
                                        const end = new Date(d.dateEnd);
                                        const isActive = now >= start && now <= end;
                                        return (
                                          <tr key={d.id}>
                                            <td><strong>{Number(d.value).toFixed(1)}%</strong></td>
                                            <td>{new Date(d.dateStart).toLocaleDateString('ru-RU')}</td>
                                            <td>{new Date(d.dateEnd).toLocaleDateString('ru-RU')}</td>
                                            <td>
                                              <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
                                                {isActive ? 'Активна' : 'Не активна'}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                ) : <p className={styles.emptySmall}>Нет скидок</p>}
                              </div>
                            )}

                            {/* ✅ Вкладка: Отзывы */}
                            {activeTab === 'reviews' && (
                              <div className={styles.reviewsSection}>
                                {reviewsLoading ? (
                                  <Loader text="Загрузка отзывов..." size="small" />
                                ) : (reviews[device.id] || []).length === 0 ? (
                                  <p className={styles.emptySmall}>Отзывов нет</p>
                                ) : (
                                  <div className={styles.reviewsList}>
                                    {(reviews[device.id] || []).map(r => (
                                      <div key={r.id} className={`${styles.reviewItem} ${r.hidden ? styles.reviewHidden : ''}`}>
                                        <div className={styles.reviewHeader}>
                                          <span>{r.user?.email || 'Аноним'}</span>
                                          <span className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString('ru-RU')}</span>
                                          <span className={styles.reviewRating}>{renderRatingDots(r.rate)}</span>
                                          {r.hidden && <span className={styles.hiddenBadge}>Скрыт</span>}
                                        </div>
                                        {r.hidden ? (
                                          <p className={styles.reviewHiddenText}>Данный отзыв был скрыт модерацией.</p>
                                        ) : (
                                          <p className={styles.reviewText}>{r.description}</p>
                                        )}
                                        <button 
                                          onClick={() => handleToggleReviewHidden(device.id, r.id, r.hidden)}
                                          className={styles.toggleReviewBtn}
                                          type="button"
                                        >
                                          {r.hidden ? 'Показать отзыв' : 'Скрыть отзыв'}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
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

      {/* ✅ Sticky-пагинация */}
      <PaginationBlock />

      {/* ✅ Модальное окно — ProductEditModal */}
      {modalOpen && (
        <ProductEditModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingDevice(null); }}
          device={editingDevice ? { ...editingDevice, types, brands } : { types, brands }}
          onSave={handleSaveDevice}
        />
      )}

      {/* ✅ Подтверждение удаления */}
      {confirmOpen && deviceToDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmContent}>
            <h3 className={styles.confirmTitle}>Подтвердите удаление</h3>
            <p className={styles.confirmMessage}>
              Удалить <strong>"{deviceToDelete.name}"</strong>?<br/>Это действие нельзя отменить.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={() => { setConfirmOpen(false); setDeviceToDelete(null); }} className={styles.confirmCancel} disabled={submitting}>Отмена</button>
              <button onClick={handleConfirmDelete} className={styles.confirmDelete} disabled={submitting}>{submitting ? 'Удаление...' : 'Удалить'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}