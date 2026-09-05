
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const verificationComplete = location.state?.verified === true;
  const handledGoogleToast = useRef(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleState = params.get('google');
    const message = params.get('message');

    if (user || localStorage.getItem('token')) {
      const nextUrl = new URL(window.location.href);
      nextUrl.search = '';
      window.history.replaceState({}, '', nextUrl);
      return;
    }

    if (!googleState) {
      handledGoogleToast.current = false;
      return;
    }

    if (handledGoogleToast.current) return;
    handledGoogleToast.current = true;

    let toastMessage = '';

    if (googleState === 'email-account') {
      toastMessage = message || 'An account with this email already exists. Please sign in with your email and password.';
    }

    if (googleState === 'google-account') {
      toastMessage = message || 'This account was created with Google. Please sign in with Google.';
    }

    if (googleState === 'error') {
      toastMessage = message || 'Google sign-in could not continue because your Google account did not provide the information we need, or the account was not set up correctly. Please try again or sign in with your email.';
    }

    if (toastMessage) {
      const nextUrl = new URL(window.location.href);
      nextUrl.search = '';
      window.history.replaceState({}, '', nextUrl);
      toast.error(toastMessage);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);
      toast.success('Welcome back!');

      // 👇 Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const responseMessage = error.response?.data?.message;
      const message = error.response?.status === 401
        ? 'Incorrect email or password. Check your details and try again.'
        : responseMessage || 'Login failed. Please try again.';
      setLoginError(message);
      toast.error(message);
    }
  };

  return (
    <div className="peep-auth-page">
      <div className="peep-auth-shell">
        <aside className="peep-auth-aside">
          <div className="peep-auth-aside-mark">PEEP<span>.</span></div>
          <div className="section-eyebrow">Welcome back</div>
          <h1>Good tech starts with a good peep.</h1>
          <p>Sign in to keep track of your orders, save your details, and get closer to the right device.</p>
        </aside>
        <section className="peep-auth-panel">
          <div className="section-eyebrow">Your account</div>
          <h2>Sign in</h2>
          <p className="peep-auth-intro">Welcome back to Peep Online Marketplace.</p>
          <a href={`${API_URL}/auth/google`} className="peep-auth-google"><i className="ti ti-brand-google"></i> Continue with Google</a>
          <div className="peep-auth-divider"><span>or</span></div>
          {verificationComplete && <details className="peep-otp-success peep-login-success" open><summary><i className="ti ti-circle-check"></i><span>Email verified and account created</span><i className="ti ti-chevron-down"></i></summary><div><p>Your account is ready. Sign in below to continue shopping.</p></div></details>}
          {loginError && <div className="peep-auth-error" role="alert"><i className="ti ti-alert-circle"></i><span>{loginError}</span></div>}
          <form onSubmit={handleSubmit} className="peep-auth-form">
            <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Password<div className="peep-password-field"><input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}><i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}></i></button></div></label>
            <button type="submit" className="btn btn-primary peep-auth-submit">Sign in <i className="ti ti-arrow-right"></i></button>
          </form>
          <div className="peep-auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <span>New to Peep? <Link to="/register">Create an account</Link></span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;