import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CartSummary = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = cart.totalPrice;
  const shipping = subtotal > 50 ? 0 : 5;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="peep-cart-summary">
      <div className="peep-cart-summary-heading"><span>Checkout</span><h2>Order summary</h2></div>
      <div className="peep-cart-summary-row">
        <span>Subtotal</span>
        <span>GHS {subtotal.toFixed(2)}</span>
      </div>
      <div className="peep-cart-summary-row">
        <span>Shipping</span>
        <span>{shipping ? `GHS ${shipping.toFixed(2)}` : 'Free'}</span>
      </div>
      <div className="peep-cart-summary-total">
        <span>Total</span>
        <span>GHS {total.toFixed(2)}</span>
      </div>
      <button
        onClick={handleCheckout}
        className="btn btn-primary peep-cart-checkout"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;