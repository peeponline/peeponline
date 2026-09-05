import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { getAssetUrl } from '../api/axiosConfig';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [shippingZones, setShippingZones] = useState([]);
  const [shippingDestination, setShippingDestination] = useState('');
  const totalWeightKg = cart.items.reduce((total, item) => total + Number(item.product.weightKg || 0) * item.quantity, 0);
  const selectedZone = shippingZones.find((zone) => zone._id === shippingDestination);
  const shipping = selectedZone ? Number(selectedZone.baseFee) + totalWeightKg * Number(selectedZone.feePerKg) : 0;
  const total = cart.totalPrice + shipping;

  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  useEffect(() => {
    api.get('/shipping').then((response) => {
      const zones = response.data.data || [];
      setShippingZones(zones);
    }).catch(() => setShippingZones([]));
  }, []);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create order
      if (!shippingDestination) throw new Error('Please choose a shipping destination');
      const orderRes = await api.post('/orders', {
        shippingAddress,
        shippingDestination,
        paymentMethod: 'paystack',
        notes: '',
      });
      const orderId = orderRes.data.data._id;

      // 2. Initialize payment
      const paymentRes = await api.post('/payments/initialize', { orderId });
      const { authorizationUrl } = paymentRes.data.data;

      // The server cart is cleared when the pending order is created.
      clearCart();

      window.location.href = authorizationUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="peep-checkout-page">
      <div className="peep-checkout-shell">
        <div className="peep-checkout-heading"><div className="section-eyebrow">Secure checkout</div><h1>Complete your order</h1><p>Enter your delivery details. You will complete payment securely with Paystack.</p></div>
        <div className="peep-checkout-layout">
          <form onSubmit={handleSubmit} className="peep-checkout-form">
            <section className="peep-checkout-panel"><div className="peep-checkout-panel-heading"><span>01</span><div><h2>Delivery details</h2><p>Where should we deliver your order?</p></div></div><div className="peep-checkout-fields">
            <label>Street address<input
              type="text"
              name="street"
              value={shippingAddress.street}
              onChange={handleChange}
              required
            /></label>
            <label>City<input
              type="text"
              name="city"
              value={shippingAddress.city}
              onChange={handleChange}
              required
            /></label>
            <label>Region / state<input
              type="text"
              name="state"
              value={shippingAddress.state}
              onChange={handleChange}
              required
            /></label>
            <label>Postal code<input
              type="text"
              name="zipCode"
              value={shippingAddress.zipCode}
              onChange={handleChange}
              required
            /></label>
            <label className="peep-checkout-field-wide">Country<input
              type="text"
              name="country"
              value={shippingAddress.country}
              onChange={handleChange}
              required
            /></label></div></section>

            <section className="peep-checkout-panel"><div className="peep-checkout-panel-heading"><span>02</span><div><h2>Shipping destination</h2><p>Choose one of the available delivery zones.</p></div></div><select className="peep-checkout-payment" value={shippingDestination} onChange={(event) => setShippingDestination(event.target.value)} required disabled={!shippingZones.length}><option value="">{shippingZones.length ? 'Choose a destination' : 'No destinations available'}</option>{shippingZones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name} · GHS {zone.baseFee.toFixed(2)} base + GHS {zone.feePerKg.toFixed(2)} / kg</option>)}</select>{!shippingZones.length && <p className="peep-checkout-zone-warning">Shipping destinations have not been configured yet. Please contact support.</p>}<div className="peep-checkout-payment-note"><i className="ti ti-scale"></i><span>Cart weight: {totalWeightKg.toFixed(2)} kg. Shipping is calculated by destination and weight.</span></div></section>

            <section className="peep-checkout-panel"><div className="peep-checkout-panel-heading"><span>03</span><div><h2>Paystack payment</h2><p>Cards, bank transfer, and mobile money are available through Paystack.</p></div></div><div className="peep-checkout-paystack"><i className="ti ti-credit-card"></i><strong>Pay securely with Paystack</strong></div><div className="peep-checkout-payment-note"><i className="ti ti-lock"></i><span>Your payment details are handled securely by Paystack.</span></div></section>

            <button
              type="submit"
              disabled={loading || !shippingDestination || !shippingZones.length}
              className="btn btn-primary peep-checkout-submit"
            >
              <i className="ti ti-lock"></i>{loading ? 'Processing...' : 'Place order & pay'}
            </button>
          </form>
          <aside className="peep-checkout-summary"><div className="peep-checkout-summary-heading"><span>Your order</span><h2>Order summary</h2></div>
            <div className="peep-checkout-items">{cart.items.map((item) => (
              <div key={item.product._id} className="peep-checkout-item"><img src={item.product.images?.[0]?.url ? getAssetUrl(item.product.images[0].url) : '/placeholder.png'} alt="" /><div><strong>{item.product.name}</strong><span>Qty {item.quantity}</span></div><b>GHS {(item.price * item.quantity).toFixed(2)}</b></div>
            ))}</div>
            <div className="peep-checkout-total">
              <span>Subtotal</span>
              <span>GHS {cart.totalPrice.toFixed(2)}</span>
            </div>
            <div className="peep-checkout-summary-row"><span>Shipping</span><span>{shipping ? `GHS ${shipping.toFixed(2)}` : 'Free'}</span></div>
            <div className="peep-checkout-total"><span>Total</span><span>GHS {total.toFixed(2)}</span></div>
            <p className="peep-checkout-summary-note"><i className="ti ti-shield-check"></i> Your order is protected by Peep's customer support.</p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;