import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => location.state?.email || sessionStorage.getItem('pendingPasswordResetEmail') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.otp) {
        toast.success(`OTP: ${res.data.otp} (development)`);
      } else {
        toast.success('Reset OTP sent to your email');
      }
      sessionStorage.setItem('pendingPasswordResetEmail', email);
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="peep-auth-page">
      <div className="peep-auth-shell peep-single-auth-shell">
        <aside className="peep-auth-aside">
          <div className="peep-auth-aside-mark">PEEP<span>.</span></div>
          <div className="section-eyebrow">Account recovery</div>
          <h1>Get back to the good stuff.</h1>
          <p>We will send a secure one-time code to your email so you can reset your password.</p>
        </aside>
        <section className="peep-auth-panel">
          <div className="section-eyebrow">Forgot password</div>
          <h2>Reset your password</h2>
          <p className="peep-auth-intro">Enter the email connected to your Peep account.</p>
          <form onSubmit={handleSubmit} className="peep-auth-form">
            <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <button type="submit" className="btn btn-primary peep-auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : <>Send reset code <i className="ti ti-arrow-right"></i></>}</button>
          </form>
          <p className="peep-auth-switch"><Link to="/login">Back to sign in</Link></p>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;