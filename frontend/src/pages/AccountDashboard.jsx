import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { useSaved } from '../context/SavedContext';
import ProductCard from '../components/product/ProductCard';
import GoogleCompleteProfile from '../components/auth/GoogleCompleteProfile';

const sections = [
  { label: 'Overview', path: '/dashboard', icon: 'ti-layout-dashboard' },
  { label: 'Orders', path: '/dashboard/orders', icon: 'ti-package' },
  { label: 'Profile', path: '/dashboard/profile', icon: 'ti-user' },
  { label: 'Saved items', path: '/dashboard/saved', icon: 'ti-heart' },
];

const countries = ['Ghana', 'Nigeria'];

const locations = {
  Ghana: {
    states: {
      'Ashanti Region': ['Kumasi', 'Obuasi', 'Ejisu', 'Konongo'],
      'Ahafo Region': ['Goaso', 'Bechem', 'Duayaw Nkwanta'],
      'Bono Region': ['Sunyani', 'Berekum', 'Dormaa Ahenkro'],
      'Bono East Region': ['Techiman', 'Kintampo', 'Nkoranza'],
      'Central Region': ['Cape Coast', 'Kasoa', 'Elmina', 'Winneba'],
      'Eastern Region': ['Koforidua', 'Nkawkaw', 'Nsawam', 'Akim Oda'],
      'Greater Accra Region': ['Accra', 'Tema', 'Madina', 'Adenta', 'Teshie'],
      'North East Region': ['Nalerigu', 'Gambaga', 'Walewale'],
      'Northern Region': ['Tamale', 'Yendi', 'Savelugu'],
      'Oti Region': ['Dambai', 'Jasikan', 'Nkwanta'],
      'Savannah Region': ['Damongo', 'Bole', 'Salaga'],
      'Upper East Region': ['Bolgatanga', 'Bawku', 'Navrongo'],
      'Upper West Region': ['Wa', 'Lawra', 'Tumu'],
      'Volta Region': ['Ho', 'Hohoe', 'Keta', 'Aflao'],
      'Western Region': ['Sekondi-Takoradi', 'Tarkwa', 'Axim'],
      'Western North Region': ['Sefwi Wiawso', 'Bibiani', 'Enchi'],
    },
  },
  Nigeria: {
    states: {
      'Abia': ['Umuahia', 'Aba'], 'Adamawa': ['Yola', 'Mubi'], 'Akwa Ibom': ['Uyo', 'Eket'], 'Anambra': ['Awka', 'Onitsha', 'Nnewi'],
      'Bauchi': ['Bauchi', 'Azare'], 'Bayelsa': ['Yenagoa', 'Brass'], 'Benue': ['Makurdi', 'Otukpo'], 'Borno': ['Maiduguri', 'Biu'],
      'Cross River': ['Calabar', 'Ogoja'], 'Delta': ['Asaba', 'Warri', 'Sapele'], 'Ebonyi': ['Abakaliki', 'Afikpo'], 'Edo': ['Benin City', 'Auchi'],
      'Ekiti': ['Ado-Ekiti', 'Ikere'], 'Enugu': ['Enugu', 'Nsukka'], 'Gombe': ['Gombe', 'Kaltungo'], 'Imo': ['Owerri', 'Orlu'],
      'Jigawa': ['Dutse', 'Hadejia'], 'Kaduna': ['Kaduna', 'Zaria'], 'Kano': ['Kano', 'Wudil'], 'Katsina': ['Katsina', 'Funtua'],
      'Kebbi': ['Birnin Kebbi', 'Argungu'], 'Kogi': ['Lokoja', 'Okene'], 'Kwara': ['Ilorin', 'Offa'], 'Lagos': ['Ikeja', 'Lagos', 'Epe'],
      'Nasarawa': ['Lafia', 'Keffi'], 'Niger': ['Minna', 'Suleja'], 'Ogun': ['Abeokuta', 'Ijebu Ode', 'Sagamu'], 'Ondo': ['Akure', 'Ondo'],
      'Osun': ['Osogbo', 'Ile-Ife', 'Ilesa'], 'Oyo': ['Ibadan', 'Ogbomoso', 'Oyo'], 'Plateau': ['Jos', 'Bukuru'], 'Rivers': ['Port Harcourt', 'Bonny'],
      'Sokoto': ['Sokoto', 'Tambuwal'], 'Taraba': ['Jalingo', 'Wukari'], 'Yobe': ['Damaturu', 'Potiskum'], 'Zamfara': ['Gusau', 'Kaura Namoda'],
      'Federal Capital Territory': ['Abuja', 'Gwagwalada', 'Kuje'],
    },
  },
};

