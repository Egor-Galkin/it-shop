'use client';
import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { FormField } from '@/components/ui/FormField/FormField';
import styles from '../page.module.scss';

export function PasswordTab() {
  const dispatch = useAppDispatch();
  
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passTouched, setPassTouched] = useState({ current: false, new: false, confirm: false });
  const [passErrors, setPassErrors] = useState({ current: '', new: '', confirm: '' });

  const handlePassBlur = (name: 'current' | 'new' | 'confirm') => {
    setPassTouched(p => ({ ...p, [name]: true }));
    validatePass(name, passForm[name]);
  };

  const handlePassChange = (name: 'current' | 'new' | 'confirm', val: string) => {
    setPassForm(p => ({ ...p, [name]: val }));
    if (passTouched[name]) validatePass(name, val);
  };

  const validatePass = (name: string, val: string) => {
    let err = '';
    if (val.trim().length === 0) err = 'Это поле обязательно для заполнения';
    else if (name === 'new' && val.length < 6) err = `Текст должен быть не короче 6 симв. Длина текста сейчас: ${val.length} симв.`;
    else if (name === 'confirm' && passForm.new && val !== passForm.new) err = 'Пароли не совпадают';
    setPassErrors(p => ({ ...p, [name]: err }));
  };

  const changePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassTouched({ current: true, new: true, confirm: true });
    validatePass('current', passForm.current);
    validatePass('new', passForm.new);
    validatePass('confirm', passForm.confirm);
    const hasErrors = Object.values(passErrors).some(err => err);
    if (hasErrors || !passForm.current.trim() || !passForm.new.trim() || !passForm.confirm.trim()) return;
    if (passForm.new !== passForm.confirm) { dispatch(toast.error('Пароли не совпадают')); return; }
    if (passForm.new.length < 6) { dispatch(toast.error('Минимум 6 символов')); return; }
    setPassLoading(true);
    try {
      await api.patch('/auth/password', { currentPassword: passForm.current, newPassword: passForm.new });
      setPassForm({ current: '', new: '', confirm: '' });
      setPassTouched({ current: false, new: false, confirm: false });
      setPassErrors({ current: '', new: '', confirm: '' });
      dispatch(toast.success('Пароль успешно изменён'));
    } catch (e: any) { 
      dispatch(toast.error(e.response?.data?.message || 'Ошибка смены пароля')); 
    } finally { 
      setPassLoading(false); 
    }
  };

  return (
    <div className={`${styles.card} ${styles.formCard}`}>
      <h2 className={styles.formTitle}>Смена пароля</h2>
      <form onSubmit={changePass} className={styles.passForm} noValidate>
        <FormField 
          label="Текущий пароль" name="current" type="password"
          value={passForm.current} onChange={e => handlePassChange('current', e.target.value)}
          onBlur={() => handlePassBlur('current')} required error={passErrors.current} touched={passTouched.current}
        />
        <FormField 
          label="Новый пароль" name="new" type="text"
          value={passForm.new} onChange={e => handlePassChange('new', e.target.value)}
          onBlur={() => handlePassBlur('new')} minLength={6} required error={passErrors.new} touched={passTouched.new}
        />
        <FormField 
          label="Подтвердите пароль" name="confirm" type="password"
          value={passForm.confirm} onChange={e => handlePassChange('confirm', e.target.value)}
          onBlur={() => handlePassBlur('confirm')} required error={passErrors.confirm} touched={passTouched.confirm}
        />
        <button type="submit" disabled={passLoading || Boolean(Object.values(passErrors).find(e => e)) || !passForm.current.trim() || !passForm.new.trim() || !passForm.confirm.trim()} className={styles.submitBtn}>
          {passLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}