'use client';
import { useState, useEffect, Fragment, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { DeliveryOptionEditModal } from '@/components/admin/DeliveryOptionEditModal/DeliveryOptionEditModal';
import styles from './DeliveryOptionsAdmin.module.scss';

interface DeliveryOption {
  id: number;
  name: string;
  type: 'DELIVERY' | 'PICKUP';
  price: number | null;
  address: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { baskets: number };
}

// ✅ Добавили 'sortOrder' в допустимые поля сортировки
type SortField = 'id' | 'name' | 'type' | 'isActive' | 'orders' | 'sortOrder';
type SortOrder = 'asc' | 'desc' | null;

export function DeliveryOptionsAdmin() {
  const dispatch = useAppDispatch();

  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortField, setSortField] = useState<SortField>('sortOrder'); // ✅ Теперь ошибка исчезнет
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null);
  const [optionToDelete, setOptionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, [sortField, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const validFields: SortField[] = ['id', 'name', 'type', 'isActive', 'sortOrder'];
      const params: any = {
        orderBy: validFields.includes(sortField) ? sortField : 'sortOrder',
        orderDir: validFields.includes(sortField) ? sortOrder : 'asc',
      };
      
      const { data } = await api.get('/delivery-options/admin', { params });
      setOptions(data);
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
  }, [sortField]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field || !sortOrder) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteClick = (id: number, name: string, orderCount: number) => {
    if (orderCount > 0) {
      toast.error(`Нельзя удалить: вариант используется в ${orderCount} заказах`);
      return;
    }
    setOptionToDelete({ id, name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!optionToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/delivery-options/${optionToDelete.id}`);
      dispatch(toast.success('Вариант удалён'));
      await loadData();
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка удаления'));
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
      setOptionToDelete(null);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const payload: any = {};
      const allowedKeys = ['name', 'type', 'price', 'address', 'description', 'isActive', 'sortOrder'];
      for (const key of allowedKeys) {
        if (data[key] !== undefined) payload[key] = data[key];
      }
      
      if (editingOption?.id) {
        await api.patch(`/delivery-options/${editingOption.id}`, payload);
        dispatch(toast.success('Вариант обновлён'));
      } else {
        await api.post('/delivery-options', payload);
        dispatch(toast.success('Вариант добавлен'));
      }
      await loadData();
      setModalOpen(false);
      setEditingOption(null);
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка сохранения'));
      throw e;
    }
  };

  if (loading) return <Loader text="Загрузка вариантов доставки..." size="medium" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Варианты получения</h1>
        <button onClick={() => { setEditingOption(null); setModalOpen(true); }} className={styles.addBtn}>
          + Добавить вариант
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th className={styles.sortable} onClick={() => handleSort('id')} style={{ width: 60 }}>
                ID <span className={styles.sortIcon}>{getSortIndicator('id')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('name')} style={{ width: 180 }}>
                Название <span className={styles.sortIcon}>{getSortIndicator('name')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('type')} style={{ width: 120 }}>
                Тип <span className={styles.sortIcon}>{getSortIndicator('type')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('isActive')} style={{ width: 120 }}>
                Активен <span className={styles.sortIcon}>{getSortIndicator('isActive')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('orders')} style={{ width: 120 }}>
                Заказы <span className={styles.sortIcon}>{getSortIndicator('orders')}</span>
              </th>
              <th className={styles.actionsHeader}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {options.map(option => {
              const isUsed = (option._count?.baskets || 0) > 0;
              const isExpanded = expandedId === option.id;
              
              return (
                <Fragment key={option.id}>
                  <tr className={`${isExpanded ? styles.rowActive : ''} ${!option.isActive ? styles.inactiveRow : ''}`}>
                    <td>
                      <button className={styles.expandBtn} onClick={() => toggleExpand(option.id)}>
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>{option.id}</td>
                    <td><strong>{option.name}</strong></td>
                    <td>
                      <span className={`${styles.typeBadge} ${option.type === 'DELIVERY' ? styles.delivery : styles.pickup}`}>
                        {option.type === 'DELIVERY' ? 'Доставка' : 'Самовывоз'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${option.isActive ? styles.active : styles.inactive}`}>
                        {option.isActive ? '✓' : '✕'}
                      </span>
                    </td>
                    <td><span className={styles.orderCount}>{option._count?.baskets || 0}</span></td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => { setEditingOption(option); setModalOpen(true); }} className={styles.editBtn}>
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(option.id, option.name, option._count?.baskets || 0)} 
                        className={`${styles.deleteBtn} ${isUsed ? styles.deleteBtnDisabled : ''}`}
                        disabled={isUsed}
                        title={isUsed ? 'Нельзя удалить: используется в заказах' : undefined}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>

                  {/* ✅ Раскрывающаяся панель с деталями */}
                  {isExpanded && (
                    <tr className={styles.expandRow}>
                      <td colSpan={7}>
                        <div className={styles.expandContent}>
                          <div className={styles.detailsGrid}>
                            {/* Цена / Адрес */}
                            <div className={styles.detailItem}>
                              <strong>{option.type === 'DELIVERY' ? 'Цена доставки:' : 'Адрес самовывоза:'}</strong>
                              <span>
                                {option.type === 'DELIVERY' 
                                  ? (option.price !== null ? `${Number(option.price).toLocaleString('ru-RU')} ₽` : 'Не указана')
                                  : (option.address || 'Не указан')}
                              </span>
                            </div>
                            
                            {/* Описание */}
                            <div className={styles.detailItem}>
                              <strong>Описание:</strong>
                              <span>{option.description || '—'}</span>
                            </div>
                            
                            {/* sortOrder */}
                            <div className={styles.detailItem}>
                              <strong>Порядок сортировки:</strong>
                              <span>{option.sortOrder}</span>
                            </div>
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

      {/* ✅ Модальное окно редактирования */}
      {modalOpen && (
        <DeliveryOptionEditModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingOption(null); }}
          option={editingOption}
          existingOptions={options.filter(o => o.id !== editingOption?.id)}
          onSave={handleSave}
        />
      )}

      {/* ✅ Подтверждение удаления */}
      {confirmOpen && optionToDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmContent}>
            <h3 className={styles.confirmTitle}>Подтвердите удаление</h3>
            <p className={styles.confirmMessage}>
              Удалить <strong>"{optionToDelete.name}"</strong>?<br/>Это действие нельзя отменить.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={() => { setConfirmOpen(false); setOptionToDelete(null); }} className={styles.confirmCancel} disabled={submitting}>Отмена</button>
              <button onClick={handleConfirmDelete} className={styles.confirmDelete} disabled={submitting}>{submitting ? 'Удаление...' : 'Удалить'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}