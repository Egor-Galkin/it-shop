import styles from './ProductInfo.module.scss';

interface ProductInfoProps {
  device: any;
}

export function ProductInfo({ device }: ProductInfoProps) {
  const rawRating = device.rating;
  const hasRating = rawRating != null && rawRating !== '' && !isNaN(Number(rawRating));
  const numericRating = hasRating ? Number(rawRating) : 0;
  const roundedRating = hasRating ? Math.round(numericRating) : 0;
  const ratingValue = hasRating ? numericRating.toFixed(1) : 'Нет оценок';
  const ratingDots = '•'.repeat(roundedRating);

  const getRemainingTime = (endDate: string | undefined) => {
    if (!endDate) return '';
    
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (isNaN(diff) || diff <= 0) return 'Акция завершена';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} дн.`;
    if (hours > 0) return `${hours} ч.`;
    return 'менее часа';
  };

  return (
    <div className={styles.infoWrap}>
      <div className={styles.breadcrumb}>
        <span>{device.type?.name}</span>
        <span>/</span>
        <span>{device.brand?.name}</span>
      </div>
      
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{device.name}</h1>
        <div className={styles.ratingInline}>
          <span className={`${styles.ratingNum} ${hasRating ? styles.active : ''}`}>
            {ratingValue}
          </span>
          <span className={`${styles.ratingDots} ${hasRating ? styles.active : ''}`}>
            {ratingDots}
          </span>
        </div>
      </div>
      
      <div className={styles.priceWrap}>
        {device.discount && device.finalPrice && device.finalPrice < device.price ? (
          <>
            <span className={styles.originalPrice}>
              {Number(device.price).toLocaleString('ru-RU')} ₽
            </span>
            <span className={styles.discountedPrice}>
              {device.finalPrice.toLocaleString('ru-RU')} ₽
            </span>
            <span className={styles.discountBadge}>
              −{device.discount.value}%
            </span>
            <span className={styles.discountTimer}>
              До конца акции: {getRemainingTime(device.discount.dateEnd)}
            </span>
          </>
        ) : (
          <span className={styles.price}>
            {Number(device.price).toLocaleString('ru-RU')} ₽
          </span>
        )}
      </div>

      
    </div>
  );
}