const countryDialCodes = {
  Ghana: '+233',
  Nigeria: '+234',
};

const parsePhone = (phoneValue = '') => {
  const trimmed = String(phoneValue || '').trim();
  const match = trimmed.match(/^([+\d]+)\s*(.*)$/);

  if (!match) {
    return { phoneCode: '+233', phoneNumber: '' };
  }

  return {
    phoneCode: match[1] || '+233',
    phoneNumber: match[2].replace(/\D/g, '') || '',
  };
};

const formatPhone = (phoneCode, phoneNumber) => {
  const cleanCode = String(phoneCode || '+233').trim();
  const cleanNumber = String(phoneNumber || '').replace(/\D/g, '').trim();
  return cleanNumber ? `${cleanCode} ${cleanNumber}` : cleanCode;
};

const splitName = (fullName = '') => {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...lastNameParts] = parts;
  return {
    firstName,
    lastName: lastNameParts.join(' '),
  };
};

const AccountDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const { savedProducts } = useSaved();
  const currentPath = location.pathname;
  const shouldCompleteGoogleProfile = new URLSearchParams(location.search).get('completeProfile') === 'true';
  const activeSection = shouldCompleteGoogleProfile
    ? 'Profile'
    : sections.find((section) => section.path === currentPath)?.label || 'Overview';

  useEffect(() => {
    api.get('/orders?limit=100')
      .then((response) => setOrders(response.data.data || []))
      .catch(() => setOrders([]));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="peep-account-page">
      <button className="peep-account-mobile-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle account menu"><i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`}></i></button>
      <aside className={`peep-account-sidebar ${menuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" className="peep-account-brand">PEEP<span>.</span></Link>
        <div className="peep-account-user">
          <div className="peep-account-avatar">{(user?.name || 'P').charAt(0).toUpperCase()}</div>
          <div><strong>{user?.name || 'Peep customer'}</strong><span>{user?.email || 'Your account'}</span></div>
        </div>
        <div className="peep-account-nav-label">Account</div>
        <nav className="peep-account-nav">
          {sections.map((section) => <Link key={section.path} to={section.path} className={currentPath === section.path ? 'active' : ''} onClick={() => setMenuOpen(false)}><i className={`ti ${section.icon}`}></i>{section.label}</Link>)}
        </nav>
        <div className="peep-account-nav-label">Support</div>
        <nav className="peep-account-nav">
          <Link to="/contact" onClick={() => setMenuOpen(false)}><i className="ti ti-headset"></i>Contact support</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}><i className="ti ti-shopping-bag"></i>Continue shopping</Link>
        </nav>
        <button type="button" className="peep-account-logout" onClick={handleLogout}><i className="ti ti-logout"></i>Sign out</button>
      </aside>
      <main className="peep-account-content">
        <div className="peep-account-topline"><div><div className="section-eyebrow">My account</div><h1>{activeSection}</h1></div><Link to="/cart" className="btn btn-ghost"><i className="ti ti-shopping-cart"></i> Cart</Link></div>
        {shouldCompleteGoogleProfile ? (
          <GoogleCompleteProfile />
        ) : (
          <>
            {activeSection === 'Overview' && <Overview user={user} orders={orders} savedCount={savedProducts.length} />}
            {activeSection === 'Orders' && <Orders orders={orders} />}
            {activeSection === 'Profile' && <Profile user={user} />}
            {activeSection === 'Saved items' && <SavedItems savedProducts={savedProducts} />}
          </>
        )}
      </main>
    </div>
  );
};

