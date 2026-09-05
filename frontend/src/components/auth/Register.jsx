import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../api/axiosConfig';
import toast from 'react-hot-toast';

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
  'United States': '+1',
  Canada: '+1',
  'United Kingdom': '+44',
  Australia: '+61',
  India: '+91',
  'South Africa': '+27',
  Kenya: '+254',
  Germany: '+49',
  France: '+33',
  Italy: '+39',
  Spain: '+34',
  China: '+86',
  Japan: '+81',
};

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [phoneCode, setPhoneCode] = useState('+233');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const selectedLocation = locations[form.address.country];
  const isFormComplete = Boolean(
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password &&
    form.confirmPassword &&
    phoneNumber.trim() &&
    form.address.street.trim() &&
    form.address.country &&
    form.address.state &&
    form.address.city &&
    form.address.zipCode.trim() &&
    acceptedTerms &&
    form.password === form.confirmPassword
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError('');
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      if (field === 'country') {
        const nextPhoneCode = countryDialCodes[value] || '+1';
        setPhoneCode(nextPhoneCode);
      }
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
          ...(field === 'country' ? { state: '', city: '' } : {}),
          ...(field === 'state' ? { city: '' } : {}),
        },
      }));
    } else {
      if (name === 'phoneNumber') {
        setPhoneNumber(value.replace(/\D/g, ''));
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match. Please check both password fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { confirmPassword, firstName, lastName, ...registrationData } = form;
      registrationData.name = `${firstName.trim()} ${lastName.trim()}`.trim();
      registrationData.phone = `${phoneCode} ${phoneNumber.trim()}`;
      await api.post('/auth/register', registrationData);
      sessionStorage.setItem('pendingVerificationEmail', form.email.trim());
      toast.success('Registration successful! Check your email for OTP.');
      navigate('/verify-otp', { state: { email: form.email.trim() } });
    } catch (error) {
      const responseMessage = error.response?.data?.message || '';
      const message = /exist|duplicate|email/i.test(responseMessage)
        ? 'This email is already in use. Try signing in or use another email.'
        : responseMessage || 'Registration failed. Please check your details and try again.';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="peep-auth-page">
      <div className="peep-auth-shell peep-register-shell">
        <aside className="peep-auth-aside">
          <div className="peep-auth-aside-mark">PEEP<span>.</span></div>
          <div className="section-eyebrow">Join the community</div>
          <h1>Make your next tech move count.</h1>
          <p>Create your Peep account for a smoother way to browse, order, and get support.</p>
        </aside>
        <section className="peep-auth-panel">
          <div className="section-eyebrow">New account</div>
          <h2>Create your account</h2>
          <p className="peep-auth-intro">A few details and you are ready to peep online.</p>
          <a href={`${API_URL}/auth/google`} className="peep-auth-google"><i className="ti ti-brand-google"></i> Sign up with Google</a>
          <div className="peep-auth-divider"><span>or</span></div>
          {formError && <div className="peep-auth-error" role="alert"><i className="ti ti-alert-circle"></i><span>{formError}</span></div>}
          <form onSubmit={handleSubmit} className="peep-auth-form peep-register-form">
            <div className="peep-auth-form-grid">
              <label>First name<input type="text" name="firstName" placeholder="John" onChange={handleChange} required /></label>
              <label>Last name<input type="text" name="lastName" placeholder="Mensah" onChange={handleChange} required /></label>
            </div>
            <label>Email<input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required /></label>
            <div className="peep-auth-form-grid">
              <label>Password<div className="peep-password-field"><input type={showPassword ? 'text' : 'password'} name="password" placeholder="At least 6 characters" onChange={handleChange} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}><i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}></i></button></div></label>
              <label>Confirm password<div className="peep-password-field"><input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Repeat your password" onChange={handleChange} required /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} title={showConfirmPassword ? 'Hide password' : 'Show password'}><i className={`ti ${showConfirmPassword ? 'ti-eye-off' : 'ti-eye'}`}></i></button></div></label>
            </div>
            <div className="peep-auth-form-grid">
              <label>Street<input type="text" name="address.street" placeholder="Street address" onChange={handleChange} required /></label>
              <label>Country<select name="address.country" value={form.address.country} onChange={handleChange} required><option value="">Select country</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>
              <label>State{selectedLocation ? <select name="address.state" value={form.address.state} onChange={handleChange} required><option value="">Select state or region</option>{Object.keys(selectedLocation.states).map((state) => <option key={state} value={state}>{state}</option>)}</select> : <input type="text" name="address.state" placeholder="State / region" onChange={handleChange} />}</label>
              <label>City{selectedLocation && form.address.state ? <select name="address.city" value={form.address.city} onChange={handleChange} required><option value="">Select city</option>{selectedLocation.states[form.address.state].map((city) => <option key={city} value={city}>{city}</option>)}</select> : <input type="text" name="address.city" placeholder="City" onChange={handleChange} />}</label>
              <label>Zip code<input type="text" name="address.zipCode" placeholder="Postal code" onChange={handleChange} required /></label>
            </div>
            <label>Phone / WhatsApp<div className="peep-phone-field"><select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} aria-label="Country calling code"><option value="+233">+233</option><option value="+234">+234</option></select><input type="tel" name="phoneNumber" value={phoneNumber} placeholder="50 303 5014" onChange={handleChange} required /></div></label>
            <label className="peep-terms-check"><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} /><span>I agree to the <a href="/contact">terms and conditions</a> and privacy policy.</span></label>
            <button type="submit" className="btn btn-primary peep-auth-submit" disabled={!isFormComplete || isSubmitting}>{isSubmitting ? <><span className="peep-button-spinner"></span> Creating account...</> : <>Create account <i className="ti ti-arrow-right"></i></>}</button>
          </form>
          <p className="peep-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </section>
      </div>
    </div>
  );
};

export default Register;