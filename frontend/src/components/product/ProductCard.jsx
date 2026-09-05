import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getAssetUrl } from '../../api/axiosConfig';

const ProductCard = ({ product }) => {
  const { _id, name, price, images, stock, discount, category, description } = product;
  const imageUrl = images?.length ? getAssetUrl(images[0].url) : '/placeholder.png';
  const discountedPrice = price * (1 - discount / 100);
  const categoryName = typeof category === 'object' ? category?.name : category;
  const { addToCart } = useCart();

  const handleAddToCart = (event) => {
    event.preventDefault();
    if (stock > 0) addToCart(_id, 1, product);
  };

  return (
    <div className="prod-card">
      <Link to={`/product/${_id}`}>
        <div className="prod-img peep-shop-product-image">
          {images?.length ? <img src={imageUrl} alt={name} /> : <i className="ti ti-device-laptop"></i>}
          {discount > 0 && <span className="peep-product-deal-badge">Deal -{discount}%</span>}
        </div>
        <div className="prod-info">
          <div className="prod-brand">{product.tab || categoryName || 'Technology'}</div>
          <h3 className="prod-name">{name}</h3>
          <p className="prod-spec">{description || 'Quality tech at a competitive price.'}</p>
          <div className="prod-bottom">
            <div>
              <span className="prod-price">GHS {discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              {discount > 0 && <span className="prod-old">GHS {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
            </div>
            <div className="peep-product-actions">
              <span className={`peep-shop-stock ${stock > 0 ? 'in-stock' : ''}`}>{stock > 0 ? 'In stock' : 'Out of stock'}</span>
              <button type="button" className="prod-cart" onClick={handleAddToCart} disabled={stock === 0} aria-label={`Add ${name} to cart`} title="Add to cart">
                <i className="ti ti-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;