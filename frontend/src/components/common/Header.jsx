import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getAssetUrl } from '../../api/axiosConfig';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { cart, itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsDrawerOpen(false);
    setIsAccountMenuOpen(false);
    setIsCartMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  if (location.pathname.startsWith('/admin')) return null;

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = searchTerm.trim();
    navigate(keyword ? `/shop?keyword=${encodeURIComponent(keyword)}` : '/shop');
  };

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo">
          <img src="logo.png" alt="Peep logo" />
          <span className="nav-logo-text">PEEP<span>.</span></span>
        </Link>

        <ul className="nav-menu">
          <li>
            <NavLink to="/"><i className="ti ti-home" style={{ fontSize: 14 }}></i> Home</NavLink>
          </li>
          <li>
            <NavLink to="/shop"><i className="ti ti-device-laptop" style={{ fontSize: 14 }}></i> Shop <i className="ti ti-chevron-down chevron"></i></NavLink>
            <div className="dropdown">
              <Link to="/shop"><i className="ti ti-device-laptop"></i> Laptops & Desktops</Link>
              <Link to="/shop?cat=phone"><i className="ti ti-device-mobile"></i> Phones & Tablets</Link>
              <Link to="/shop?cat=accessory"><i className="ti ti-keyboard"></i> Accessories</Link>
              <Link to="/shop?cat=component"><i className="ti ti-cpu"></i> Components & Parts</Link>
              <div className="dropdown-divider"></div>
              <Link to="/deals"><i className="ti ti-tag"></i> Current Deals</Link>
            </div>
          </li>
          <li>
            <NavLink to="/services"><i className="ti ti-tools" style={{ fontSize: 14 }}></i> Services</NavLink>
          </li>
          <li><NavLink to="/deals"><i className="ti ti-tag" style={{ fontSize: 14 }}></i> Deals</NavLink></li>
          <li><NavLink to="/about"><i className="ti ti-info-circle" style={{ fontSize: 14 }}></i> About</NavLink></li>
          <li><NavLink to="/contact"><i className="ti ti-map-pin" style={{ fontSize: 14 }}></i> Contact</NavLink></li>
        </ul>

        <div className="nav-right">
          <div className="nav-search-menu">
            <button type="button" className="nav-icon-button" aria-label="Search products" title="Search products" aria-expanded={isSearchOpen} onClick={() => setIsSearchOpen(!isSearchOpen)}><i className="ti ti-search"></i></button>
            {isSearchOpen && <form className="nav-search-dropdown" onSubmit={handleSearch}><input type="search" autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products" aria-label="Search products" /><button type="submit" aria-label="Submit search"><i className="ti ti-arrow-right"></i></button></form>}
          </div>
          <div className="nav-cart-menu">
            <button type="button" className="nav-icon-button" aria-label="View cart" title="View cart" aria-expanded={isCartMenuOpen} onClick={() => setIsCartMenuOpen(!isCartMenuOpen)}>
              <i className="ti ti-shopping-cart"></i>{itemCount > 0 && <span className="nav-cart-count">{itemCount > 99 ? '99+' : itemCount}</span>}
            </button>
            {isCartMenuOpen && <div className="nav-cart-dropdown">
              <div className="nav-cart-dropdown-heading"><strong>Your cart</strong><span>{itemCount} item{itemCount === 1 ? '' : 's'}</span></div>
              {cart.items.length ? <div className="nav-cart-items">{cart.items.slice(0, 3).map((item) => <Link to={`/product/${item.product._id}`} key={item.product._id} onClick={() => setIsCartMenuOpen(false)}><img src={item.product.images?.[0]?.url ? getAssetUrl(item.product.images[0].url) : '/placeholder.png'} alt="" /><span><strong>{item.product.name}</strong><small>Qty {item.quantity}</small></span><b>GHS {(item.price * item.quantity).toFixed(2)}</b></Link>)}</div> : <p className="nav-cart-empty">Your cart is empty.</p>}
              {cart.items.length > 3 && <span className="nav-cart-more">+ {cart.items.length - 3} more item(s)</span>}
              {cart.items.length > 0 && <><div className="nav-cart-total"><span>Subtotal</span><strong>GHS {cart.totalPrice.toFixed(2)}</strong></div><div className="nav-cart-actions"><Link to="/cart" onClick={() => setIsCartMenuOpen(false)}>View cart</Link><Link to="/checkout" className="btn btn-primary" onClick={() => setIsCartMenuOpen(false)}>Checkout</Link></div></>}
            </div>}
          </div>
          <div className="nav-account-menu">
            <button
              type="button"
              className="nav-icon-button"
              aria-label={user ? 'Open dashboard menu' : 'Open account menu'}
              title={user ? 'Open dashboard menu' : 'Sign in or register'}
              aria-expanded={isAccountMenuOpen}
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            >
              <i className="ti ti-user"></i>
            </button>
            {isAccountMenuOpen && (
              <div className="nav-account-dropdown">
                {user ? (
                  <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={() => setIsAccountMenuOpen(false)}><i className="ti ti-layout-dashboard"></i> Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsAccountMenuOpen(false)}><i className="ti ti-login"></i> Sign in</Link>
                    <Link to="/register" onClick={() => setIsAccountMenuOpen(false)}><i className="ti ti-user-plus"></i> Register</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <button className="nav-toggle" onClick={toggleDrawer} aria-label="Menu">
            <i className={isDrawerOpen ? "ti ti-x" : "ti ti-menu-2"}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`nav-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <Link to="/" className="drawer-link"><i className="ti ti-home"></i> Home</Link>
        <Link to="/shop" className="drawer-link"><i className="ti ti-device-laptop"></i> Shop all products</Link>
        <Link to="/shop?cat=phone" className="drawer-link"><i className="ti ti-device-mobile"></i> Phones & Tablets</Link>
        <Link to="/shop?cat=accessory" className="drawer-link"><i className="ti ti-keyboard"></i> Accessories</Link>
        <div className="drawer-divider"></div>
        <Link to="/services" className="drawer-link"><i className="ti ti-tools"></i> Services</Link>
        <Link to="/deals" className="drawer-link"><i className="ti ti-tag"></i> Deals & Promotions</Link>
        <Link to="/about" className="drawer-link"><i className="ti ti-info-circle"></i> About us</Link>
        <Link to="/contact" className="drawer-link"><i className="ti ti-map-pin"></i> Contact</Link>
        <div className="drawer-divider"></div>
        <Link to="/dashboard" className="drawer-link"><i className="ti ti-chart-bar"></i> Dashboard</Link>
      </div>
    </>
  );
};

export default Header;