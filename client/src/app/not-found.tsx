import Link from 'next/link';
import styles from './not-found.module.scss';

export const metadata = {
  title: 'Страница не найдена | ITshop',
};

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Страница не найдена</h2>
        <p className={styles.description}>
          Возможно, страница была удалена, перемещена или вы ввели неверный адрес.
        </p>
        <Link href="/" className={styles.backBtn}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}