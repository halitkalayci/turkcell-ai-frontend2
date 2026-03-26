import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProducts } from "../../store/slices/productSlice";
import {
  selectProducts,
  selectProductsLoading,
  selectProductsError,
} from "../../store/slices/productSlice";
import ProductCard from "../../components/ProductCard";
import HeroBanner from "../../components/HeroBanner";
import styles from "./ProductsPage.module.css";

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const isLoading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (isLoading) return <p className={styles.status}>Yükleniyor...</p>;
  if (error) return <p className={styles.status}>Hata: {error}</p>;

  return (
    <>
      <HeroBanner />
      <main className={styles.page}>
      <h2 className={styles.title}>Ürünler</h2>
      <ul className={styles.list}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      </main>
    </>
  );
};

export default ProductsPage;
