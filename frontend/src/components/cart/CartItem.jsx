import { isCartItemUnavailable, useCart } from '../../context/CartContext';
import { getAssetUrl } from '../../api/axiosConfig';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();
  const { product, quantity, price } = item;
  const unavailable = isCartItemUnavailable(item);
  const productName = product?.name || 'Unavailable product';
  const productId = product?._id;

  const handleQuantityChange = (e) => {
    const newQty = parseInt(e.target.value);
    if (newQty > 0 && productId) updateCartItem(productId, newQty);
  };

  return (
    <article className="peep-cart-item">
      <img
        src={product?.images?.length ? getAssetUrl(product.images[0].url) : '/placeholder.png'}
        alt={productName}
        className="peep-cart-item-image"
      />
      <div className="peep-cart-item-info">
        <h3>{productName}</h3>
        <p>{unavailable ? 'This product is no longer available.' : `GHS ${price.toFixed(2)} each`}</p>
      </div>
      <div className="peep-cart-item-actions">
        <input
          type="number"
          min="1"
          max={product?.stock || 1}
          value={quantity}
          onChange={handleQuantityChange}
          className="peep-cart-quantity"
          disabled={unavailable}
        />
        <button
          onClick={() => productId && removeFromCart(productId)}
          className="peep-cart-remove"
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default CartItem;