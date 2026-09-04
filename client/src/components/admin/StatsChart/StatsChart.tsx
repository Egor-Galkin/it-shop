'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import styles from './StatsChart.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  label: string;
  value: number;
}

interface StatsChartProps {
  data: ChartData[];
  type: 'bar' | 'pie' | 'line';
  title?: string;
}

const BAR_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#1e40af', '#1e3a8a', '#f8fafc', '#0f172a'];
const PIE_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#1e40af', '#1e3a8a', '#f8fafc', '#0f172a'];
const LINE_COLOR = '#60a5fa';

const pieLegendConfig = {
  position: 'right' as const,
  onClick: () => {},
  labels: {
    color: '#a1a1aa',
    font: { 
      size: 12, 
      family: 'system-ui',
      weight: 'normal' as const,
    },
    padding: 20,
    boxWidth: 15,
    usePointStyle: true,
  },
};

const barOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: '#a1a1aa',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const value = context.parsed.y;
          const total = context.dataset.data.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${context.label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#a1a1aa', font: { size: 10 } },
      grid: { color: 'rgba(39, 39, 42, 0.3)' },
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#a1a1aa', font: { size: 10 }, stepSize: 1 },
      grid: { color: 'rgba(39, 39, 42, 0.3)' },
    },
  },
};

const pieOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: pieLegendConfig,
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: '#a1a1aa',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${context.label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

const lineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: '#a1a1aa',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: any) => `Значение: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { 
        color: '#a1a1aa', 
        font: { size: 10 },
        maxRotation: 45,
        minRotation: 45,
      },
      grid: { 
        color: 'rgba(39, 39, 42, 0.2)',
        drawTicks: false,
      },
    },
    y: {
      beginAtZero: true,
      min: 0,
      ticks: { 
        color: '#a1a1aa', 
        font: { size: 10 },
        stepSize: 1,
      },
      grid: { 
        color: 'rgba(39, 39, 42, 0.2)',
        drawTicks: false,
      },
    },
  },
  elements: {
    point: {
      radius: 5,
      hoverRadius: 7,
      backgroundColor: '#0f172a',
      borderColor: LINE_COLOR,
      borderWidth: 2,
      hitRadius: 10,
    },
    line: {
      borderColor: LINE_COLOR,
      backgroundColor: 'rgba(96, 165, 250, 0.15)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
    },
  },
};

export function StatsChart({ data, type, title }: StatsChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: title || '',
        data: data.map((d) => Number(d.value) || 0),
        backgroundColor: type === 'pie' ? PIE_COLORS : BAR_COLORS,
        borderColor: type === 'pie' ? '#0f172a' : undefined,
        borderWidth: type === 'pie' ? 2 : 0,
        ...(type === 'line' && {
          pointBackgroundColor: LINE_COLOR,
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }),
      },
    ],
  };

  if (data.length === 0) {
    return (
      <div className={styles.chartCard}>
        {title && <h3 className={styles.chartTitle}>{title}</h3>}
        <p className={styles.empty}>Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      {title && <h3 className={styles.chartTitle}>{title}</h3>}
      <div className={styles.chartWrapper}>
        {type === 'bar' && <Bar data={chartData} options={barOptions} />}
        {type === 'pie' && <Pie data={chartData} options={pieOptions} />}
        {type === 'line' && <Line data={chartData} options={lineOptions} />}
      </div>
    </div>
  );
}