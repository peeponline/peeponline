import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/logo.png" alt="Peep logo" />
          <div className="footer-brand-name">PEEP<span>.</span></div>
          <p className="footer-desc">Accra's trusted destination for consumer tech, accessories, and expert services. Peep online and get the best deals.</p>
          <div className="footer-socials">
            <a href="https://instagram.com/PeepOnlinemarketplace" className="footer-social" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-instagram"></i></a>
            <a href="https://www.facebook.com/844395632089629" className="footer-social" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-facebook"></i></a>
            <a href="https://wa.me/233503035014" className="footer-social" target="_blank" rel="noopener noreferrer"><i className="ti ti-brand-whatsapp"></i></a>
            <a href="mailto:peeponline.marketplace@gmail.com" className="footer-social"><i className="ti ti-mail"></i></a>
          </div>
        </div>

        <div>
          <div className="footer-col-title">Shop</div>
          <div className="footer-links">
            <Link to="/shop">Laptops & Desktops</Link>
            <Link to="/shop?cat=phone">Phones & Tablets</Link>
            <Link to="/shop?cat=accessory">Accessories</Link>
            <Link to="/shop?cat=component">Components</Link>
            <Link to="/deals">Current Deals</Link>
          </div>
        </div>

        <div>
          <div className="footer-col-title">Services</div>
          <div className="footer-links">
            <Link to="/services">Repairs</Link>
            <Link to="/services?s=build">Custom PC Builds</Link>
            <Link to="/services?s=upgrade">Upgrades</Link>
            <Link to="/services?s=it">IT Support</Link>
            <Link to="/services?s=data">Data Recovery</Link>
          </div>
        </div>

        <div>
          <div className="footer-col-title">Company</div>
          <div className="footer-links">
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <a href="mailto:peeponline.marketplace@gmail.com">mail@peeponline.store</a>
            <a href="tel:+233503035014">+233 50 303 5014</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Peep Online Marketplace · Circle Tiptoe Lane 5, Accra, Ghana</p>
        <p>Consumer tech · Accessories · Services</p>
      </div>
    </footer>
  );
};

export default Footer;