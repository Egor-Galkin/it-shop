'use client';
import { useState, useCallback } from 'react';
import { FormField } from '@/components/ui/FormField/FormField';
import { useConfirm } from '@/providers/ConfirmProvider';
import { api } from '@/lib/axios';
import { toast } from '@/store/slices/toast.slice';
import styles from './ProductReviews.module.scss';

interface ProductReviewsProps {
  reviews: any[];
  deviceId: number;
  user: any;
  isAdmin: boolean;
  onUpdate: () => Promise<void>;
}

export function ProductReviews({ reviews, deviceId, user, isAdmin, onUpdate }: ProductReviewsProps) {
  const [sortOrder, setSortOrder] = useState<'date' | 'rating-desc' | 'rating-asc'>('date');
  const [myReview, setMyReview] = useState<any>(reviews.find((r: any) => r.userId === user?.id));
  const [reviewForm, setReviewForm] = useState({ rate: 5, description: myReview?.description || '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reviewTouched, setReviewTouched] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const showConfirm = useConfirm();

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOrder === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOrder === 'rating-desc') return b.rate - a.rate;
    return a.rate - b.rate;
  });

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const renderRating = (rating: number | null) => {
    if (rating == null) return { dots: '', text: 'Нет оценок', hasRating: false };
    const rounded = Math.round(Number(rating));
    return { dots: '•'.repeat(rounded), text: Number(rating).toFixed(1), hasRating: true };
  };

  const handleReviewBlur = () => {
    setReviewTouched(true);
    validateReview(reviewForm.description);
  };

  const handleReviewChange = (val: string) => {
    setReviewForm(p => ({ ...p, description: val }));
    if (reviewTouched) validateReview(val);
  };

  const validateReview = (val: string) => {
    if (val.trim().length === 0) {
      setReviewError('Это поле обязательно для заполнения');
    } else if (val.length < 10) {
      setReviewError(`Текст должен быть не короче 10 симв. Длина текста сейчас: ${val.length} симв.`);
    } else {
      setReviewError('');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setReviewTouched(true);
    validateReview(reviewForm.description);
    
    if (reviewError || reviewForm.description.trim().length < 10) {
      return;
    }
    
    setReviewLoading(true);
    setReviewMsg(null);
    try {
      if (myReview) {
        await api.patch(`/ratings/${myReview.id}`, reviewForm);
        setReviewMsg({ type: 'success', text: 'Отзыв успешно обновлён!' });
      } else {
        await api.post('/ratings', { ...reviewForm, deviceId });
        setReviewMsg({ type: 'success', text: 'Отзыв успешно добавлен!' });
      }
      
      await onUpdate();
      const updatedMine = reviews.find((r: any) => r.userId === user?.id);
      if (updatedMine) {
        setMyReview(updatedMine);
        setReviewForm({ rate: updatedMine.rate, description: updatedMine.description || '' });
      }
      setReviewTouched(false);
      setReviewError('');
    } catch (err: any) {
      setReviewMsg({ type: 'error', text: err.response?.data?.message || 'Ошибка сохранения отзыва' });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || !user) return;
    
    const ok = await showConfirm({
      title: 'Удалить отзыв?',
      message: 'Ваш отзыв будет удалён без возможности восстановления.',
      type: 'danger',
      confirmText: 'Удалить',
      cancelText: 'Отмена'
    });
    if (!ok) return;
    
    setReviewLoading(true);
    setReviewMsg(null);
    try {
      await api.delete(`/ratings/${myReview.id}`);
      setReviewMsg({ type: 'success', text: 'Отзыв удалён' });
      setMyReview(null);
      setReviewForm({ rate: 5, description: '' });
      await onUpdate();
    } catch (err: any) {
      setReviewMsg({ type: 'error', text: err.response?.data?.message || 'Ошибка удаления' });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleToggleHidden = async (reviewId: number, currentHidden: boolean) => {
    if (!isAdmin) return;
    
    const action = currentHidden ? 'показать' : 'скрыть';
    const ok = await showConfirm({
      title: `${currentHidden ? 'Показать' : 'Скрыть'} отзыв?`,
      message: `Отзыв будет ${action} для всех пользователей.`,
      type: currentHidden ? undefined : 'danger',
      confirmText: currentHidden ? 'Показать' : 'Скрыть',
      cancelText: 'Отмена'
    });
    if (!ok) return;
    
    try {
      await api.patch(`/ratings/${reviewId}`, { hidden: !currentHidden });
      await onUpdate();
      toast.success(`Отзыв ${currentHidden ? 'показан' : 'скрыт'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка обновления');
    }
  };

  return (
    <section className={styles.reviewsBlock}>
      <div className={styles.reviewsHeader}>
        <h2 className={styles.sectionTitle}>Отзывы ({sortedReviews.length})</h2>
        <div className={styles.sortButtons}>
          {[
            { key: 'date', label: 'По дате' }, 
            { key: 'rating-desc', label: 'Сначала положительные' }, 
            { key: 'rating-asc', label: 'Сначала отрицательные' }
          ].map((opt) => (
            <button 
              key={opt.key} 
              className={`${styles.sortBtn} ${sortOrder === opt.key ? styles.sortBtnActive : ''}`} 
              onClick={() => setSortOrder(opt.key as any)} 
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.reviewsList}>
        {sortedReviews.length > 0 ? sortedReviews.map((review: any) => {
          const r = renderRating(review.rate);
          const isMyReview = user && review.userId === user.id;
          
          return (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewTop}>
                <span className={styles.reviewAuthor}>{review.user?.email || 'Аноним'}</span>
                <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                
                {isAdmin && (
                  <button
                    onClick={() => handleToggleHidden(review.id, review.hidden)}
                    className={`${styles.toggleHiddenBtn} ${review.hidden ? styles.hidden : ''}`}
                    type="button"
                  >
                    {review.hidden ? 'Показать' : 'Скрыть'}
                  </button>
                )}
              </div>
              <div className={styles.reviewRating}>
                <span className={`${styles.ratingNum} ${r.hasRating ? styles.active : ''}`}>{r.text}</span>
                <span className={`${styles.ratingDots} ${r.hasRating ? styles.active : ''}`}>{r.dots}</span>
              </div>
              
              {review.hidden ? (
                <p className={styles.reviewHiddenText}>Данный отзыв был скрыт модерацией.</p>
              ) : (
                review.description && <p className={styles.reviewText}>{review.description}</p>
              )}
              
              {isMyReview && review.hidden && (
                <span className={styles.myReviewHiddenNote}>Ваш отзыв был скрыт модерацией</span>
              )}
            </div>
          );
        }) : <p className={styles.empty}>Пока нет отзывов.</p>}
      </div>

      {user && !isAdmin && (
        <form onSubmit={handleReviewSubmit} className={styles.reviewForm} noValidate>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>{myReview ? 'Редактировать отзыв' : 'Оставить отзыв'}</h3>
            {myReview && (
              <button 
                type="button" 
                onClick={handleDeleteReview} 
                className={styles.deleteBtn}
                disabled={reviewLoading}
              >
                Удалить
              </button>
            )}
          </div>
          
          {reviewMsg && (
            <p className={`${styles.formMsg} ${reviewMsg.type === 'success' ? styles.success : styles.error}`}>
              {reviewMsg.text}
            </p>
          )}
          
          {myReview?.hidden && (
            <p className={styles.formHiddenNote}>
              Ваш отзыв был скрыт модерацией и не отображается публично.
            </p>
          )}
          
          <div className={styles.formRow}>
            <label>Оценка</label>
            <div className={styles.dotsSelect}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <button 
                  key={dot} 
                  type="button" 
                  onClick={() => setReviewForm(prev => ({ ...prev, rate: dot }))} 
                  className={`${styles.dotBtn} ${reviewForm.rate >= dot ? styles.dotActive : ''}`}
                  aria-label={`Оценка ${dot}`}
                >
                  •
                </button>
              ))}
              <span className={styles.dotValue}>{reviewForm.rate} / 5</span>
            </div>
          </div>
          
          <FormField 
            as="textarea" 
            label="Комментарий" 
            name="review"
            value={reviewForm.description} 
            onChange={e => handleReviewChange(e.target.value)}
            onBlur={handleReviewBlur} 
            placeholder="Расскажите о товаре..."
            required 
            error={reviewError} 
            touched={reviewTouched}
            rows={4}
          />
          
          <button type="submit" disabled={reviewLoading || !!reviewError} className={styles.submitReviewBtn}>
            {reviewLoading ? 'Сохранение...' : (myReview ? 'Обновить отзыв' : 'Отправить отзыв')}
          </button>
        </form>
      )}
    </section>
  );
}