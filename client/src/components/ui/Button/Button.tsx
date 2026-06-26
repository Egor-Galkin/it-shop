'use client';
import { FC, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
}

export const Button: FC<Props> = ({ children, variant = 'primary', isLoading, className, ...props }) => (
  <button className={clsx(styles.btn, styles[variant], isLoading && styles.loading, className)} {...props}>
    {isLoading ? <span className={styles.spinner} /> : children}
  </button>
);