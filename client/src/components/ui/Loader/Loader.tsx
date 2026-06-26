'use client';
import styles from './Loader.module.scss';

interface LoaderProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export function Loader({ text = 'Загрузка...', size = 'medium', fullScreen = false }: LoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[size]} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}