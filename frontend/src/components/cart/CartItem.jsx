import { useCart } from '../../context/CartContext';
import { getAssetUrl } from '../../api/axiosConfig';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();
  const { product, quantity, price } = item;

  const handleQuantityChange = (e) => {
    const newQty = parseInt(e.target.value);
    if (newQty > 0) updateCartItem(product._id, newQty);
  };

  return (
    <article className="peep-cart-item">
      <img
        src={product.images?.length ? getAssetUrl(product.images[0].url) : '/placeholder.png'}
        alt={product.name}
        className="peep-cart-item-image"
      />
      <div className="peep-cart-item-info">
        <h3>{product.name}</h3>
        <p>GHS {price.toFixed(2)} each</p>
      </div>
      <div className="peep-cart-item-actions">
        <input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={handleQuantityChange}
          className="peep-cart-quantity"
        />
        <button
          onClick={() => removeFromCart(product._id)}
          className="peep-cart-remove"
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default CartItem;