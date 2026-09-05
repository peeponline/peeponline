import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

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

const GoogleCompleteProfile = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+233',
    phoneNumber: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const missingPhone = !user?.phone || !String(user.phone).trim();
  const missingAddress = !user?.address || !user.address.street || !user.address.city || !user.address.state || !user.address.country || !user.address.zipCode;

  useEffect(() => {
    const fullName = user?.name || '';
    const parts = fullName.split(' ');
    const first = parts.shift() || '';
    const last = parts.join(' ') || '';

    setForm((prev) => ({
      ...prev,
      firstName: first,
      lastName: last,
      email: user?.email || '',
      phoneCode: user?.phone?.startsWith('+') ? user.phone.split(' ')[0] : '+233',
      phoneNumber: user?.phone ? user.phone.replace(/^[+\d\s]*/, '').trim() : '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
      },
    }));
  }, [user]);

  const selectedLocation = locations[form.address.country];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormError('');

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
          ...(field === 'country' ? { state: '', city: '' } : {}),
          ...(field === 'state' ? { city: '' } : {}),
        },
      }));
      return;
    }

    if (name === 'phoneNumber') {
      setForm((prev) => ({ ...prev, phoneNumber: value.replace(/\D/g, '') }));
      return;
    }

    if (name === 'phoneCode') {
      setForm((prev) => ({ ...prev, phoneCode: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const cleanedPhoneNumber = form.phoneNumber.trim();
    const fullAddress = {
      street: form.address.street.trim(),
      city: form.address.city.trim(),
      state: form.address.state.trim(),
      zipCode: form.address.zipCode.trim(),
      country: form.address.country.trim(),
    };

    if (!user?.name && (!form.firstName.trim() || !form.lastName.trim())) {
      setFormError('Please complete your full name before continuing.');
      return;
    }

    if (!user?.email && !form.email.trim()) {
      setFormError('Please provide your email address before continuing.');
      return;
    }

    if (missingPhone && !cleanedPhoneNumber) {
      setFormError('Please add your phone number so we can contact you.');
      return;
    }

    if (missingAddress && (!fullAddress.street || !fullAddress.country || !fullAddress.state || !fullAddress.city || !fullAddress.zipCode)) {
      setFormError('Please add your delivery address details to finish your Google signup.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: user?.name || `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: user?.email || form.email.trim(),
        phone: user?.phone || `${form.phoneCode} ${cleanedPhoneNumber}`,
        address: user?.address ? { ...user.address, ...fullAddress } : fullAddress,
      };

      await api.put('/users/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(token, data.user);
      toast.success('Profile completed successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'We could not save your profile. Please try again.';
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="peep-google-profile-panel">
      <div className="peep-google-profile-header">
        <div>
          <div className="section-eyebrow">Profile setup</div>
          <h2>Complete your account</h2>
        </div>
        <span className="peep-google-profile-badge"><i className="ti ti-shield-check"></i> Required</span>
      </div>

      <p className="peep-google-profile-intro">Google gave us your basic details, but we still need a few essentials for delivery and support.</p>

      {formError && <div className="peep-auth-error" role="alert"><i className="ti ti-alert-circle"></i><span>{formError}</span></div>}

      <form onSubmit={handleSubmit} className="peep-google-profile-form">
        {!user?.name && (
          <div className="peep-google-profile-grid">
            <label>First name<input type="text" name="firstName" value={form.firstName} placeholder="John" onChange={handleChange} required /></label>
            <label>Last name<input type="text" name="lastName" value={form.lastName} placeholder="Mensah" onChange={handleChange} required /></label>
          </div>
        )}

        {!user?.email && (
          <label>Email<input type="email" name="email" value={form.email} placeholder="you@example.com" onChange={handleChange} required /></label>
        )}

        {missingPhone && (
          <label>Phone / WhatsApp
            <div className="peep-phone-field">
              <select name="phoneCode" value={form.phoneCode} onChange={handleChange} aria-label="Country calling code">
                <option value="+233">+233</option>
                <option value="+234">+234</option>
              </select>
              <input type="tel" name="phoneNumber" value={form.phoneNumber} placeholder="50 303 5014" onChange={handleChange} required />
            </div>
          </label>
        )}

        {missingAddress && (
          <div className="peep-google-profile-grid peep-google-profile-address-grid">
            <label>Street<input type="text" name="address.street" value={form.address.street} placeholder="Street address" onChange={handleChange} required /></label>
            <label>Country<select name="address.country" value={form.address.country} onChange={handleChange} required>
              <option value="">Select country</option>
              {countries.map((country) => <option key={country} value={country}>{country}</option>)}
            </select></label>

            <label>State{selectedLocation ? <select name="address.state" value={form.address.state} onChange={handleChange} required>
              <option value="">Select state or region</option>
              {Object.keys(selectedLocation.states).map((state) => <option key={state} value={state}>{state}</option>)}
            </select> : <input type="text" name="address.state" value={form.address.state} placeholder="State / region" onChange={handleChange} />}</label>

            <label>City{selectedLocation && form.address.state ? <select name="address.city" value={form.address.city} onChange={handleChange} required>
              <option value="">Select city</option>
              {selectedLocation.states[form.address.state]?.map((city) => <option key={city} value={city}>{city}</option>)}
            </select> : <input type="text" name="address.city" value={form.address.city} placeholder="City" onChange={handleChange} />}</label>

            <label>Zip code<input type="text" name="address.zipCode" value={form.address.zipCode} placeholder="Postal code" onChange={handleChange} required /></label>
          </div>
        )}

        <div className="peep-google-profile-actions">
          <button type="submit" className="btn btn-primary peep-auth-submit" disabled={loading}>
            {loading ? 'Saving profile...' : 'Continue to dashboard'}
          </button>
          <Link to="/login" className="peep-google-profile-link">Back to login</Link>
        </div>
      </form>
    </div>
  );
};

export default GoogleCompleteProfile;
