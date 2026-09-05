import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="peep-not-found-page">
    <div className="peep-not-found-mark">404</div>
    <div className="section-eyebrow">Page not found</div>
    <h1>This page took a wrong turn.</h1>
    <p>We could not find the page you were looking for. Let us get you back to the good stuff.</p>
    <div className="peep-not-found-actions">
      <Link to="/" className="btn btn-primary"><i className="ti ti-home"></i> Go home</Link>
      <Link to="/shop" className="btn btn-ghost"><i className="ti ti-shopping-bag"></i> Browse products</Link>
    </div>
  </div>
);

export default NotFoundPage;
