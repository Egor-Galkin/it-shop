'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Slider } from '@/components/home/Slider/Slider';
import styles from './page.module.scss';
import { ScrollToTop } from '@/components/ui/ScrollToTop/ScrollToTop';

// Данные для преимуществ (без эмодзи, с заглушками)
const advantages = [
  { 
    title: 'Официальная гарантия', 
    desc: '2 года на всю технику от производителя. Сервисные центры по всей России.',
    image: '/display.svg'
  },
  { 
    title: 'Быстрая доставка', 
    desc: 'По России за 1-3 дня. Бесплатная доставка при заказе от 5000 ₽.',
    image: '/display.svg'
  },
  { 
    title: 'Удобная оплата', 
    desc: 'Принимаем карты, наличные, рассрочка 0-0-12 без переплат и скрытых комиссий.',
    image: '/display.svg'
  },
  { 
    title: 'Лёгкий возврат', 
    desc: '14 дней на обмен или возврат без лишних вопросов и бюрократии.',
    image: '/display.svg'
  },
];

// Категории товаров
const categories = [
  { name: 'Смартфоны', icon: '/display.svg', href: '/catalog?typeId=1' },
  { name: 'Ноутбуки', icon: '/display.svg', href: '/catalog?typeId=2' },
  { name: 'Планшеты', icon: '/display.svg', href: '/catalog?typeId=3' },
  { name: 'Аксессуары', icon: '/display.svg', href: '/catalog?typeId=4' },
];

// Статистика
const stats = [
  { value: '50K+', label: 'Довольных клиентов' },
  { value: '10K+', label: 'Товаров в каталоге' },
  { value: '99%', label: 'Положительных отзывов' },
  { value: '24/7', label: 'Поддержка' },
];

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.home}>
      {/* 🔹 Слайдер */}
      <Slider />

      {/* 🔹 О магазине */}
      <section className={`${styles.info} ${isLoaded ? styles.animate : ''}`} style={{ animationDelay: '0.6s' }}>
        <h2 className={styles.infoTitle}>О магазине</h2>
        <p className={styles.infoText}>ITshop специализируется на продаже сертифицированной электроники. Мы работаем напрямую с поставщиками, чтобы предложить лучшие цены и официальную гарантию на каждый товар.</p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <h3 className={styles.featureTitle}>Оригинал</h3>
            <p className={styles.featureText}>100% подлинная продукция</p>
          </div>
          <div className={styles.feature}>
            <h3 className={styles.featureTitle}>Доставка</h3>
            <p className={styles.featureText}>По всей России за 1-3 дня</p>
          </div>
          <div className={styles.feature}>
            <h3 className={styles.featureTitle}>Поддержка</h3>
            <p className={styles.featureText}>Консультация до и после покупки</p>
          </div>
        </div>
      </section>

      {/* 🔹 Категории товаров */}
      <section className={`${styles.categories} ${isLoaded ? styles.animate : ''}`} style={{ animationDelay: '0.4s' }}>
        <h2 className={styles.sectionTitle}>Популярные категории</h2>
        <div className={styles.categoriesGrid}>
          {categories.map((cat, i) => (
            <Link key={i} href={cat.href} className={styles.categoryCard}>
              <div className={styles.catIcon}>
                <img src={cat.icon} alt={cat.name} />
              </div>
              <span className={styles.catName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 🔹 Статистика доверия */}
      <section className={`${styles.stats} ${isLoaded ? styles.animate : ''}`} style={{ animationDelay: '0.8s' }}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Призыв к действию (CTA) */}
      <section className={`${styles.cta} ${isLoaded ? styles.animate : ''}`} style={{ animationDelay: '1s' }}>
        <div className={styles.ctaContent}>
          <h2>Готовы к обновлению?</h2>
          <p>Более 10 000 товаров в наличии. Официальная гарантия. Быстрая доставка.</p>
          <Link href="/catalog" className={styles.ctaBtn}>Перейти в каталог →</Link>
        </div>
      </section>

      {/* 🔹 Преимущества (шахматный порядок) */}
      <section className={`${styles.advantages} ${isLoaded ? styles.animate : ''}`} style={{ animationDelay: '0.2s' }}>
        <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
        <div className={styles.advantagesList}>
          {advantages.map((adv, i) => (
            <div 
              key={i} 
              className={`${styles.advantageBlock} ${i % 2 === 1 ? styles.reverse : ''}`}
            >
              <div className={styles.advContent}>
                <h3 className={styles.advTitle}>{adv.title}</h3>
                <div className={styles.advDivider} />
                <p className={styles.advDesc}>{adv.desc}</p>
              </div>
              <div className={styles.advImage}>
                <img src={adv.image} alt={adv.title} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Партнёры */}
      <section className={`${styles.partners} ${isLoaded ? styles.animate : ''}`} style={{ animationDelay: '1.2s' }}>
        <h2 className={styles.partnersTitle}>Официальные партнёры</h2>
        <div className={styles.partnersGrid}>
          {['Apple', 'Samsung', 'Xiaomi', 'ASUS', 'Sony', 'Lenovo'].map((p) => (
            <div key={p} className={styles.partner}>{p}</div>
          ))}
        </div>
      </section>

      {/* 🔹 Кнопка поднятия наверх (появляется при скролле) */}
      <ScrollToTop />

    </div>
  );
}