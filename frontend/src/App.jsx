import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SavedProvider } from './context/SavedContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Seo from './components/common/Seo';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import DealsPage from './pages/DealsPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AccountDashboard from './pages/AccountDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import GoogleCompleteProfile from './components/auth/GoogleCompleteProfile';
import NotFoundPage from './pages/NotFoundPage';
import api from './api/axiosConfig';

function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const finishGoogleLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login?google=error', { replace: true });
        return;
      }

      try {
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = data.user || {};
        login(token, user);

        const hasAddress = !!(
          user.address &&
          user.address.street &&
          user.address.city &&
          user.address.country &&
          user.address.state &&
          user.address.zipCode
        );
        const needsProfileCompletion = !user.phone || !hasAddress;

        navigate(needsProfileCompletion ? '/dashboard?completeProfile=true' : '/dashboard', { replace: true });
      } catch (error) {
        navigate('/login?google=error', { replace: true });
      }
    };

    finishGoogleLogin();
  }, [login, navigate]);

  return null;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/dashboard');
  const showHeader = !location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Seo pathname={location.pathname} />
      {showHeader && <Header />}
      <main className="peep-app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<GoogleAuthSuccess />} />
          <Route
            path="/auth/google/complete-profile"
            element={
              <ProtectedRoute>
                <GoogleCompleteProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AccountDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <AccountDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SavedProvider>
            <ScrollToTop />
            <AppLayout />
          </SavedProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;