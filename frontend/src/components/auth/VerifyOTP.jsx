import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || sessionStorage.getItem('pendingVerificationEmail') || '');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCorrectingEmail, setIsCorrectingEmail] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      sessionStorage.removeItem('pendingVerificationEmail');
      toast.success('Email verified!');
      navigate('/login', { state: { verified: true } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New OTP sent to your email');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((seconds) => {
          if (seconds <= 1) {
            clearInterval(timer);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="peep-auth-page">
      <div className="peep-auth-shell peep-single-auth-shell">
        <aside className="peep-auth-aside">
          <div className="peep-auth-aside-mark">PEEP<span>.</span></div>
          <div className="section-eyebrow">One more step</div>
          <h1>Make it official.</h1>
          <p>Verify your email and unlock a smoother way to shop, track orders, and get support.</p>
          <div className="peep-auth-aside-line"><i className="ti ti-mail-check"></i> Codes expire after 10 minutes.</div>
        </aside>
        <section className="peep-auth-panel">
          <div className="section-eyebrow">Email verification</div>
          <h2>Verify your email</h2>
          {isVerified ? (
            <details className="peep-otp-success" open>
              <summary><i className="ti ti-circle-check"></i><span>Account created successfully</span><i className="ti ti-chevron-down"></i></summary>
              <div><p>Your email has been verified. Your Peep account is ready.</p><Link to="/login" className="btn btn-primary">Go to login <i className="ti ti-arrow-right"></i></Link></div>
            </details>
          ) : (
            <>
              <p className="peep-auth-intro">Enter the email you used to register and the six-digit code we sent.</p>
              <form onSubmit={handleVerify} className="peep-auth-form">
                <label>Email<div className="peep-otp-email-field"><input type="email" placeholder="you@example.com" value={email} readOnly={!isCorrectingEmail} onChange={(e) => { setEmail(e.target.value); sessionStorage.setItem('pendingVerificationEmail', e.target.value); }} required /><button type="button" onClick={() => setIsCorrectingEmail(!isCorrectingEmail)}>{isCorrectingEmail ? 'Done' : 'Correct email'}</button></div></label>
                <label>Verification code<input className="peep-otp-input" type="text" inputMode="numeric" pattern="[0-9]{6}" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} /></label>
                <button type="submit" className="btn btn-primary peep-auth-submit" disabled={isVerifying}>{isVerifying ? <><span className="peep-button-spinner"></span> Verifying...</> : <>Verify email <i className="ti ti-arrow-right"></i></>}</button>
              </form>
              <div className="peep-otp-resend"><span>Did not receive a code?</span><button type="button" onClick={handleResend} disabled={!email || resendCooldown > 0}>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}</button></div>
              <p className="peep-auth-switch"><Link to="/login">Back to sign in</Link></p>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default VerifyOTP;