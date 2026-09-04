'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './ProductGallery.module.scss';

interface ProductGalleryProps {
  mainImage: string;
  extraImages?: Array<{ id: number; img: string }>;
  alt: string;
}

export function ProductGallery({ mainImage, extraImages = [], alt }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allImages = [mainImage, ...extraImages.map(e => e.img)];
  const currentIndex = allImages.indexOf(selectedImage);

  const handleImageError = () => {
    setImageError(true);
    setIsZoomed(false);
    setIsFullscreen(false);
  };

  useEffect(() => {
    setSelectedImage(mainImage);
    setImageError(false);
  }, [mainImage]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isZoomed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ 
      x: Math.min(90, Math.max(10, x)), 
      y: Math.min(90, Math.max(10, y)) 
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isFullscreen) return;
    if (e.key === 'Escape') setIsFullscreen(false);
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevImage();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextImage();
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const goToPrevImage = () => {
    if (currentIndex > 0) {
      setSelectedImage(allImages[currentIndex - 1]);
      setIsZoomed(false);
    }
  };

  const goToNextImage = () => {
    if (currentIndex < allImages.length - 1) {
      setSelectedImage(allImages[currentIndex + 1]);
      setIsZoomed(false);
    }
  };

  const isPlaceholder = mainImage === '/display.svg' || imageError;

  return (
    <>
      <div className={styles.gallery}>
        {isPlaceholder ? (
          <div className={styles.placeholderWrap}>
            <img src="/display.svg" alt="" className={styles.placeholderIcon} />
            <span className={styles.placeholderText}>Нет изображения</span>
          </div>
        ) : (
          <>
            <div className={styles.mainImageContainer}>
              {currentIndex > 0 && (
                <button 
                  className={`${styles.navBtn} ${styles.prev}`} 
                  onClick={goToPrevImage}
                  aria-label="Предыдущее изображение"
                  type="button"
                >
                  ←
                </button>
              )}
              
              <div 
                ref={containerRef}
                className={styles.mainImageWrap}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => { setIsZoomed(false); setZoomPosition({ x: 50, y: 50 }); }}
                onClick={() => !imageError && setIsFullscreen(true)}
              >
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt={alt}
                  className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
                  style={isZoomed ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  } : {}}
                  onError={handleImageError}
                />
                <div className={styles.zoomHint}>Нажмите для просмотра</div>
              </div>
              
              {currentIndex < allImages.length - 1 && (
                <button 
                  className={`${styles.navBtn} ${styles.next}`} 
                  onClick={goToNextImage}
                  aria-label="Следующее изображение"
                  type="button"
                >
                  →
                </button>
              )}
            </div>

            <div className={styles.thumbnailsBar}>
              <button
                className={`${styles.thumb} ${styles.mainThumb} ${selectedImage === mainImage ? styles.thumbActive : ''}`}
                onClick={() => {
                  setSelectedImage(mainImage);
                  setIsZoomed(false);
                }}
                aria-label="Основное изображение"
                type="button"
              >
                <img 
                  src={mainImage} 
                  alt="" 
                  onError={(e) => { e.currentTarget.src = '/display.svg'; }}
                />
                <span className={styles.thumbLabel}>Основное</span>
              </button>

              {extraImages.length > 0 && (
                <div className={styles.extraThumbnails}>
                  <div className={styles.extraThumbnailsScroll}>
                    {extraImages.map((extraImg) => (
                      <button
                        key={extraImg.id}
                        className={`${styles.thumb} ${selectedImage === extraImg.img ? styles.thumbActive : ''}`}
                        onClick={() => {
                          setSelectedImage(extraImg.img);
                          setIsZoomed(false);
                        }}
                        aria-label="Дополнительное изображение"
                        type="button"
                      >
                        <img 
                          src={extraImg.img} 
                          alt="" 
                          onError={(e) => { e.currentTarget.src = '/display.svg'; }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isFullscreen && !imageError && (
        <div className={styles.fullscreen} onClick={() => setIsFullscreen(false)}>
          <button className={styles.closeBtn} onClick={() => setIsFullscreen(false)} type="button">✕</button>
          
          {currentIndex > 0 && (
            <button 
              className={`${styles.fullscreenNav} ${styles.prev}`} 
              onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
              type="button"
            >
              ←
            </button>
          )}
          
          <img 
            src={selectedImage} 
            alt={alt} 
            className={styles.fullscreenImage}
            onClick={(e) => e.stopPropagation()}
            onError={handleImageError}
          />
          
          {currentIndex < allImages.length - 1 && (
            <button 
              className={`${styles.fullscreenNav} ${styles.next}`} 
              onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
              type="button"
            >
              →
            </button>
          )}
          
          <div className={styles.fullscreenCounter}>
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}