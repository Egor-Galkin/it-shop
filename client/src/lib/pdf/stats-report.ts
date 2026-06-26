import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StatsReportData {
  summary: any;
  distributionData: any[];
  timelineData: any[];
  distributionTitle: string;
  timelineTitle: string;
  period: { start: string; end: string; preset: string };
  chartType: 'bar' | 'pie';
  statsView: string;
}

export async function generateStatsReportPDF(data: StatsReportData): Promise<void> {
  const reportHTML = buildReportHTML(data);
  
  const container = document.createElement('div');
  container.innerHTML = reportHTML;
  container.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 800px;
    padding: 40px;
    background: #fff;
    color: #1a1a1a;
    font-family: 'Segoe UI', Tahoma, sans-serif;
    box-sizing: border-box;
    z-index: -9999;
    pointer-events: none;
    visibility: visible;
  `;
  
  document.body.appendChild(container);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      allowTaint: true,
      foreignObjectRendering: true
    });
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas is empty');
    }
    
    const imgData = canvas.toDataURL('image/png');
    
    // A4 формат
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = 210; // A4 ширина в мм
    const pdfHeight = 297; // A4 высота в мм
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;
    
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Если отчёт длиннее одной страницы — разбиваем на части
    let position = margin;
    let remainingHeight = imgHeight;
    let page = 0;
    
    while (remainingHeight > 0) {
      if (page > 0) {
        pdf.addPage();
      }
      
      const sourceY = page * (pdfHeight - margin * 2) * (canvas.width / contentWidth);
      const sliceHeight = Math.min(
        (pdfHeight - margin * 2) * (canvas.width / contentWidth),
        canvas.height - sourceY
      );
      
      // Создаём canvas для текущей страницы
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const pageImg = pageCanvas.toDataURL('image/png');
        const pageImgHeight = (sliceHeight * contentWidth) / canvas.width;
        pdf.addImage(pageImg, 'PNG', margin, margin, contentWidth, pageImgHeight);
      }
      
      remainingHeight -= (pdfHeight - margin * 2);
      page++;
      
      // Защита от бесконечного цикла
      if (page > 20) break;
    }
    
    const dateStr = new Date().toLocaleDateString('ru-RU');
    pdf.save(`stats-report_${data.statsView}_${dateStr.replace(/\./g, '-')}.pdf`);
    
  } finally {
    container.remove();
  }
}

function buildReportHTML(data: StatsReportData): string {
  const { summary, distributionData, timelineData, distributionTitle, timelineTitle, period, statsView } = data;
  
  const periodLabel = period.preset === 'all-time' 
    ? 'За весь период' 
    : period.preset === 'custom'
      ? `${period.start} — ${period.end}`
      : period.preset === 'week' ? 'За неделю'
      : period.preset === 'month' ? 'За месяц'
      : period.preset === 'year' ? 'За год' : '';
  
  const viewLabel: Record<string, string> = {
    'by-type': 'По типам',
    'by-brand': 'По брендам',
    'by-users': 'По пользователям',
    'by-orders': 'По заказам',
    'by-delivery': 'По доставкам'
  };
  
  // Максимальное значение для нормализации баров
  const maxDistValue = Math.max(...distributionData.map(d => d.value), 1);
  const maxTimeValue = Math.max(...timelineData.map(d => d.value), 1);
  
  const distRows = distributionData.map((item, idx) => {
    const percent = (item.value / maxDistValue) * 100;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    const color = colors[idx % colors.length];
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500;">${item.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;width:40%;">
          <div style="background:#f0f0f0;border-radius:4px;overflow:hidden;height:20px;position:relative;">
            <div style="background:${color};height:100%;width:${percent}%;transition:width 0.3s;"></div>
          </div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#1a1a1a;">${item.value}</td>
      </tr>
    `;
  }).join('');
  
  // Для таймлайна показываем только последние 30 точек (чтобы не растягивать)
  const timelineToShow = timelineData.slice(-30);
  const timeRows = timelineToShow.map(item => {
    const percent = (item.value / maxTimeValue) * 100;
    return `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#666;">${item.label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f5f5f5;width:50%;">
          <div style="background:#f0f0f0;border-radius:3px;overflow:hidden;height:14px;">
            <div style="background:#3b82f6;height:100%;width:${percent}%;"></div>
          </div>
        </td>
        <td style="padding:6px 12px;border-bottom:1px solid #f5f5f5;text-align:right;font-weight:600;font-size:13px;">${item.value}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div style="width:100%;box-sizing:border-box;">
      <!-- Шапка отчёта -->
      <div style="border-bottom:3px solid #3b82f6;padding-bottom:20px;margin-bottom:30px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="margin:0;font-size:28px;color:#1a1a1a;font-weight:700;">Отчёт по статистике</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#666;">ITshop • Аналитика продаж</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;font-size:13px;color:#666;">Дата формирования:</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1a1a1a;">${new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:24px;font-size:13px;">
          <div><span style="color:#666;">Тип статистики:</span> <strong style="color:#3b82f6;">${viewLabel[statsView] || statsView}</strong></div>
          <div><span style="color:#666;">Период:</span> <strong>${periodLabel}</strong></div>
        </div>
      </div>
      
      <!-- Сводка -->
      ${summary ? `
      <div style="margin-bottom:30px;">
        <h2 style="font-size:18px;margin:0 0 16px;color:#1a1a1a;border-left:4px solid #3b82f6;padding-left:12px;">Общие показатели</h2>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Всего клиентов</div>
            <div style="font-size:24px;font-weight:700;color:#1a1a1a;margin-top:8px;">${summary.totalUsers}</div>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">За неделю</div>
            <div style="font-size:24px;font-weight:700;color:#16a34a;margin-top:8px;">+${summary.newUsersWeek}</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Заказов</div>
            <div style="font-size:24px;font-weight:700;color:#1a1a1a;margin-top:8px;">${summary.totalOrders}</div>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Выручка</div>
            <div style="font-size:24px;font-weight:700;color:#3b82f6;margin-top:8px;">${(summary.revenue / 1000).toFixed(1)}K ₽</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- Распределение -->
      <div style="margin-bottom:30px;">
        <h2 style="font-size:18px;margin:0 0 16px;color:#1a1a1a;border-left:4px solid #10b981;padding-left:12px;">${distributionTitle}</h2>
        ${distributionData.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 12px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e5e7eb;">Название</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e5e7eb;">Распределение</th>
              <th style="padding:10px 12px;text-align:right;font-weight:600;color:#666;border-bottom:2px solid #e5e7eb;">Значение</th>
            </tr>
          </thead>
          <tbody>
            ${distRows}
          </tbody>
        </table>
        ` : '<p style="color:#999;font-style:italic;">Нет данных для отображения</p>'}
      </div>
      
      <!-- Таймлайн -->
      <div style="margin-bottom:30px;">
        <h2 style="font-size:18px;margin:0 0 16px;color:#1a1a1a;border-left:4px solid #f59e0b;padding-left:12px;">${timelineTitle}</h2>
        ${timelineToShow.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e5e7eb;">Дата</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e5e7eb;">График</th>
              <th style="padding:8px 12px;text-align:right;font-weight:600;color:#666;border-bottom:2px solid #e5e7eb;">Значение</th>
            </tr>
          </thead>
          <tbody>
            ${timeRows}
          </tbody>
        </table>
        ${timelineData.length > 30 ? `<p style="margin-top:8px;font-size:12px;color:#999;font-style:italic;">* Показаны последние 30 точек из ${timelineData.length}</p>` : ''}
        ` : '<p style="color:#999;font-style:italic;">Нет данных для отображения</p>'}
      </div>
      
      <!-- Футер -->
      <div style="margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;text-align:center;color:#999;font-size:12px;">
        <p style="margin:0;">ITshop © ${new Date().getFullYear()} • Автоматически сгенерированный отчёт</p>
      </div>
    </div>
  `;
}