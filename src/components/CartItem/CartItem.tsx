import { useAppDispatch } from "../../store/hooks";
import { removeItem, updateQuantity } from "../../store/slices/cartSlice";
import type { CartItem as CartItemType } from "../../types/cart";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const dispatch = useAppDispatch();

  const handleDecrease = () => {
    if (item.quantity === 1) {
      dispatch(removeItem(item.id));
    } else {
      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleRemove = () => {
    dispatch(removeItem(item.id));
  };

  const lineTotal = item.price * item.quantity;

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.unitPrice}>
          {item.price.toLocaleString("tr-TR")} ₺
        </span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.quantityButton}
          onClick={handleDecrease}
          aria-label="Miktarı azalt"
        >
          −
        </button>
        <span className={styles.quantity} aria-live="polite">
          {item.quantity}
        </span>
        <button
          type="button"
          className={styles.quantityButton}
          onClick={handleIncrease}
          aria-label="Miktarı artır"
        >
          +
        </button>
      </div>

      <div className={styles.lineTotal}>
        {lineTotal.toLocaleString("tr-TR")} ₺
      </div>

      <button
        type="button"
        className={styles.removeButton}
        onClick={handleRemove}
        aria-label={`${item.name} ürününü sepetten kaldır`}
      >
        Kaldır
      </button>
    </li>
  );
};

export default CartItem;
