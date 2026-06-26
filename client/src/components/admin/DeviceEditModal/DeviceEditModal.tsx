'use client';
import { useState, useEffect } from 'react';
import { Loader } from '@/components/ui/Loader/Loader';
import styles from './DeviceEditModal.module.scss';

interface DeviceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: any | null;
  types: any[];
  brands: any[];
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

// ✅ Вспомогательная функция для очистки характеристик от системных полей
const cleanSpec = (spec: any) => ({
  title: spec.title || '',
  description: spec.description || ''
});

export function DeviceEditModal({ isOpen, onClose, device, types, brands, onSubmit, isLoading }: DeviceEditModalProps) {
  const [form, setForm] = useState({
    name: '', price: '', typeId: '', brandId: '', img: '',
    deviceInfos: [{ title: '', description: '' }]
  });

  useEffect(() => {
    if (device) {
      // ✅ Очищаем deviceInfos от системных полей (id, createdAt и т.д.)
      const cleanInfos = device.deviceInfos?.length 
        ? device.deviceInfos.map(cleanSpec) 
        : [{ title: '', description: '' }];
      
      setForm({
        name: device.name || '',
        price: device.price?.toString() || '',
        typeId: device.typeId?.toString() || '',
        brandId: device.brandId?.toString() || '',
        img: device.img || '',
        deviceInfos: cleanInfos
      });
    } else {
      setForm({ 
        name: '', price: '', typeId: '', brandId: '', img: '', 
        deviceInfos: [{ title: '', description: '' }] 
      });
    }
  }, [device, isOpen]);

  const handleChange = (field: string, value: any) => 
    setForm(prev => ({ ...prev, [field]: value }));
  
  // ✅ CRUD для характеристик
  const handleSpecChange = (index: number, field: 'title' | 'description', value: string) => {
    const newSpecs = [...form.deviceInfos];
    newSpecs[index][field] = value;
    setForm(prev => ({ ...prev, deviceInfos: newSpecs }));
  };

  const addSpec = () => 
    setForm(prev => ({ ...prev, deviceInfos: [...prev.deviceInfos, { title: '', description: '' }] }));
  
  const removeSpec = (index: number) => {
    const newSpecs = form.deviceInfos.filter((_, i) => i !== index);
    setForm(prev => ({ 
      ...prev, 
      deviceInfos: newSpecs.length ? newSpecs : [{ title: '', description: '' }] 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{device ? 'Редактировать товар' : 'Добавить товар'}</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {isLoading ? (
          <div className={styles.loadingWrap}><Loader text="Сохранение..." size="medium" /></div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            // ✅ Финальная очистка перед отправкой на бэкенд
            const payload = {
              ...form,
              deviceInfos: form.deviceInfos
                .map(cleanSpec)
                .filter((d: any) => d.title?.trim())
            };
            await onSubmit(payload);
          }} className={styles.body}>
            
            {/* Основное */}
            <div className={styles.section}>
              <h4>Основная информация</h4>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Название *</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => handleChange('name', e.target.value)} 
                    placeholder="Например: iPhone 15" 
                  />
                </div>
                <div className={styles.field}>
                  <label>Цена (₽) *</label>
                  <input 
                    required 
                    type="number" min="0" 
                    value={form.price} 
                    onChange={e => handleChange('price', e.target.value)} 
                    placeholder="99990" 
                  />
                </div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Тип устройства *</label>
                  <select 
                    required 
                    value={form.typeId} 
                    onChange={e => handleChange('typeId', e.target.value)}
                  >
                    <option value="">Выберите тип</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Бренд *</label>
                  <select 
                    required 
                    value={form.brandId} 
                    onChange={e => handleChange('brandId', e.target.value)}
                  >
                    <option value="">Выберите бренд</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>Ссылка на изображение</label>
                <input 
                  placeholder="/uploads/image.jpg" 
                  value={form.img} 
                  onChange={e => handleChange('img', e.target.value)} 
                />
              </div>
            </div>

            {/* Характеристики с полным CRUD */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4>Характеристики</h4>
                <button type="button" onClick={addSpec} className={styles.addSpecBtn}>+ Добавить</button>
              </div>
              
              {form.deviceInfos.map((spec, i) => (
                <div key={i} className={styles.specRow}>
                  <input 
                    placeholder="Параметр" 
                    value={spec.title || ''} 
                    onChange={e => handleSpecChange(i, 'title', e.target.value)} 
                    className={styles.specInput}
                  />
                  <input 
                    placeholder="Значение" 
                    value={spec.description || ''} 
                    onChange={e => handleSpecChange(i, 'description', e.target.value)} 
                    className={styles.specInput}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeSpec(i)} 
                    className={styles.removeSpecBtn} 
                    title="Удалить характеристику"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {form.deviceInfos.filter((d: any) => d.title?.trim()).length === 0 && (
                <p className={styles.emptySpec}>Нет характеристик. Нажмите "+ Добавить" чтобы создать.</p>
              )}
            </div>

            <div className={styles.footer}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>Отмена</button>
              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Сохранение...' : (device ? 'Обновить' : 'Создать')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}