'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  device: any;
}

export default function ProductCard({ device }: ProductCardProps) {
  const hasImage = device.img && device.img.trim() !== '';
  const imgUrl = hasImage 
    ? `${process.env.NEXT_PUBLIC_API_URL}${device.img}` 
    : '/display.svg';

  const rawRating = device.rating;
  const hasRating = rawRating != null && rawRating !== '' && !isNaN(Number(rawRating));
  const numericRating = hasRating ? Number(rawRating) : 0;
  const roundedRating = hasRating ? Math.round(numericRating) : 0;
  const ratingValue = hasRating ? numericRating.toFixed(1) : 'Нет оценок';
  const ratingDots = '•'.repeat(roundedRating);

  const [showExtraMenu, setShowExtraMenu] = useState(false);
  const [currentExtraIndex, setCurrentExtraIndex] = useState(0);
  const sliderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const extraImages = (device.deviceImages || []).slice(0, 5);
  const hasExtraImages = extraImages.length > 0;

  useEffect(() => {
    if (showExtraMenu && hasExtraImages && extraImages.length > 1) {
      sliderTimerRef.current = setInterval(() => {
        setCurrentExtraIndex(prev => (prev + 1) % extraImages.length);
      }, 2500);
    }
    return () => {
      if (sliderTimerRef.current) clearInterval(sliderTimerRef.current);
    };
  }, [showExtraMenu, hasExtraImages, extraImages.length]);

  const handleMouseEnter = () => setShowExtraMenu(true);
  const handleMouseLeave = () => {
    setShowExtraMenu(false);
    setCurrentExtraIndex(0);
  };

  // После других useState добавь:
  const menuRef = useRef<HTMLDivElement>(null);

  // После useEffect для слайдера добавь новый:
  useEffect(() => {
    if (showExtraMenu && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Если меню уходит за левый край — показываем справа от карточки
      if (menuRect.left < 10) {
        menuRef.current.style.left = 'calc(100% + 10px)';
        menuRef.current.style.right = 'auto';
      }
    }
  }, [showExtraMenu]);

  return (
    <div 
      className={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.imageWrap}>
        {hasImage ? (
          <div 
            className={styles.imageBg}
            style={{ backgroundImage: `url(${imgUrl})` }}
          >
            <img 
              src={imgUrl} 
              alt="" 
              className={styles.imageLoader}
              onError={(e) => {
                e.currentTarget.parentElement!.style.backgroundImage = 'none';
                e.currentTarget.parentElement!.classList.add(styles.placeholder);
                e.currentTarget.parentElement!.innerHTML = `
                  <img src="/display.svg" alt="" class="${styles.placeholderIcon}" />
                  <span class="${styles.placeholderText}">Изображение недоступно</span>
                `;
              }}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <img src="/display.svg" alt="" className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>Нет изображения</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{device.name}</h3>
        <p className={styles.meta}>{device.type?.name} • {device.brand?.name}</p>
        
        <div className={styles.rating}>
          <span className={`${styles.ratingValue} ${hasRating ? styles.hasRating : ''}`}>
            {ratingValue}
          </span>
          <span className={`${styles.ratingDots} ${hasRating ? styles.hasRating : ''}`}>
            {ratingDots}
          </span>
        </div>

        {/* ✅ Цена со скидкой */}
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
            </>
          ) : (
            <span className={styles.price}>
              {Number(device.price).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        <Link href={`/catalog/${device.id}`} className={styles.btn}>Подробнее</Link>
      </div>

      {showExtraMenu && (
        <div className={styles.extraMenu} ref={menuRef}>
          {hasExtraImages ? (
            <>
              <div className={styles.extraSlider}>
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}${extraImages[currentExtraIndex].img}`} 
                  alt={`${device.name} - изображение ${currentExtraIndex + 1}`}
                  className={styles.extraImage}
                />
              </div>
              
              <div className={styles.extraIndicators}>
                {extraImages.map((extraImg: any, i: number) => (
                  <div 
                    key={i} 
                    className={`${styles.indicator} ${i === currentExtraIndex ? styles.active : ''}`}
                  >
                    {i === currentExtraIndex && extraImages.length > 1 && (
                      <div className={styles.indicatorProgress} />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <span className={styles.noExtraImages}>Без дополнительных изображений</span>
          )}
        </div>
      )}
    </div>
  );
}