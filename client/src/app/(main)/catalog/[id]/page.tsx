'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { api } from '@/lib/axios';
import { Loader } from '@/components/ui/Loader/Loader';
import { addToCart } from '@/store/slices/cart.slice';
import { toast } from '@/store/slices/toast.slice';
import { ProductGallery } from '@/components/product/ProductGallery/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo/ProductInfo';
import { ProductSpecs } from '@/components/product/ProductSpecs/ProductSpecs';
import { ProductPurchase } from '@/components/product/ProductPurchase/ProductPurchase';
import { ProductReviews } from '@/components/product/ProductReviews/ProductReviews';
import { ProductEditModal } from '@/components/product/ProductEditModal/ProductEditModal';
import { FloatingWidgets } from '@/components/layout/FloatingWidgets/FloatingWidgets';
import styles from './page.module.scss';

function ProductContent() {
  const params = useParams();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const deviceId = Number(params.id);

  const [device, setDevice] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<any[]>([]);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const checkAuth = useCallback(() => {
    if (!user) {
      router.push('/auth');
      return false;
    }
    return true;
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [deviceRes, infoRes, reviewsRes, typesRes, brandsRes] = await Promise.all([
          api.get(`/devices/${deviceId}`),
          api.get(`/device-info?deviceId=${deviceId}`),
          api.get(`/ratings?deviceId=${deviceId}`),
          api.get('/types'),
          api.get('/brands'),
        ]);
        setDevice(deviceRes.data);
        setDeviceInfo(infoRes.data);
        setReviews(reviewsRes.data);
        setDeviceTypes(typesRes.data);
        setDeviceBrands(brandsRes.data);
      } catch (err: any) {
        setError(err.response?.status === 404 ? 'Товар не найден' : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(deviceId)) fetchData();
  }, [deviceId]);

  // ✅ Добавляем useCallback для стабилизации функции
  const handleCartClick = useCallback(async (quantity: number, unitPrice: number) => {
    if (!checkAuth()) return;
    try {
      // ✅ Dispatch с правильными параметрами
      await dispatch(addToCart({ deviceId, quantity, price: unitPrice })).unwrap();
    } catch (err: any) {
      dispatch(toast.error(err.message || 'Ошибка добавления в корзину'));
    }
  }, [dispatch, deviceId, checkAuth]); // ✅ Зависимости: только то, что реально используется

  const handleDataUpdate = async () => {
    try {
      const [deviceRes, reviewsRes] = await Promise.all([
        api.get(`/devices/${deviceId}`),
        api.get(`/ratings?deviceId=${deviceId}`),
      ]);
      setDevice(deviceRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Ошибка обновления данных:', err);
    }
  };

  if (loading) return <Loader text="Загрузка товара..." size="large" />;
  if (error) return (
    <div className={styles.error}>
      <p>{error}</p>
      <button onClick={() => router.back()} className={styles.backBtn}>← Назад</button>
    </div>
  );
  if (!device) return null;

  const isAdmin = user?.role === 'ADMIN';
  const mainImageUrl = device.img ? `${process.env.NEXT_PUBLIC_API_URL}${device.img}` : '/display.svg';
  const extraImages = (device.deviceImages || []).map((img: any) => ({
    id: img.id,
    img: `${process.env.NEXT_PUBLIC_API_URL}${img.img}`
  }));

  return (
    <div className={styles.product}>
      <section className={`${styles.mainBlock} ${styles.animate}`}>
        <ProductGallery 
          mainImage={mainImageUrl}
          extraImages={extraImages}
          alt={device.name}
        />

        <div className={styles.rightColumn}>
          <ProductInfo device={device} />
          <ProductSpecs specs={deviceInfo} />
          
          {!isAdmin ? (
            <ProductPurchase 
              price={Number(device.price)}
              finalPrice={device.finalPrice}
              onAddToCart={handleCartClick}
            />
          ) : (
            <>
              <div className={styles.adminActionWrap}>
                <button 
                  onClick={() => setEditModalOpen(true)} 
                  className={styles.editBtn}
                  type="button"
                >
                  Редактировать товар
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <ProductReviews 
        reviews={reviews}
        deviceId={deviceId}
        user={user}
        isAdmin={isAdmin}
        onUpdate={handleDataUpdate}
      />

      <ProductEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        device={{
          ...device,
          types: deviceTypes,
          brands: deviceBrands,
        }}
        onSave={(updatedDevice) => {
          setDevice(updatedDevice);
          // При необходимости обновить deviceInfo/deviceImages
          setDeviceInfo(updatedDevice.deviceInfos || []);
        }}
      />

      <FloatingWidgets />

    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<Loader text="Загрузка..." size="large" fullScreen />}>
      <ProductContent />
    </Suspense>
  );
}