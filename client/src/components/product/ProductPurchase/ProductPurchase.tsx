import { useState } from 'react';
import styles from './ProductPurchase.module.scss';

interface ProductPurchaseProps {
  price: number;
  finalPrice?: number;
  onAddToCart: (quantity: number, unitPrice: number) => void;
}

export function ProductPurchase({ price, finalPrice, onAddToCart }: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const unitPrice = finalPrice && finalPrice < price ? finalPrice : price;
  const total = unitPrice * quantity;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await onAddToCart(quantity, unitPrice);
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <div className={styles.purchaseWrap}>
      <div className={styles.purchaseControls}>
        <div className={styles.qtyControl}>
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
            className={styles.qtyBtn} 
            type="button"
            disabled={isAdding}
          >
            −
          </button>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))} 
            onBlur={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} 
            className={styles.qtyInput} 
            min="1"
            disabled={isAdding}
          />
          <button 
            onClick={() => setQuantity(q => q + 1)} 
            className={styles.qtyBtn} 
            type="button"
            disabled={isAdding}
          >
            +
          </button>
        </div>
        <div className={styles.totalBlock}>
          <span>Итого:</span>
          <strong>{total.toLocaleString('ru-RU')} ₽</strong>
        </div>
      </div>
      <div className={styles.purchaseAction}>
        <button 
          onClick={handleAddToCart} 
          className={`${styles.addToCartBtn} ${isAdding ? styles.added : ''}`} 
          type="button"
          disabled={isAdding}
        >
          {isAdding ? '✓ В корзине' : 'В корзину'}
        </button>
      </div>
    </div>
  );
}