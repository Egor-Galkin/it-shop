import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateReceiptPDF(order: any): Promise<void> {
  // ✅ Создаём простой HTML-шаблон чека (без React-компонентов)
  const receiptHTML = buildReceiptHTML(order);
  
  // ✅ Создаём контейнер с правильными стилями для html2canvas
  const container = document.createElement('div');
  container.innerHTML = receiptHTML;
  container.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 350px;
    padding: 24px;
    background: #fff;
    color: #1a1a1a;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    box-sizing: border-box;
    z-index: -9999;
    pointer-events: none;
    visibility: visible;
  `;
  
  document.body.appendChild(container);
  
  try {
    // ✅ Ждём, пока браузер отрендерит контент
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // ✅ Конвертируем в canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      allowTaint: true,
      foreignObjectRendering: true
    });
    
    // ✅ Проверяем, что canvas не пустой
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas is empty');
    }
    
    // ✅ Создаём PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });
    
    const imgWidth = 80;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`receipt_${order.id}.pdf`);
    
  } finally {
    // ✅ Очищаем контейнер
    container.remove();
  }
}

// ✅ Вспомогательная функция для генерации HTML чека
function buildReceiptHTML(order: any): string {
  const orderDate = new Date(order.paidAt);
  const formattedDate = orderDate.toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  
  const total = order.total || order.devices?.reduce((sum: number, d: any) => {
    const price = d.paidPrice || d.device?.price;
    return sum + price * d.quantity;
  }, 0) || 0;
  
  const itemsHTML = order.devices?.map((item: any) => {
    const price = item.paidPrice || item.device?.price;
    const sum = price * item.quantity;
    return `
      <tr>
        <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.device?.name || 'Товар'}</td>
        <td style="text-align:right;white-space:nowrap;">${item.quantity}</td>
        <td style="text-align:right;white-space:nowrap;">${price.toLocaleString('ru-RU')} ₽</td>
        <td style="text-align:right;white-space:nowrap;font-weight:600;">${sum.toLocaleString('ru-RU')} ₽</td>
      </tr>
    `;
  }).join('') || '';
  
  const deliveryInfo = order.deliveryOption ? `
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-top:4px;">
      <span>Способ получения:</span>
      <strong style="color:#1a1a1a;margin-left:8px;">${order.deliveryOption.name}</strong>
    </div>
    ${order.deliveryOption.type === 'DELIVERY' && order.deliveryOption.price ? `
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-top:4px;">
      <span>Доставка:</span>
      <strong style="color:#1a1a1a;margin-left:8px;">${Number(order.deliveryOption.price).toLocaleString('ru-RU')} ₽</strong>
    </div>
    ` : ''}
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-top:4px;">
      <span>Статус:</span>
      <strong style="color:#1a1a1a;margin-left:8px;">
        ${order.deliveryOption.type === 'PICKUP' 
          ? (order.deliveredAt ? 'Получен' : 'Ожидает выдачи')
          : (order.deliveredAt ? 'Доставлен' : 'В пути')}
      </strong>
    </div>
  ` : '';
  
  return `
    <div style="width:100%;box-sizing:border-box;">
      <!-- Шапка -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px dashed #333;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;font-weight:700;color:#3b82f6;">ITshop</span>
        </div>
        <div style="text-align:right;font-size:12px;color:#666;">
          <p style="margin:2px 0;">Чек № <strong>${order.id}</strong></p>
          <p style="margin:2px 0;">${formattedDate}</p>
        </div>
      </div>
      
      <!-- Информация о заказе -->
      <div style="margin-bottom:16px;">
        <h3 style="font-size:14px;margin:0 0 8px;color:#333;border-bottom:1px solid #eee;padding-bottom:4px;">Информация о заказе</h3>
        ${deliveryInfo}
      </div>
      
      <!-- Товары -->
      <div style="margin-bottom:16px;">
        <h3 style="font-size:14px;margin:0 0 8px;color:#333;border-bottom:1px solid #eee;padding-bottom:4px;">Товары</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 2px;color:#666;font-weight:600;border-bottom:1px solid #ddd;">Товар</th>
              <th style="text-align:right;padding:6px 2px;color:#666;font-weight:600;border-bottom:1px solid #ddd;white-space:nowrap;">Кол-во</th>
              <th style="text-align:right;padding:6px 2px;color:#666;font-weight:600;border-bottom:1px solid #ddd;white-space:nowrap;">Цена</th>
              <th style="text-align:right;padding:6px 2px;color:#666;font-weight:600;border-bottom:1px solid #ddd;white-space:nowrap;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
      
      <!-- Итого -->
      <div style="padding-top:16px;border-top:2px dashed #333;text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:16px;margin-bottom:12px;">
          <span>Итого:</span>
          <strong style="color:#3b82f6;font-size:18px;">${total.toLocaleString('ru-RU')} ₽</strong>
        </div>
        <p style="font-size:11px;color:#777;margin:4px 0;">Спасибо за покупку!</p>
        <p style="font-size:11px;color:#777;margin:4px 0;">ITshop © ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
}