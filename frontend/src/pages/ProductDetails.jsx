import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { formatCurrency, getProductImage } from "../utils/catalog";

const ProductDetails = () => {
  const { code } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/saree/${code}`);
        setProduct(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProduct();
  }, [code]);

  if (!product) {
    return <h2>Loading...</h2>;
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
