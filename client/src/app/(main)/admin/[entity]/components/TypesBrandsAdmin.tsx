'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { ModalForm } from '@/components/admin/ModalForm/ModalForm';
import styles from './TypesBrandsAdmin.module.scss';

interface TypesBrandsAdminProps {
  entity: 'types' | 'brands';
}

interface Item {
  id: number;
  name: string;
  deviceCount: number;
}

type SortField = 'id' | 'name' | 'deviceCount';
type SortOrder = 'asc' | 'desc' | null;

export function TypesBrandsAdmin({ entity }: TypesBrandsAdminProps) {
  const dispatch = useAppDispatch();
  const isTypes = entity === 'types';
  const label = isTypes ? 'тип' : 'бренд';
  
  const config = {
    title: isTypes ? 'Типы устройств' : 'Бренды',
    add: isTypes ? 'Добавить тип' : 'Добавить бренд',
    edit: isTypes ? 'Редактировать тип' : 'Редактировать бренд',
    deleteError: isTypes ? 'Нельзя удалить: тип используется в устройствах' : 'Нельзя удалить: бренд используется в устройствах'
  };

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const endpoint = `/${entity}`;

  useEffect(() => {
    loadItems();
  }, [entity]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setItems(data);
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка загрузки'));
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field || !sortOrder) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortOrder) return 0;
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'id') return (a.id - b.id) * multiplier;
    if (sortField === 'name') return a.name.localeCompare(b.name, 'ru') * multiplier;
    if (sortField === 'deviceCount') return (a.deviceCount - b.deviceCount) * multiplier;
    return 0;
  });

  const handleOpenModal = (item?: Item) => {
    setEditingItem(item || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setItemToDelete({ id, name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`${endpoint}/${itemToDelete.id}`);
      dispatch(toast.success('Удалено успешно'));
      await loadItems();
    } catch (e: any) {
      const message = e.response?.data?.message || 'Ошибка удаления';
      dispatch(toast.error(
        message.includes('used') || message.includes('Cannot delete') 
          ? config.deleteError 
          : message
      ));
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.patch(`${endpoint}/${editingItem.id}`, { name: data.name });
        dispatch(toast.success('Успешно обновлено'));
      } else {
        await api.post(endpoint, { name: data.name });
        dispatch(toast.success('Успешно добавлено'));
      }
      await loadItems();
      handleCloseModal();
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка сохранения'));
    } finally {
      setSubmitting(false);
    }
  };

  const modalFields = [
    { name: 'name', label: 'Название', type: 'text' as const, required: true, placeholder: `Введите название ${label}а` }
  ];

  if (loading) return <Loader text={`Загрузка ${config.title.toLowerCase()}...`} size="medium" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{config.title}</h1>
        <button onClick={() => handleOpenModal()} className={styles.addBtn}>
          + {config.add}
        </button>
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th className={styles.sortable} onClick={() => handleSort('id')}>
                ID <span className={styles.sortIcon}>{getSortIndicator('id')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('name')}>
                Название <span className={styles.sortIcon}>{getSortIndicator('name')}</span>
              </th>
              <th className={styles.sortable} onClick={() => handleSort('deviceCount')}>
                Товаров <span className={styles.sortIcon}>{getSortIndicator('deviceCount')}</span>
              </th>
              <th className={styles.actionsHeader}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  <span className={`${styles.count} ${item.deviceCount > 0 ? styles.used : ''}`}>
                    {item.deviceCount}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button onClick={() => handleOpenModal(item)} className={styles.editBtn}>
                    Редактировать
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(item.id, item.name)} 
                    className={`${styles.deleteBtn} ${item.deviceCount > 0 ? styles.disabled : ''}`}
                    disabled={item.deviceCount > 0}
                    title={item.deviceCount > 0 ? 'Нельзя удалить: используется' : 'Удалить'}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedItems.length === 0 && <p className={styles.empty}>Записи не найдены.</p>}
      </div>

      {/* Модальное окно формы */}
      <ModalForm
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? config.edit : config.add}
        isLoading={submitting}
        onSubmit={handleSubmit}
        fields={modalFields}
        initialValues={editingItem ? { name: editingItem.name } : {}}
        submitLabel={editingItem ? 'Обновить' : 'Добавить'}
      />

      {/* Модальное окно подтверждения */}
      {confirmOpen && itemToDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmContent}>
            <h3 className={styles.confirmTitle}>Подтвердите удаление</h3>
            <p className={styles.confirmMessage}>
              Удалить <strong>"{itemToDelete.name}"</strong>?<br/>Это действие нельзя отменить.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={() => { setConfirmOpen(false); setItemToDelete(null); }} className={styles.confirmCancel} disabled={submitting}>
                Отмена
              </button>
              <button onClick={handleConfirmDelete} className={styles.confirmDelete} disabled={submitting}>
                {submitting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}