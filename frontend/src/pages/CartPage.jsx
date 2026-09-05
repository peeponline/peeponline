import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const CartPage = () => {
  const { cart } = useCart();

  if (!cart.items.length) {
    return (
      <div className="peep-cart-page peep-cart-empty-page">
        <div className="peep-cart-empty-icon"><i className="ti ti-shopping-cart-off"></i></div>
        <div className="section-eyebrow">Your basket</div>
        <h1>Your cart is empty</h1>
        <p>Add something from the catalogue and it will appear here.</p>
        <Link to="/shop" className="btn btn-primary"><i className="ti ti-device-laptop"></i> Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="peep-cart-page">
      <div className="peep-cart-shell">
        <div className="section-eyebrow">Your basket</div>
        <h1>Shopping cart</h1>
        <p className="peep-cart-intro">Review your selected products before checkout.</p>
        <div className="peep-cart-layout">
        <div className="peep-cart-items">
          {cart.items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>
        <div className="peep-cart-summary-column">
          <CartSummary />
        </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;