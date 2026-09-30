import { useEffect, useState } from 'react';

const CONSENT_KEY = 'peep-privacy-preferences';
const CONSENT_VERSION = 1;

const readConsent = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    return saved?.version === CONSENT_VERSION ? saved : null;
  } catch {
    return null;
  }
};

const PrivacyConsent = () => {
  const [consent, setConsent] = useState(readConsent);
  const [isOpen, setIsOpen] = useState(!readConsent());
  const [showOptions, setShowOptions] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const openSettings = () => {
      setShowOptions(true);
      setAnalytics(Boolean(consent?.analytics));
      setMarketing(Boolean(consent?.marketing));
      setIsOpen(true);
    };
    window.addEventListener('peep:open-privacy-settings', openSettings);
    return () => window.removeEventListener('peep:open-privacy-settings', openSettings);
  }, [consent]);

  const saveConsent = (nextAnalytics, nextMarketing) => {
    const nextConsent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(nextConsent));
    setConsent(nextConsent);
    setIsOpen(false);
    setShowOptions(false);
  };

  if (!isOpen) return null;

  return (
    <div className="peep-privacy-backdrop">
      <section
        className="peep-privacy-consent"
        role="dialog"
        aria-modal="true"
        aria-labelledby="peep-privacy-title"
        aria-describedby="peep-privacy-description"
      >
        <div className="peep-privacy-consent-heading">
          <span className="peep-privacy-icon" aria-hidden="true"><i className="ti ti-shield-check"></i></span>
          <div>
            <div className="section-eyebrow">Your privacy</div>
            <h2 id="peep-privacy-title">Choose your privacy settings</h2>
          </div>
        </div>
        <p id="peep-privacy-description">
          Essential storage keeps sign-in and shopping features working. Optional analytics and marketing storage are off
          unless you choose to enable them. You can change your choice at any time.
        </p>

        {showOptions && (
          <div className="peep-privacy-options">
            <div className="peep-privacy-option">
              <div><strong>Essential</strong><small>Required for security, sign-in and requested shopping features.</small></div>
              <input type="checkbox" checked disabled aria-label="Essential storage is always active" />
            </div>
            <label className="peep-privacy-option">
              <div><strong>Analytics</strong><small>Helps us understand and improve how the store is used.</small></div>
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
            </label>
            <label className="peep-privacy-option">
              <div><strong>Marketing</strong><small>Allows optional marketing and advertising storage.</small></div>
              <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
            </label>
            <p className="peep-privacy-note">No optional analytics or advertising trackers are currently activated on this site.</p>
          </div>
        )}

        <div className="peep-privacy-actions">
          {showOptions ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => saveConsent(false, false)}>Reject optional</button>
              <button type="button" className="btn btn-primary" onClick={() => saveConsent(analytics, marketing)}>Save choices</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => saveConsent(false, false)}>Reject optional</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowOptions(true)}>Customize</button>
              <button type="button" className="btn btn-primary" onClick={() => saveConsent(true, true)}>Accept all</button>
            </>
          )}
        </div>
        <a className="peep-privacy-policy-link" href="/privacy-policy">Read our Privacy Policy</a>
      </section>
    </div>
  );
};

export default PrivacyConsent;
