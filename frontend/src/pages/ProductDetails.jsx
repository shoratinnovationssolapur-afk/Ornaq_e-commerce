import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";
import { formatCurrency, getProductImage } from "../utils/catalog";

const ProductDetails = () => {
  const { code } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const res = await api.get(`/products/saree/${encodeURIComponent(code)}`);
        setProduct(res.data);
      } catch (error) {
        console.log(error);
        setProduct(null);
        setErrorMessage(getApiErrorMessage(error, "No saree found for this code."));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [code]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!product) {
    return <h2>{errorMessage || "No saree found for this code."}</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <img src={getProductImage(product)} alt={product.name} width="300" />

      <h1>{product.name}</h1>

      <h2>{formatCurrency(product.price)}</h2>

      <h3>Saree Code: {product.sareeCode}</h3>

      {product.youtubeLink && (
        <a href={product.youtubeLink} target="_blank" rel="noreferrer">
          Watch Video
        </a>
      )}
    </div>
  );
};

export default ProductDetails;