const Overview = ({ user, orders, savedCount }) => <>
  <div className="peep-account-welcome"><div><span>Welcome back,</span><h2>{user?.name?.split(' ')[0] || 'there'}.</h2><p>Keep an eye on your orders and find your next favorite piece of tech.</p></div><i className="ti ti-sparkles"></i></div>
  <div className="peep-account-stat-grid"><div className="card peep-account-stat-card"><i className="ti ti-package"></i><strong>{orders.length}</strong><span>Orders placed</span></div><div className="card peep-account-stat-card"><i className="ti ti-clock"></i><strong>{orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status)).length}</strong><span>In progress</span></div><div className="card peep-account-stat-card"><i className="ti ti-heart"></i><strong>{savedCount}</strong><span>Saved items</span></div></div>
  <div className="peep-account-overview-grid"><div className="card peep-account-panel"><h2>Recent orders</h2>{orders.length ? <OrderList orders={orders.slice(0, 5)} /> : <EmptyState icon="ti-package" title="No orders yet" text="Your orders will appear here after checkout." action="Start shopping" to="/shop" />}</div><div className="card peep-account-panel"><h2>Account details</h2><div className="peep-account-detail"><span>Name</span><strong>{user?.name || 'Not provided'}</strong></div><div className="peep-account-detail"><span>Email</span><strong>{user?.email || 'Not provided'}</strong></div><Link to="/dashboard/profile" className="peep-account-panel-link">Edit profile <i className="ti ti-arrow-right"></i></Link></div></div>
</>;

const Orders = ({ orders }) => <div className="card peep-account-panel"><h2>Your orders</h2>{orders.length ? <OrderList orders={orders} /> : <EmptyState icon="ti-package" title="No orders yet" text="When you place an order, its status and details will appear here." action="Browse the shop" to="/shop" />}</div>;

const SavedItems = ({ savedProducts }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all(savedProducts.map((productId) => api.get(`/products/${productId}`)))
      .then((responses) => setProducts(responses.map((response) => response.data.data)))
      .catch(() => setProducts([]));
  }, [savedProducts]);

  if (!savedProducts.length || !products.length) {
    return <EmptyState icon="ti-heart" title="Your saved items" text="Save products you want to compare or come back to later." action="Browse products" to="/shop" />;
  }

  return <div className="peep-account-saved-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>;
};

