import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || sessionStorage.getItem('pendingPasswordResetEmail') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword, confirmPassword });
      toast.success('Password updated! Please login.');
      sessionStorage.removeItem('pendingPasswordResetEmail');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="peep-auth-page">
      <div className="peep-auth-shell peep-single-auth-shell">
        <aside className="peep-auth-aside"><div className="peep-auth-aside-mark">PEEP<span>.</span></div><div className="section-eyebrow">Account recovery</div><h1>A fresh start for your account.</h1><p>Choose a new password and get back to shopping with confidence.</p></aside>
        <section className="peep-auth-panel"><div className="section-eyebrow">Password recovery</div><h2>Choose a new password</h2><p className="peep-auth-intro">Enter the six-digit code sent to your email, then create a new password.</p>
          <form onSubmit={handleSubmit} className="peep-auth-form">
            <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <button type="button" className="peep-auth-text-button" onClick={() => navigate('/forgot-password', { state: { email } })}>Correct email</button>
            <label>Reset code<input className="peep-otp-input" type="text" inputMode="numeric" pattern="[0-9]{6}" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} /></label>
            <label>New password<div className="peep-password-field"><input type={showNewPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} title={showNewPassword ? 'Hide password' : 'Show password'}><i className={`ti ${showNewPassword ? 'ti-eye-off' : 'ti-eye'}`}></i></button></div></label>
            <label>Confirm password<div className="peep-password-field"><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat your new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} title={showConfirmPassword ? 'Hide password' : 'Show password'}><i className={`ti ${showConfirmPassword ? 'ti-eye-off' : 'ti-eye'}`}></i></button></div></label>
            <button type="submit" className="btn btn-primary peep-auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : <>Update password <i className="ti ti-arrow-right"></i></>}</button>
          </form>
          <p className="peep-auth-switch"><Link to="/forgot-password" state={{ email }}>Request a new code</Link> · <Link to="/login">Back to sign in</Link></p>
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;