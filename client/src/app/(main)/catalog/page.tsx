'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import ProductCard from '@/components/catalog/ProductCard';
import { Loader } from '@/components/ui/Loader/Loader';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { ScrollToTop } from '@/components/ui/ScrollToTop/ScrollToTop';
import styles from './page.module.scss';
import { FloatingWidgets } from '@/components/layout/FloatingWidgets/FloatingWidgets';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [devices, setDevices] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // ТЕСТОВАЯ ЗАДЕРЖКА 3 СЕКУНДЫ (убрать позже)
      //await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const params = Object.fromEntries(searchParams.entries());
        const [devRes, typeRes, brandRes] = await Promise.all([
          api.get('/devices', { params }),
          api.get('/types'),
          api.get('/brands'),
        ]);
        setDevices(devRes.data.data);
        setMeta(devRes.data.meta || { page: 1, limit: 12, total: 0, totalPages: 0 });
        setTypes(typeRes.data);
        setBrands(brandRes.data);
      } catch (e) { console.error('API Error:', e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [searchParams]);

  // Дебаунс поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (searchInput !== currentSearch) updateFilter('search', searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateFilter = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());

    // Сохраняем текущее состояние для сравнения
    const currentParams = searchParams.toString();

    if (key === 'orderBy') {
      p.delete('orderBy'); p.delete('orderDir');
      if (val) {
        if (val.startsWith('-')) {
          p.set('orderBy', val.substring(1)); p.set('orderDir', 'desc');
        } else {
          p.set('orderBy', val); p.set('orderDir', val === 'price' ? 'asc' : 'desc');
        }
      }
    } else if (key === 'page') {
      p.set('page', val);
    } else if (key === 'limit') {
      p.set('limit', val);
      p.set('page', '1'); // Сброс на первую страницу при смене лимита
    } else if (!val) {
      p.delete(key); p.set('page', '1');
    } else {
      p.set(key, val); p.set('page', '1');
    }

    const newParams = p.toString();

    if (newParams === currentParams) return;

    router.push(`/catalog?${newParams}`);
  };

  const orderBy = searchParams.get('orderBy');
  const orderDir = searchParams.get('orderDir');
  const sortValue = (() => {
    if (!orderBy) return '';
    if (orderBy === 'price' && orderDir === 'desc') return '-price';
    return orderBy;
  })();

  // Пагинация с кнопками лимита (как в сортировке отзывов)
  const PaginationBlock = () => {
    if (meta.totalPages <= 1 && meta.total === 0) return null;
    const currentLimit = searchParams.get('limit') || '12';
    
    return (
      <div className={styles.paginationWrapper}>
        <div className={styles.limitButtons}>
          {['12', '24', '48'].map(limit => (
            <button
              key={limit}
              className={`${styles.limitBtn} ${currentLimit === limit ? styles.limitBtnActive : ''}`}
              onClick={() => updateFilter('limit', limit)}
              type="button"
            >
              {limit}
            </button>
          ))}
        </div>
        <div className={styles.pagination}>
          <button disabled={meta.page <= 1} onClick={() => updateFilter('page', String(meta.page - 1))} className={styles.pageBtn}>←</button>
          <span className={styles.pageInfo}>{meta.page} / {meta.totalPages || 1}</span>
          <button disabled={meta.page >= meta.totalPages} onClick={() => updateFilter('page', String(meta.page + 1))} className={styles.pageBtn}>→</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.catalog}>
      <div className={styles.filters}>
        <input placeholder="Поиск..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className={styles.search} />
        <CustomSelect options={[{ value: '', label: 'Все типы' }, ...types.map((t: any) => ({ value: String(t.id), label: t.name }))]} value={searchParams.get('typeId') || ''} onChange={val => updateFilter('typeId', val)} />
        <CustomSelect options={[{ value: '', label: 'Все бренды' }, ...brands.map((b: any) => ({ value: String(b.id), label: b.name }))]} value={searchParams.get('brandId') || ''} onChange={val => updateFilter('brandId', val)} />
        <CustomSelect options={[{ value: '', label: 'Сортировка' }, { value: 'price', label: 'Цена ↑' }, { value: '-price', label: 'Цена ↓' }, { value: 'rating', label: 'Рейтинг' }, { value: 'createdAt', label: 'Новые' }]} value={sortValue} onChange={val => updateFilter('orderBy', val)} />
      </div>

      {loading ? (
        <Loader text="Загрузка..." size="large" />
      ) : (
        <div className={styles.grid}>
          {devices.length > 0 ? devices.map((d: any) => <ProductCard key={d.id} device={d} />) : <p className={styles.empty}>Товары не найдены</p>}
        </div>
      )}

      <PaginationBlock />
      
      <FloatingWidgets />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<Loader text="Загрузка..." size="large" fullScreen />}>
      <CatalogContent />
    </Suspense>
  );
}