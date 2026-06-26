'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Slider.module.scss';

const slides = [
  { 
    title: 'Новые флагманы уже в наличии', 
    desc: 'iPhone 15 Pro, Galaxy S24 Ultra и другие топовые модели', 
    bg: '/slide1.png' 
  },
  { 
    title: 'Скидки до 30% на ноутбуки', 
    desc: 'Идеальное время для апгрейда вашего рабочего места', 
    bg: '/slide2.png' 
  },
  { 
    title: 'Гарантия и быстрая доставка', 
    desc: 'Оригинальная техника с официальной гарантией 2 года', 
    bg: '/slide3.png' 
  },
];

export function Slider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 6000);
  };

  useEffect(() => {
    if (!isPaused) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const goToSlide = (index: number) => {
    setCurrent((index + slides.length) % slides.length);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      startTimer();
    }
  };

  const prevSlide = () => goToSlide(current - 1);
  const nextSlide = () => goToSlide(current + 1);

  return (
    <section className={`${styles.slider} ${styles.animate}`}>
      <div className={styles.slideBg} style={{ backgroundImage: `url(${slides[current].bg})` }} />
      <div className={styles.slideOverlay} />

      <div className={styles.slideContent}>
        <h1 className={styles.sliderTitle}>{slides[current].title}</h1>
        <p className={styles.sliderDesc}>{slides[current].desc}</p>
        <Link href="/catalog" className={styles.sliderBtn}>Перейти в каталог</Link>
      </div>

      <div className={styles.controlsArea} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button onClick={prevSlide} className={`${styles.navBtn} ${styles.navPrev}`} aria-label="Предыдущий слайд">←</button>
        <button onClick={nextSlide} className={`${styles.navBtn} ${styles.navNext}`} aria-label="Следующий слайд">→</button>
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => goToSlide(i)} 
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {isPaused && <span className={styles.pauseIndicator}>⏸ Пауза</span>}
    </section>
  );
}