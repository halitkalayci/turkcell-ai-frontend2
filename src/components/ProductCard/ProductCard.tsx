import { useAppDispatch } from "../../store/hooks";
import { addItem } from "../../store/slices/cartSlice";
import type { Product } from "../../types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addItem({ id: product.id, name: product.name, price: product.price }));
  };

  return (
    <article className={styles.card}>
      <span className={styles.id}>#{product.id}</span>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>{product.price.toLocaleString("tr-TR")} ₺</p>
      <button
        type="button"
        className={styles.addButton}
        onClick={handleAddToCart}
      >
        Sepete Ekle
      </button>
    </article>
  );
};

export default ProductCard;
