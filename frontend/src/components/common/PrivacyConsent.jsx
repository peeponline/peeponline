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
          <div className="section-eyebrow">Privacy settings</div>
          <h2 id="peep-privacy-title">Choose how we use optional data</h2>
        </div>
        <p id="peep-privacy-description">
          We use essential storage for sign-in and shopping. Analytics and marketing are optional and off by default.
          Choose “Accept all” or “Reject optional,” or customize your choices. You can change them anytime in Cookie settings.
        </p>

        {showOptions && (
          <div className="peep-privacy-options">
            <div className="peep-privacy-option">
              <div><strong>Essential</strong><small>Required for sign-in, security and shopping.</small></div>
              <input type="checkbox" checked disabled aria-label="Essential storage is always active" />
            </div>
            <label className="peep-privacy-option">
              <div><strong>Analytics</strong><small>Helps us improve the store.</small></div>
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
            </label>
            <label className="peep-privacy-option">
              <div><strong>Marketing</strong><small>Allows optional marketing storage.</small></div>
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
