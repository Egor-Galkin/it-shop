'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/store/slices/toast.slice';
import { api } from '@/lib/axios';
import { StatsChart } from '@/components/admin/StatsChart/StatsChart';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { Loader } from '@/components/ui/Loader/Loader';
import { generateStatsReportPDF } from '@/lib/pdf/stats-report';
import styles from '../page.module.scss';

type StatsView = 'by-type' | 'by-brand' | 'by-users' | 'by-orders' | 'by-delivery';
type ChartView = 'bar' | 'pie';
type DatePreset = 'week' | 'month' | 'year' | 'custom' | 'all-time';

const getDateRange = (preset: DatePreset) => {
  const now = new Date();
  const start = new Date();
  
  switch (preset) {
    case 'week': start.setDate(now.getDate() - 7); break;
    case 'month': start.setDate(1); break;
    case 'year': start.setMonth(0, 1); break;
    case 'all-time': 
      return { start: '', end: '' };
    default: start.setDate(now.getDate() - 30); break;
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  };
};

export function StatsTab() {
  const dispatch = useAppDispatch();
  
  const [statsView, setStatsView] = useState<StatsView>('by-type');
  const [chartType, setChartType] = useState<ChartView>('bar');
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [distLoading, setDistLoading] = useState(false);
  
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [types, setTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]); // ✅ Список вариантов доставки
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all'); // ✅ Фильтр по доставке для графика

  const [datePreset, setDatePreset] = useState<DatePreset>('month');
  const [dateRange, setDateRange] = useState(() => getDateRange('month'));
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const { start: startDate, end: endDate } = dateRange;

  // ✅ Загрузка справочников (типы, бренды, варианты доставки)
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [tRes, bRes, dRes] = await Promise.all([
          api.get('/types'), 
          api.get('/brands'),
          api.get('/delivery-options/client/available')
        ]);
        setTypes(tRes.data);
        setBrands(bRes.data);
        setDeliveryOptions(dRes.data);
      } catch (e) { console.error('Failed to load refs', e); }
    };
    loadRefs();
  }, []);

  useEffect(() => { loadSummary(); }, []);
  
  useEffect(() => { loadDistributionData(); }, [statsView, filterEntity, startDate, endDate]);
  useEffect(() => { loadTimelineData(); }, [statsView, startDate, endDate, filterEntity, deliveryFilter]);

  useEffect(() => {
    if (datePreset === 'all-time') {
      loadAllTimeRange();
    }
  }, [datePreset, statsView]);

  const loadAllTimeRange = async () => {
    try {
      const endpoint = statsView === 'by-users' 
        ? '/basket/admin/stats/date-range/users'
        : '/basket/admin/stats/date-range/orders';
      
      const { data } = await api.get(endpoint);
      
      if (data.start && data.end) {
        setDateRange({ start: data.start, end: data.end });
      }
    } catch (e: any) {
      console.error('Failed to load all-time range:', e);
      setDateRange(getDateRange('year'));
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await api.get('/basket/admin/stats/dashboard');
      setSummary(data);
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка загрузки статистики'));
    } finally { setSummaryLoading(false); }
  };

  const loadDistributionData = async () => {
    setDistLoading(true);
    try {
      const endpoints: Record<StatsView, string> = {
        'by-type': '/basket/admin/stats/by-type',
        'by-brand': '/basket/admin/stats/by-brand',
        'by-users': '/basket/admin/stats/by-users',
        'by-orders': '/basket/admin/stats/by-orders',
        'by-delivery': '/basket/admin/stats/by-delivery' // ✅ Новый эндпоинт
      };
      
      const params: any = {};
      
      const isAllTime = datePreset === 'all-time';
      const needsDates = (statsView === 'by-type' || statsView === 'by-brand') && !isAllTime;
      
      if (needsDates && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
        if (filterEntity !== 'all') {
          params[statsView === 'by-type' ? 'typeId' : 'brandId'] = filterEntity;
        }
      }
      
      const { data } = await api.get(endpoints[statsView], { params });
      setDistributionData(data || []);
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка загрузки данных'));
      setDistributionData([]);
    } finally { setDistLoading(false); }
  };

  const loadTimelineData = async () => {
    setTimelineLoading(true);
    try {
      // ✅ Для by-delivery используем отдельный эндпоинт
      if (statsView === 'by-delivery') {
        const params: any = {};
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        if (deliveryFilter !== 'all') {
          params.deliveryOptionId = deliveryFilter;
        }
        
        const { data } = await api.get('/basket/admin/stats/timeline-by-delivery', { params });
        const formatted = data.map((item: any) => ({ label: item.date, value: Number(item.value) || 0 }));
        setTimelineData(formatted);
        return;
      }

      const typeMap: Record<StatsView, 'types' | 'brands' | 'users' | 'orders'> = {
        'by-type': 'types',
        'by-brand': 'brands',
        'by-users': 'users',
        'by-orders': 'orders',
        'by-delivery': 'orders' // не используется
      };
      
      const apiType = typeMap[statsView];
      const filterId = (statsView === 'by-type' || statsView === 'by-brand') && filterEntity !== 'all' 
        ? +filterEntity 
        : undefined;

      const params: any = { type: apiType };
      
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (filterId !== undefined) {
        params.filterId = filterId;
      }

      const { data } = await api.get('/basket/admin/stats/timeline', { params });
      
      const formatted = data.map((item: any) => ({ label: item.date, value: Number(item.value) || 0 }));
      setTimelineData(formatted);
    } catch (e: any) {
      dispatch(toast.error(e.response?.data?.message || 'Ошибка загрузки графика'));
      setTimelineData([]);
    } finally { setTimelineLoading(false); }
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'all-time') {
      setDateRange(getDateRange(preset));
    }
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (datePreset === 'all-time') {
      setDatePreset('custom');
    }
    setDateRange(prev => {
      const newRange = { ...prev, [field]: value };
      if (field === 'start' && value > newRange.end) newRange.end = value;
      if (field === 'end' && value < newRange.start) newRange.start = value;
      return newRange;
    });
  };

  const getDistributionTitle = () => {
    switch (statsView) {
      case 'by-type':
        return filterEntity === 'all' ? 'Распределение продаж по типам устройств' : `Продажи типа: ${types.find(t => t.id === +filterEntity)?.name || ''}`;
      case 'by-brand':
        return filterEntity === 'all' ? 'Распределение продаж по брендам' : `Продажи бренда: ${brands.find(b => b.id === +filterEntity)?.name || ''}`;
      case 'by-users':
        return 'Распределение пользователей по количеству покупок (за всё время)';
      case 'by-orders':
        return 'Распределение заказов по общей сумме (за всё время)';
      case 'by-delivery':
        return 'Распределение заказов по способу получения';
      default: return '';
    }
  };

  const getTimelineTitle = () => {
    const deliveryName = deliveryFilter !== 'all' 
      ? deliveryOptions.find(o => o.id === +deliveryFilter)?.name 
      : null;
      
    switch (statsView) {
      case 'by-type':
        return filterEntity === 'all' ? 'Продажи типов по датам' : `Продажи типа по датам: ${types.find(t => t.id === +filterEntity)?.name || ''}`;
      case 'by-brand':
        return filterEntity === 'all' ? 'Продажи брендов по датам' : `Продажи бренда по датам: ${brands.find(b => b.id === +filterEntity)?.name || ''}`;
      case 'by-users':
        return 'Регистрации пользователей по датам';
      case 'by-orders':
        return 'Количество заказов по датам';
      case 'by-delivery':
        return deliveryName 
          ? `Заказы со способом "${deliveryName}" по датам`
          : 'Все заказы по способам получения по датам';
      default: return '';
    }
  };

  const showEntityFilter = statsView === 'by-type' || statsView === 'by-brand';
  const showDeliveryFilter = statsView === 'by-delivery'; // ✅ Показывать фильтр доставки только для by-delivery

  const handleGenerateReport = async () => {
    if (!summary) {
      toast.error('Данные ещё не загружены');
      return;
    }
    
    try {
      await generateStatsReportPDF({
        summary,
        distributionData,
        timelineData,
        distributionTitle: getDistributionTitle(),
        timelineTitle: getTimelineTitle(),
        period: { 
          start: startDate, 
          end: endDate, 
          preset: datePreset 
        },
        chartType,
        statsView
      });
      toast.success('Отчёт сформирован');
    } catch (err: any) {
      console.error('Ошибка генерации отчёта:', err);
      toast.error('Не удалось сформировать отчёт');
    }
  };

  return (
    <div className={styles.statsContainer}>
      {summaryLoading ? (
        <Loader text="Загрузка..." size="medium" />
      ) : summary && (
        <div className={styles.summaryContainer}>
          <div className={styles.dashboardGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{summary.totalUsers}</span>
              <span className={styles.statLabel}>Всего клиентов</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.positive}`}>+{summary.newUsersWeek}</span>
              <span className={styles.statLabel}>За неделю</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{summary.totalOrders}</span>
              <span className={styles.statLabel}>Заказов</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{(summary.revenue / 1000).toFixed(1)}K ₽</span>
              <span className={styles.statLabel}>Выручка</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsControls}>
        <div className={styles.controlGroup}>
          <label>Статистика:</label>
          <CustomSelect
            options={[
              { value: 'by-type', label: 'По типам' },
              { value: 'by-brand', label: 'По брендам' },
              { value: 'by-users', label: 'По пользователям' },
              { value: 'by-orders', label: 'По заказам' },
              { value: 'by-delivery', label: 'По доставкам' } // ✅ Новая опция
            ]}
            value={statsView}
            onChange={(val) => setStatsView(val as StatsView)}
          />
        </div>
        
        <div className={styles.chartToggles}>
          <button className={`${styles.toggleBtn} ${chartType === 'bar' ? styles.toggleActive : ''}`} onClick={() => setChartType('bar')}>Столбцы</button>
          <button className={`${styles.toggleBtn} ${chartType === 'pie' ? styles.toggleActive : ''}`} onClick={() => setChartType('pie')}>Круг</button>
        </div>

        <button 
          onClick={handleGenerateReport}
          className={styles.reportBtn}
          type="button"
          disabled={distLoading || timelineLoading}
        >
          Отчёт
        </button>
      </div>

      <div className={styles.chartWrapper}>
        {distLoading ? (
          <Loader text="Загрузка диаграммы..." size="small" />
        ) : (
          <StatsChart data={distributionData} type={chartType} title={getDistributionTitle()} />
        )}
      </div>

      <div className={styles.dateRangeMenu}>
        {showEntityFilter && (
          <div className={styles.controlGroup}>
            <label>{statsView === 'by-type' ? 'Фильтр типа:' : 'Фильтр бренда:'}</label>
            <CustomSelect
              options={[
                { value: 'all', label: 'Все' },
                ...(statsView === 'by-type' 
                  ? types.map((t: any) => ({ value: String(t.id), label: t.name }))
                  : brands.map((b: any) => ({ value: String(b.id), label: b.name }))
                )
              ]}
              value={filterEntity}
              onChange={setFilterEntity}
            />
          </div>
        )}

        {/* ✅ Фильтр по способу доставки для графика */}
        {showDeliveryFilter && (
          <div className={styles.controlGroup}>
            <label>Тип доставки:</label>
            <CustomSelect
              options={[
                { value: 'all', label: 'Все способы' },
                ...deliveryOptions.map((o: any) => ({ 
                  value: String(o.id), 
                  label: o.name 
                }))
              ]}
              value={deliveryFilter}
              onChange={setDeliveryFilter}
            />
          </div>
        )}

        <div className={styles.controlGroup}>
          <label>Период:</label>
          <CustomSelect
            options={[
              { value: 'week', label: 'За неделю' },
              { value: 'month', label: 'За месяц' },
              { value: 'year', label: 'За год' },
              { value: 'all-time', label: 'За весь период' },
              { value: 'custom', label: 'Диапазон' }
            ]}
            value={datePreset}
            onChange={(val) => handleDatePresetChange(val as DatePreset)}
          />
        </div>

        <div className={styles.dateRange}>
          <DatePicker 
            label="" 
            value={startDate} 
            onChange={(val) => handleDateChange('start', val)}
            maxDate={endDate}
            disabled={datePreset !== 'custom' && datePreset !== 'all-time'}
          />
          <span className={styles.dateSeparator}>—</span>
          <DatePicker 
            label="" 
            value={endDate} 
            onChange={(val) => handleDateChange('end', val)}
            minDate={startDate}
            disabled={datePreset !== 'custom' && datePreset !== 'all-time'}
          />
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {timelineLoading ? (
          <Loader text="Загрузка графика..." size="small" />
        ) : (
          <StatsChart data={timelineData} type="line" title={getTimelineTitle()} />
        )}
      </div>
    </div>
  );
}