const OrderList = ({ orders }) => <div className="peep-account-order-list">{orders.map((order) => <div className="peep-account-order" key={order._id}><div><strong>Order #{String(order._id).slice(-6)}</strong><span>{order.items?.length || 0} item(s) · GHS {Number(order.totalPrice || 0).toFixed(2)}</span></div><em className={`peep-account-order-status ${order.status}`}>{order.status}</em></div>)}</div>;

const Profile = ({ user }) => {
  const { login, token } = useAuth();
  const initialPhone = parsePhone(user?.phone);

  const initialNames = splitName(user?.name);

  const [formData, setFormData] = useState({
    firstName: initialNames.firstName,
    lastName: initialNames.lastName,
    email: user?.email || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });
  const [phoneCode, setPhoneCode] = useState(initialPhone.phoneCode || '+233');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedLocation = locations[formData.country];

  const hasChanges = (() => {
    const originalProfile = {
      firstName: splitName(user?.name).firstName,
      lastName: splitName(user?.name).lastName,
      email: user?.email || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
      phone: user?.phone || '',
    };

    const currentProfile = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      phone: formatPhone(phoneCode, phoneNumber),
    };

    return Object.keys(originalProfile).some((key) => String(currentProfile[key] ?? '') !== String(originalProfile[key] ?? ''));
  })();

  useEffect(() => {
    const nextPhone = parsePhone(user?.phone);
    const nextNames = splitName(user?.name);
    setFormData({
      firstName: nextNames.firstName,
      lastName: nextNames.lastName,
      email: user?.email || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    });
    setPhoneCode(nextPhone.phoneCode || '+233');
    setPhoneNumber(nextPhone.phoneNumber || '');
  }, [user]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === 'country') {
      setPhoneCode(countryDialCodes[value] || '+233');
      setFormData((current) => ({
        ...current,
        country: value,
        state: '',
        city: '',
      }));
      return;
    }

    if (name === 'state') {
      setFormData((current) => ({ ...current, state: value, city: '' }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasChanges) return;

    const requiredFields = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      phone: phoneNumber,
    };

    const hasEmptyRequiredField = Object.values(requiredFields).some((value) => String(value).trim() === '');
    if (hasEmptyRequiredField) {
      setError('Please fill in all required profile details before saving.');
      toast.error('Please fill in all required profile details before saving.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        phone: formatPhone(phoneCode, phoneNumber),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim(),
        },
      };

      const { data } = await api.put('/users/profile', payload);
      const updatedUser = data.data || { ...user, ...payload, address: payload.address };

      if (token) {
        login(token, updatedUser);
      }

      toast.success('Profile updated successfully.');
    } catch (submitError) {
      const message = submitError?.response?.data?.message || 'Unable to update your profile right now.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card peep-account-panel">
      <h2>Profile information</h2>
      <form className="peep-profile-form" onSubmit={handleSubmit}>
        {error && <div className="peep-profile-error"><i className="ti ti-alert-circle"></i>{error}</div>}
        <div className="peep-profile-grid">
          <div className="peep-profile-field">
            <label htmlFor="profile-first-name">First name</label>
            <input id="profile-first-name" name="firstName" value={formData.firstName} onChange={handleFieldChange} placeholder="First name" required />
          </div>
          <div className="peep-profile-field">
            <label htmlFor="profile-last-name">Last name</label>
            <input id="profile-last-name" name="lastName" value={formData.lastName} onChange={handleFieldChange} placeholder="Last name" required />
          </div>
          <div className="peep-profile-field peep-profile-field-wide">
            <label htmlFor="profile-email">Email address</label>
            <input id="profile-email" name="email" type="email" value={formData.email} onChange={handleFieldChange} placeholder="Email address" required />
          </div>
          <div className="peep-profile-field">
            <label htmlFor="profile-country">Country</label>
            <select id="profile-country" name="country" value={formData.country} onChange={handleFieldChange}>
              <option value="">Select country</option>
              {countries.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
          </div>
          <div className="peep-profile-field">
            <label htmlFor="profile-state">State / Region</label>
            {selectedLocation ? (
              <select id="profile-state" name="state" value={formData.state} onChange={handleFieldChange}>
                <option value="">Select state or region</option>
                {Object.keys(selectedLocation.states).map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            ) : (
              <input id="profile-state" name="state" value={formData.state} onChange={handleFieldChange} placeholder="State or region" />
            )}
          </div>
          <div className="peep-profile-field peep-profile-field-wide">
            <label htmlFor="profile-street">Street address</label>
            <input id="profile-street" name="street" value={formData.street} onChange={handleFieldChange} placeholder="Street address" />
          </div>
          <div className="peep-profile-field peep-profile-field-inline">
            <div className="peep-profile-field peep-profile-field-small">
              <label htmlFor="profile-city">City</label>
              {selectedLocation && formData.state ? (
                <select id="profile-city" name="city" value={formData.city} onChange={handleFieldChange}>
                  <option value="">Select city</option>
                  {selectedLocation.states[formData.state]?.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              ) : (
                <input id="profile-city" name="city" value={formData.city} onChange={handleFieldChange} placeholder="City" />
              )}
            </div>
            <div className="peep-profile-field peep-profile-field-small">
              <label htmlFor="profile-zip">ZIP / Postal code</label>
              <input id="profile-zip" name="zipCode" value={formData.zipCode} onChange={handleFieldChange} placeholder="ZIP / Postal code" />
            </div>
          </div>
          <div className="peep-profile-field peep-profile-field-phone">
            <label htmlFor="profile-phone-code">Phone / WhatsApp</label>
            <div className="peep-phone-inline">
              <select id="profile-phone-code" value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)}>
                {Object.entries(countryDialCodes).map(([countryName, code]) => (
                  <option key={countryName} value={code}>{code}</option>
                ))}
              </select>
              <input id="profile-phone" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ''))} placeholder="50 303 5014" />
            </div>
          </div>
        </div>
        <div className="peep-profile-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || !hasChanges} aria-disabled={saving || !hasChanges}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

const EmptyState = ({ icon, title, text, action, to }) => <div className="peep-account-empty"><i className={`ti ${icon}`}></i><h3>{title}</h3><p>{text}</p><Link to={to} className="btn btn-ghost">{action}</Link></div>;

export default AccountDashboard;
