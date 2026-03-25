import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCart } from "../../store/slices/cartSlice";
import {
  selectCartItems,
  selectCartItemCount,
  selectCartTotal,
} from "../../store/slices/cartSlice";
import CartItem from "../../components/CartItem";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const total = useAppSelector(selectCartTotal);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <h2 className={styles.title}>Sepetim</h2>
        <p className={styles.emptyMessage}>Sepetiniz boş.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h2 className={styles.title}>
        Sepetim{" "}
        <span className={styles.itemCount}>({itemCount} ürün)</span>
      </h2>

      <ul className={styles.itemList}>
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </ul>

      <div className={styles.summary}>
        <div className={styles.totalRow}>
          <span>Toplam</span>
          <span className={styles.totalPrice}>
            {total.toLocaleString("tr-TR")} ₺
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearCart}
          >
            Sepeti Temizle
          </button>
          <button type="button" className={styles.checkoutButton}>
            Satın Al
          </button>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
