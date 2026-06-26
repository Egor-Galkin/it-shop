'use client';
import { useState, useEffect } from 'react';
import styles from './DeliveryOptionEditModal.module.scss';

interface DeliveryOption {
  id?: number;
  name: string;
  type: 'DELIVERY' | 'PICKUP';
  price: number | null;
  address: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface DeliveryOptionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: DeliveryOption | null;
  existingOptions: DeliveryOption[];
  onSave: (data: any) => Promise<void>;
}

export function DeliveryOptionEditModal({ isOpen, onClose, option, existingOptions, onSave }: DeliveryOptionEditModalProps) {
  const [form, setForm] = useState<DeliveryOption>({
    name: '',
    type: 'DELIVERY',
    price: null,
    address: null,
    description: null,
    isActive: true,
    sortOrder: 0,
  });
  const [sortOrderError, setSortOrderError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (option) {
      setForm({
        id: option.id,
        name: option.name,
        type: option.type,
        price: option.price,
        address: option.address,
        description: option.description,
        isActive: option.isActive,
        sortOrder: option.sortOrder,
      });
    } else {
      // Авто-расчёт следующего sortOrder
      const maxSort = Math.max(0, ...existingOptions.map(o => o.sortOrder));
      setForm({
        name: '',
        type: 'DELIVERY',
        price: null,
        address: null,
        description: null,
        isActive: true,
        sortOrder: maxSort + 1,
      });
    }
    setSortOrderError(null);
  }, [option, existingOptions, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field: keyof DeliveryOption, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // ✅ При смене типа: очищаем ненужные поля
      if (field === 'type') {
        if (value === 'DELIVERY') updated.address = null;
        if (value === 'PICKUP') updated.price = null;
      }
      
      // ✅ Валидация sortOrder
      if (field === 'sortOrder') {
        const numValue = Number(value);
        const isDuplicate = existingOptions.some(o => o.sortOrder === numValue && o.id !== form.id);
        setSortOrderError(isDuplicate ? `Значение ${numValue} уже используется` : null);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!form.name.trim()) {
      alert('Введите название');
      return;
    }
    if (form.type === 'DELIVERY' && (form.price === null || form.price < 0)) {
      alert('Введите корректную цену для доставки');
      return;
    }
    if (form.type === 'PICKUP' && !form.address?.trim()) {
      alert('Введите адрес для самовывоза');
      return;
    }
    if (sortOrderError) {
      alert(sortOrderError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: form.type === 'DELIVERY' ? Number(form.price) : null,
        address: form.type === 'PICKUP' ? form.address : null,
      };
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{option ? 'Редактировать вариант' : 'Добавить вариант'}</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Название */}
          <div className={styles.formGroup}>
            <label>Название *</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => handleChange('name', e.target.value)} 
              placeholder="Например: Курьерская доставка"
              required
            />
          </div>

          {/* Тип: Доставка / Самовывоз */}
          <div className={styles.formGroup}>
            <label>Тип получения *</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="type" 
                  value="DELIVERY" 
                  checked={form.type === 'DELIVERY'} 
                  onChange={e => handleChange('type', e.target.value)}
                />
                <span>Доставка</span>
              </label>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="type" 
                  value="PICKUP" 
                  checked={form.type === 'PICKUP'} 
                  onChange={e => handleChange('type', e.target.value)}
                />
                <span>Самовывоз</span>
              </label>
            </div>
          </div>

          {/* Условные поля */}
          {form.type === 'DELIVERY' ? (
            <div className={styles.formGroup}>
              <label>Цена доставки (₽) *</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={form.price || ''} 
                onChange={e => handleChange('price', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="350"
                required
              />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label>Адрес пункта выдачи *</label>
              <input 
                type="text" 
                value={form.address || ''} 
                onChange={e => handleChange('address', e.target.value)}
                placeholder="г. Москва, ул. Ленина, 10"
                required
              />
            </div>
          )}

          {/* Описание */}
          <div className={styles.formGroup}>
            <label>Описание</label>
            <textarea 
              value={form.description || ''} 
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          {/* Активность */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={form.isActive} 
                onChange={e => handleChange('isActive', e.target.checked)}
              />
              <span>Активен (показывать клиентам)</span>
            </label>
          </div>

          {/* sortOrder */}
          <div className={styles.formGroup}>
            <label>Порядок сортировки *</label>
            <input 
              type="number" 
              value={form.sortOrder} 
              onChange={e => handleChange('sortOrder', Number(e.target.value))}
              className={sortOrderError ? styles.errorInput : ''}
            />
            {sortOrderError && <span className={styles.errorText}>{sortOrderError}</span>}
            <small className={styles.hint}>Уникальное число для порядка отображения</small>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={submitting}>Отмена</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting || !!sortOrderError}>
              {submitting ? 'Сохранение...' : (option ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}