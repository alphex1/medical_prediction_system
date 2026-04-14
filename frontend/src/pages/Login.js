import React, { useState } from 'react';
import './Login.css';
import { db } from '../db';

/* ── tiny tab state machine ─────────────────────────────────────── */
export default function Login({ onLogin }) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'

  return tab === 'signin'
    ? <SignIn onLogin={onLogin} onSwitch={() => setTab('signup')} />
    : <SignUp onLogin={onLogin} onSwitch={() => setTab('signin')} />;
}

/* ══════════════════════════════════════════════════════════════════
   SIGN IN
══════════════════════════════════════════════════════════════════ */
function SignIn({ onLogin, onSwitch }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);
 

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      onLogin(data);
    }

  } catch (err) {
    setError("Server error");
  }

  setLoading(false);
};

  return (
    <AuthShell>
      <div className="auth-header">
        <span className="auth-logo-mark">✦</span>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to MediPredict</p>
      </div>

      <div className="auth-tabs">
        <button className="auth-tab auth-tab-active">Sign in</button>
        <button className="auth-tab" onClick={onSwitch}>Sign up</button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Email address">
          <InputWrap icon={<EmailIcon />}>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </InputWrap>
        </Field>

        <Field label="Password">
          <InputWrap icon={<LockIcon />} right={
            <button type="button" className="auth-eye" onClick={() => setShowPw(p => !p)}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }>
            <input className="auth-input" type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </InputWrap>
        </Field>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Signing in…</> : 'Sign in'}
        </button>

        <p className="auth-footer-text" style={{ textAlign: 'center', marginTop: 8 }}>
          Don't have an account?{' '}
          <button type="button" className="auth-link-btn" onClick={onSwitch}>Sign up</button>
        </p>
      </form>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SIGN UP
══════════════════════════════════════════════════════════════════ */
function SignUp({ onLogin, onSwitch }) {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [age, setAge]                 = useState('');
  const [gender, setGender]           = useState('');

  const strength = passwordStrength(password);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (password !== confirm) {
    setError('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        age,
        gender
      })
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      onLogin(data);
    }

  } catch (err) {
    setError("Server error");
  }

  setLoading(false);
};

  return (
    <AuthShell>
      <div className="auth-header">
        <span className="auth-logo-mark">✦</span>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join MediPredict for free</p>
      </div>

      <div className="auth-tabs">
        <button className="auth-tab" onClick={onSwitch}>Sign in</button>
        <button className="auth-tab auth-tab-active">Sign up</button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Full name">
          <InputWrap icon={<UserIcon />}>
            <input className="auth-input" type="text" placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </InputWrap>
        </Field>

        <Field label="Email address">
          <InputWrap icon={<EmailIcon />}>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </InputWrap>
        </Field>

        <Field label="Age">
          <InputWrap icon={<UserIcon />}>
            <input
              className="auth-input"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
         </InputWrap>
        </Field>

        <Field label="Gender">
         <InputWrap icon={<UserIcon />}>
           <select
             className="auth-input auth-select"
             value={gender}
             onChange={(e) => setGender(e.target.value)}
             required
           >
             <option value="">Select gender</option>
             <option value="Male">Male</option>
             <option value="Female">Female</option>
           </select>
         </InputWrap>
        </Field>
       
        <Field label="Password">
          <InputWrap icon={<LockIcon />} right={
            <button type="button" className="auth-eye" onClick={() => setShowPw(p => !p)}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }>
            <input className="auth-input" type={showPw ? 'text' : 'password'}
              placeholder="Create a password (min 6 chars)"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </InputWrap>
          {password && (
            <div className="auth-strength">
              <div className="auth-strength-bars">
                {[0,1,2].map(i => (
                  <div key={i} className="auth-strength-bar"
                    style={{ background: i < strength.level ? strength.color : 'var(--border-md)' }} />
                ))}
              </div>
              <span className="auth-strength-label" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </Field>

        <Field label="Confirm password">
          <InputWrap icon={<LockIcon />}>
            <input className="auth-input" type="password" placeholder="Re-enter your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </InputWrap>
          {confirm && confirm !== password && (
            <p className="auth-field-err">Passwords don't match</p>
          )}
        </Field>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Creating account…</> : 'Create account'}
        </button>

        <p className="auth-footer-text" style={{ textAlign: 'center', marginTop: 8 }}>
          Already have an account?{' '}
          <button type="button" className="auth-link-btn" onClick={onSwitch}>Sign in</button>
        </p>
      </form>
    </AuthShell>
  );
}

/* ── shared layout ───────────────────────────────────────────────── */
function AuthShell({ children }) {
  return (
    <div className="login">
      <div className="login-grid" />
      <div className="login-orb login-orb1" />
      <div className="login-orb login-orb2" />
      <main className="login-form-container">{children}</main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="login-field">
      <label className="login-label">{label}</label>
      {children}
    </div>
  );
}

function InputWrap({ icon, right, children }) {
  return (
    <div className="login-input-wrap">
      <span className="login-input-icon">{icon}</span>
      {children}
      {right && <span className="auth-input-right">{right}</span>}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────── */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function passwordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  const strong = pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
  const medium = pw.length >= 6;
  if (strong) return { level: 3, label: 'Strong', color: 'var(--teal)' };
  if (medium) return { level: 2, label: 'Fair',   color: 'var(--amber)' };
  return       { level: 1, label: 'Weak',   color: 'var(--red)' };
}

/* ── icons ───────────────────────────────────────────────────────── */
const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 5.5L8 10L14 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8" cy="11" r="1" fill="currentColor"/>
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 9.8M4.1 4.2C2.7 5.2 1.5 8 1.5 8S4 12.5 8 12.5c1.3 0 2.4-.4 3.4-1M7 3.6C7.3 3.5 7.7 3.5 8 3.5c4 0 6.5 4.5 6.5 4.5s-.6 1.2-1.6 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
