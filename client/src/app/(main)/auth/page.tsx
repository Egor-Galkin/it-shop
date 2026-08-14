'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, setLoading, setError } from '@/store/slices/auth.slice';
import { api } from '@/lib/axios';
import { FormField } from '@/components/ui/FormField/FormField';
import styles from './page.module.scss';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error: authError } = useAppSelector((s) => s.auth);

  // ✅ Исправленная валидация: проверяем пустые required поля
  const validateField = (name: 'email' | 'password', value: string, required = true) => {
    let err = '';
    
    // 1. Проверка на пустоту для required полей
    if (required && value.trim().length === 0) {
      err = 'Это поле обязательно для заполнения';
    }
    // 2. Проверка формата email
    else if (name === 'email' && value.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        err = 'Введите корректный email';
      }
    }
    // 3. Проверка длины пароля
    else if (name === 'password' && value.length > 0) {
      if (value.length < 6) {
        err = `Текст должен быть не короче 6 симв. Длина текста сейчас: ${value.length} симв.`;
      }
    }
    
    setErrors(p => ({ ...p, [name]: err }));
    return !err;
  };

  const handleBlur = (name: 'email' | 'password') => {
    setTouched(p => ({ ...p, [name]: true }));
    validateField(name, name === 'email' ? email : password);
  };

  const handleChange = (name: 'email' | 'password', value: string) => {
    if (name === 'email') setEmail(value);
    else setPassword(value);
    // Если поле уже было "тронуто", валидируем в реальном времени
    if (touched[name]) validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Помечаем все поля как "тронутые" при сабмите
    setTouched({ email: true, password: true });
    
    // ✅ Запускаем валидацию для всех полей
    const emailValid = validateField('email', email);
    const passValid = validateField('password', password);
    
    // ✅ Блокируем отправку при ошибках
    if (!emailValid || !passValid) return;
    
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, { email, password });

      // Сохраняем токен в localStorage СРАЗУ, до любых других действий
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('[Login] Token saved to localStorage');
      }

      dispatch(setCredentials(data));

      await new Promise(resolve => setTimeout(resolve, 150));

      router.push('/');
      router.refresh();
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Произошла ошибка'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const hasErrors = Boolean(errors.email || errors.password);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isLogin ? 'Авторизация' : 'Регистрация'}</h1>
        {authError && <div className={styles.error}>{authError}</div>}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <FormField 
            label="Email" 
            name="email" 
            type="email"
            value={email} 
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="example@email.com"
            required
            error={errors.email}
            touched={touched.email}
            autoComplete="email"
            disabled={isLoading}
          />
          <FormField 
            label="Пароль" 
            name="password" 
            type="password"
            value={password} 
            onChange={e => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Минимум 6 символов"
            required
            minLength={6}
            error={errors.password}
            touched={touched.password}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || hasErrors} className={styles.submitBtn}>
            {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        <div className={styles.toggle}>
          {isLogin ? 'Нет аккаунта? ' : 'Есть аккаунт? '}
          <button 
            type="button" 
            onClick={() => { 
              setIsLogin(!isLogin); 
              dispatch(setError(null));
              setTouched({ email: false, password: false });
              setErrors({ email: '', password: '' });
            }}
            className={styles.toggleBtn}
          >
            {isLogin ? 'Зарегистрируйтесь' : 'Авторизуйтесь'}
          </button>
        </div>
      </div>
    </div>
  );
}