'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import { toast } from '@/store/slices/toast.slice';
import styles from './ProductEditModal.module.scss';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: any;
  onSave: (updatedDevice: any) => void;
}

interface DeviceInfo {
  id?: number;
  title: string;
  description: string;
}

interface ExtraImage {
  id: number;
  img: string;
}

interface Discount {
  id?: number;
  value: number;
  dateStart: string;
  dateEnd: string;
  _isNew?: boolean;
  _deleted?: boolean;
}

const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export function ProductEditModal({ isOpen, onClose, device, onSave }: ProductEditModalProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'info' | 'images' | 'discounts'>('main');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', typeId: '', brandId: '', img: '' });
  const [deviceInfos, setDeviceInfos] = useState<DeviceInfo[]>([]);
  const [extraImages, setExtraImages] = useState<ExtraImage[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingExtraImage, setUploadingExtraImage] = useState(false);

  const mainImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && device?.id) {
      setFormData({
        name: device.name || '',
        price: String(device.price) || '',
        typeId: String(device.typeId) || '',
        brandId: String(device.brandId) || '',
        img: device.img || '',
      });
      setDeviceInfos(device.deviceInfos?.map((info: any) => ({
        id: info.id, title: info.title, description: info.description,
      })) || []);
      setExtraImages(device.deviceImages || []);
      setDiscounts([]);
      setValidationError(null);
      setActiveTab('main');
      fetchDiscounts(device.id);
    }
  }, [isOpen, device]);

  const fetchDiscounts = async (deviceId: number) => {
    try {
      const { data } = await api.get('/discounts', { params: { deviceId } });
      const formatted = (data || []).map((d: any) => ({
        ...d,
        dateStart: formatDateForInput(d.dateStart),
        dateEnd: formatDateForInput(d.dateEnd),
        _deleted: false,
        _isNew: false
      }));
      setDiscounts(formatted);
    } catch {
      setDiscounts([]);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDeviceInfo = () => setDeviceInfos(prev => [...prev, { title: '', description: '' }]);
  const updateDeviceInfo = (index: number, field: keyof DeviceInfo, value: string) => {
    setDeviceInfos(prev => prev.map((info, i) => i === index ? { ...info, [field]: value } : info));
  };
  const removeDeviceInfo = (index: number) => setDeviceInfos(prev => prev.filter((_, i) => i !== index));

  // ✅ Загрузка основного изображения
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingMainImage(true);
    try {
      const form = new FormData();
      form.append('file', file);
      
      const { data } = await api.patch(`/devices/${device.id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Обновляем formData и UI
      setFormData(prev => ({ ...prev, img: data.img }));
      toast.success('Основное изображение обновлено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setUploadingMainImage(false);
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    }
  };

  // ✅ Загрузка доп. изображения
  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingExtraImage(true);
    try {
      const form = new FormData();
      form.append('file', file);
      
      const { data } = await api.post(`/devices/${device.id}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setExtraImages(prev => [...prev, data]);
      toast.success('Изображение добавлено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setUploadingExtraImage(false);
      e.target.value = '';
    }
  };

  // ✅ Удаление доп. изображения
  const deleteExtraImage = async (imageId: number) => {
    try {
      await api.delete(`/devices/${device.id}/images/${imageId}`);
      setExtraImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Изображение удалено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  const addDiscount = () => {
    setDiscounts(prev => [...prev, { value: 10, dateStart: '', dateEnd: '', _isNew: true }]);
  };

  const updateDiscount = (index: number, field: keyof Discount, value: any) => {
    setDiscounts(prev => prev.map((d, i) => {
      if (i === index) {
        const updated = { ...d, [field]: value };
        if (field === 'value') updated.value = Number(value) || 0;
        return updated;
      }
      return d;
    }));
  };

  const removeDiscount = (index: number) => {
    setDiscounts(prev => {
      const item = prev[index];
      if (item._isNew) return prev.filter((_, i) => i !== index);
      const newDiscounts = [...prev];
      newDiscounts[index] = { ...item, _deleted: true };
      return newDiscounts;
    });
  };

  const validateDiscounts = (list: Discount[]) => {
    const active = list.filter(d => !d._deleted && d.value > 0 && d.dateStart && d.dateEnd);
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i], b = active[j];
        if (a.dateStart < b.dateEnd && a.dateEnd > b.dateStart) {
          return `Периоды пересекаются: ${a.dateStart}–${a.dateEnd} и ${b.dateStart}–${b.dateEnd}`;
        }
      }
    }
    return null;
  };

  const handleSave = async () => {
    setValidationError(null);
    setLoading(true);

    try {
      // 1. Валидация скидок
      const discountError = validateDiscounts(discounts);
      if (discountError) {
        setValidationError(discountError);
        setLoading(false);
        setActiveTab('discounts');
        return;
      }

      const hasInvalidDiscounts = discounts.some(d => 
        !d._deleted && (!d.dateStart || !d.dateEnd || !d.value || d.value <= 0)
      );
      if (hasInvalidDiscounts) {
        toast.error('Заполните даты и укажите скидку > 0% для всех активных строк');
        setLoading(false);
        setActiveTab('discounts');
        return;
      }

      // 2. Валидация характеристик
      const hasIncompleteInfos = deviceInfos.some(info => 
        (info.title.trim() !== '' && info.description.trim() === '') || 
        (info.title.trim() === '' && info.description.trim() !== '')
      );
      if (hasIncompleteInfos) {
        toast.error('В характеристиках должны быть заполнены оба поля');
        setLoading(false);
        setActiveTab('info');
        return;
      }

      // 3. Подготовка данных товара
      const payloadDeviceInfos = deviceInfos
        .filter(info => info.title.trim() !== '' && info.description.trim() !== '')
        .map(info => ({ title: info.title.trim(), description: info.description.trim() }));

      const priceVal = Number(formData.price);
      if (isNaN(priceVal) || priceVal < 0) {
        toast.error('Некорректная цена');
        setLoading(false);
        return;
      }

      const mainData = {
        name: formData.name,
        price: priceVal,
        typeId: formData.typeId ? Number(formData.typeId) : undefined,
        brandId: formData.brandId ? Number(formData.brandId) : undefined,
        img: formData.img,
        deviceInfos: payloadDeviceInfos 
      };

      // ✅ 4. РАЗДЕЛЕНИЕ: POST для создания, PATCH для обновления
      let deviceId: number;
      
      if (device?.id) {
        // === ОБНОВЛЕНИЕ существующего товара ===
        
        // 4a. Обновляем основной товар
        await api.patch(`/devices/${device.id}`, mainData);
        deviceId = device.id;
        
        // 4b. Обрабатываем скидки (последовательно)
        const toDelete = discounts.filter(d => d._deleted && d.id);
        for (const d of toDelete) await api.delete(`/discounts/${d.id}`);

        const toUpdate = discounts.filter(d => !d._deleted && !d._isNew && d.id && d.dateStart && d.dateEnd && d.value > 0);
        for (const d of toUpdate) {
          await api.patch(`/discounts/${d.id}`, {
            value: Number(d.value),
            dateStart: `${d.dateStart}T00:00:00`,
            dateEnd: `${d.dateEnd}T23:59:59`
          });
        }

        const toCreate = discounts.filter(d => d._isNew && !d._deleted && d.dateStart && d.dateEnd && d.value > 0);
        for (const d of toCreate) {
          await api.post('/discounts', {
            deviceId: device.id,
            value: Number(d.value),
            dateStart: `${d.dateStart}T00:00:00`,
            dateEnd: `${d.dateEnd}T23:59:59`
          });
        }
        
      } else {
        // === СОЗДАНИЕ нового товара ===
        
        // 4a. Создаём товар и получаем ответ с id
        const { data: createdDevice } = await api.post('/devices', mainData);
        deviceId = createdDevice.id;
        
        // 4b. Создаём скидки для нового товара (только новые, удалять/обновлять нечего)
        const toCreate = discounts.filter(d => !d._deleted && d.dateStart && d.dateEnd && d.value > 0);
        for (const d of toCreate) {
          await api.post('/discounts', {
            deviceId: deviceId,
            value: Number(d.value),
            dateStart: `${d.dateStart}T00:00:00`,
            dateEnd: `${d.dateEnd}T23:59:59`
          });
        }
      }

      // ✅ 5. Загружаем свежие данные с сервера после всех изменений
      const { data: freshDevice } = await api.get(`/devices/${deviceId}`);

      toast.success(device?.id ? 'Товар обновлён' : 'Товар создан');
      
      // ✅ Передаём СВЕЖИЕ данные в родительский компонент
      onSave(freshDevice);
      onClose();

    } catch (err: any) {
      const messages = Array.isArray(err.response?.data?.message) 
        ? err.response.data.message.join('; ') 
        : err.response?.data?.message || err.message || 'Ошибка сохранения';
      console.error('Save error:', err.response?.data);
      toast.error(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Редактирование товара</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        <div className={styles.tabs}>
          {['main', 'info', 'images', 'discounts'].map(tab => (
            <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`} onClick={() => setActiveTab(tab as any)} type="button">
              {tab === 'main' ? 'Основное' : tab === 'info' ? 'Характеристики' : tab === 'images' ? 'Изображения' : 'Скидки'}
            </button>
          ))}
        </div>

        <div className={styles.modalBody}>
          {activeTab === 'main' && (
            <div className={styles.tabContent}>
              <div className={styles.formGroup}>
                <label>Название товара</label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Введите название" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Цена (₽)</label>
                  <input type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} min="0" step="0.01" />
                </div>
                <div className={styles.formGroup}>
                  <label>Тип</label>
                  <select value={formData.typeId} onChange={(e) => handleInputChange('typeId', e.target.value)}>
                    <option value="">Выберите тип</option>
                    {device.types?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Бренд</label>
                  <select value={formData.brandId} onChange={(e) => handleInputChange('brandId', e.target.value)}>
                    <option value="">Выберите бренд</option>
                    {device.brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              
              {/* ✅ Основное изображение: загрузка файла + текстовый путь */}
              <div className={styles.formGroup}>
                <label>Основное изображение</label>
                <div className={styles.imagePreview}>
                  {formData.img ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${formData.img}`} alt="Preview" className={styles.previewImage} />
                  ) : (
                    <div className={styles.placeholder}>Нет изображения</div>
                  )}
                </div>
                
                {/* Кнопка загрузки файла */}
                <label className={styles.uploadLabel}>
                  <input 
                    ref={mainImageInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleMainImageUpload} 
                    disabled={uploadingMainImage} 
                    hidden 
                  />
                  <span className={styles.uploadBtn}>
                    {uploadingMainImage ? 'Загрузка...' : '+ Загрузить файл'}
                  </span>
                </label>
                
                {/* Текстовое поле для ручного ввода пути (опционально) */}
                <input 
                  type="text" 
                  value={formData.img} 
                  onChange={(e) => handleInputChange('img', e.target.value)} 
                  placeholder="Или введите путь: /uploads/devices/image.jpg" 
                  className={styles.imageInput} 
                />
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className={styles.tabContent}>
              <div className={styles.infoHeader}>
                <h3>Характеристики</h3>
                <button onClick={addDeviceInfo} className={styles.addBtn} type="button">+ Добавить</button>
              </div>
              {deviceInfos.length === 0 ? <p className={styles.empty}>Не добавлены</p> : (
                <div className={styles.infoList}>
                  {deviceInfos.map((info, index) => (
                    <div key={index} className={styles.infoRow}>
                      <input type="text" value={info.title} onChange={(e) => updateDeviceInfo(index, 'title', e.target.value)} placeholder="Название" className={styles.infoTitle} />
                      <input type="text" value={info.description} onChange={(e) => updateDeviceInfo(index, 'description', e.target.value)} placeholder="Значение" className={styles.infoValue} />
                      <button onClick={() => removeDeviceInfo(index)} className={styles.removeBtn} type="button">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'images' && (
          <div className={styles.tabContent}>
            {/* ✅ Загрузка доп. изображений */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleExtraImageUpload} 
                  disabled={uploadingExtraImage} 
                  hidden 
                />
                <span className={styles.uploadBtn}>
                  {uploadingExtraImage ? 'Загрузка...' : '+ Добавить изображение'}
                </span>
              </label>
            </div>
            
            {extraImages.length === 0 ? <p className={styles.empty}>Нет дополнительных изображений</p> : (
              // ✅ Ключ для принудительного ре-рендера при изменении количества изображений
              <div className={styles.imagesGrid} key={extraImages.length}>
                {extraImages.map((img) => (
                  <div key={img.id} className={styles.imageCard}>
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${img.img}`} alt="" className={styles.imageThumb} />
                    <button onClick={() => deleteExtraImage(img.id)} className={styles.deleteImageBtn} type="button">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {activeTab === 'discounts' && (
            <div className={styles.tabContent}>
              <div className={styles.infoHeader}>
                <h3>Скидки</h3>
                <button onClick={addDiscount} className={styles.addBtn} type="button">+ Добавить</button>
              </div>
              {validationError && <div className={styles.validationError}>{validationError}</div>}
              {discounts.filter(d => !d._deleted).length === 0 ? <p className={styles.empty}>Скидки не настроены</p> : (
                <div className={styles.discountList}>
                  {discounts.filter(d => !d._deleted).map((d) => {
                    const realIndex = discounts.indexOf(d);
                    return (
                      <div key={d.id || realIndex} className={styles.discountRow}>
                        <input type="number" value={d.value} onChange={(e) => updateDiscount(realIndex, 'value', Number(e.target.value))} placeholder="%" min="0" max="100" step="0.5" className={styles.discountValue} />
                        <input type="date" value={formatDateForInput(d.dateStart)} onChange={(e) => updateDiscount(realIndex, 'dateStart', e.target.value)} className={styles.discountDate} />
                        <span className={styles.dateSeparator}>—</span>
                        <input type="date" value={formatDateForInput(d.dateEnd)} onChange={(e) => updateDiscount(realIndex, 'dateEnd', e.target.value)} className={styles.discountDate} />
                        <button onClick={() => removeDiscount(realIndex)} className={styles.removeBtn} type="button">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={loading} type="button">Отмена</button>
          <button onClick={handleSave} className={styles.saveBtn} disabled={loading} type="button">{loading ? 'Сохранение...' : 'Сохранить'}</button>
        </div>
      </div>
    </div>
  );
}