'use client';
import { useState, useEffect, Fragment, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import styles from './ReviewsAdmin.module.scss';

interface Review {
  id: number;
  userId: number;
  deviceId: number;
  rate: number;
  description: string;
  hidden: boolean;
  createdAt: string;
  user: { email: string };
  device: { name: string };
}

type SortField = 'id' | 'email' | 'device' | 'createdAt' | 'rate' | 'status';
type SortOrder = 'asc' | 'desc' | null;
type StatusFilter = 'all' | 'visible' | 'hidden';

export function ReviewsAdmin() {
  const dispatch = useAppDispatch();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);

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
      const serverSortableFields: SortField[] = ['id', 'email', 'device', 'createdAt', 'rate'];
      
      const params: any = {
        page, limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        orderBy: serverSortableFields.includes(sortField) ? sortField : 'createdAt',
        orderDir: serverSortableFields.includes(sortField) ? sortOrder : 'desc',
      };
      
      const { data } = await api.get('/ratings/admin', { params });
      let reviewsData = data.data || [];
      
      // ✅ Клиентская сортировка для status
      if (sortField === 'status' && sortOrder) {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        reviewsData = [...reviewsData].sort((a: Review, b: Review) => {
          const aHidden = a.hidden ? 1 : 0;
          const bHidden = b.hidden ? 1 : 0;
          return (aHidden - bHidden) * multiplier;
        });
      }
      
      setReviews(reviewsData);
      setTotal(data.meta?.total || reviewsData.length || 0);
    } catch (e: any) {
      console.error('Load error:', e.response?.data || e.message);
      dispatch(toast.error('Ошибка загрузки отзывов'));
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

  const toggleExpand = (reviewId: number) => {
    setExpandedId(expandedId === reviewId ? null : reviewId);
  };

  const handleToggleHidden = async (reviewId: number, currentHidden: boolean) => {
    setSubmittingReviewId(reviewId);
    try {
      await api.patch(`/ratings/${reviewId}/toggle`, { hidden: !currentHidden });
      // Обновляем локально
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, hidden: !currentHidden } : r
      ));
      dispatch(toast.success(`Отзыв ${!currentHidden ? 'скрыт' : 'показан'}`));
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка обновления'));
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const renderRatingDots = (rate: number) => {
    const value = Math.round(Number(rate));
    return '•'.repeat(value) + '·'.repeat(5 - value);
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

  if (loading) return <Loader text="Загрузка отзывов..." size="medium" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление отзывами</h1>
      </div>

      {/* ✅ Фильтры и поиск */}
      <div className={styles.filters}>
        <input placeholder="Поиск по email автора..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.search} />
        <CustomSelect 
          options={[
            { value: 'all', label: 'Все отзывы' },
            { value: 'visible', label: 'Отображаемые' },
            { value: 'hidden', label: 'Скрытые' }
          ]} 
          value={statusFilter} 
          onChange={val => setStatusFilter(val as StatusFilter)} 
        />
      </div>

      {/* ✅ Таблица отзывов */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th className={styles.sortable} onClick={() => handleSort('id')} style={{ width: 60 }}>ID <span className={styles.sortIcon}>{getSortIndicator('id')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('email')} style={{ width: 160 }}>Автор <span className={styles.sortIcon}>{getSortIndicator('email')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('device')} style={{ width: 200 }}>Товар <span className={styles.sortIcon}>{getSortIndicator('device')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('createdAt')} style={{ width: 120 }}>Дата <span className={styles.sortIcon}>{getSortIndicator('createdAt')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('rate')} style={{ width: 120 }}>Оценка <span className={styles.sortIcon}>{getSortIndicator('rate')}</span></th>
              <th className={styles.sortable} onClick={() => handleSort('status')} style={{ width: 120 }}>Статус <span className={styles.sortIcon}>{getSortIndicator('status')}</span></th>
              <th className={styles.actionsHeader}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => {
              const reviewDate = new Date(review.createdAt);
              return (
                <Fragment key={review.id}>
                  <tr className={expandedId === review.id ? styles.rowActive : ''}>
                    <td><button className={styles.expandBtn} onClick={() => toggleExpand(review.id)}>{expandedId === review.id ? '▼' : '▶'}</button></td>
                    <td>{review.id}</td>
                    <td>{review.user.email}</td>
                    <td>{review.device.name}</td>
                    <td>{reviewDate.toLocaleDateString('ru-RU')}</td>
                    <td className={styles.ratingCell}>{renderRatingDots(review.rate)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${review.hidden ? styles.statusHidden : styles.statusVisible}`}>
                        {review.hidden ? 'Скрыт' : 'Отображается'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button 
                        onClick={() => handleToggleHidden(review.id, review.hidden)}
                        disabled={submittingReviewId === review.id}
                        className={`${styles.toggleBtn} ${review.hidden ? styles.show : styles.hide}`}
                      >
                        {submittingReviewId === review.id ? '...' : review.hidden ? 'Показать' : 'Скрыть'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === review.id && (
                    <tr className={styles.expandRow}>
                      <td colSpan={8}>
                        <div className={styles.expandContent}>
                          <div className={styles.reviewDescription}>
                            <strong>Описание отзыва:</strong>
                            <p className={styles.descriptionText}>{review.description || '—'}</p>
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