import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Seo, PasswordInput, Field, Seal } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [state, setState] = useState({ busy: false, err: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (mode === 'register' && f.password !== f.confirm) return setState({ busy: false, err: 'Passwords do not match.' });
    setState({ busy: true, err: '' });
    try {
      const u = mode === 'login' ? await login(f.email, f.password) : await register(f.name, f.email, f.password);
      nav(loc.state?.from || (u.role === 'admin' ? '/admin/reservations' : '/my-reservations'), { replace: true });
    } catch (er) { setState({ busy: false, err: er.message }); }
  }

  return (
    <section className="auth">
      <Seo title={mode === 'login' ? 'Sign In' : 'Create Account'} description="Sign in to The Red Lantern to manage your reservations." />
      <div className="auth-card">
        <Seal size={56} />
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <form onSubmit={submit} className="form dark-form" noValidate={false}>
          {mode === 'register' && <Field label="Full Name" id="a-name"><input id="a-name" required value={f.name} onChange={set('name')} autoComplete="name" /></Field>}
          <Field label="Email" id="a-email"><input id="a-email" type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></Field>
          <PasswordInput id="a-pw" label="Password" value={f.password} onChange={set('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            hint={mode === 'register' ? 'At least 8 characters, with letters and numbers.' : undefined} />
          {mode === 'register' && <PasswordInput id="a-pw2" label="Confirm Password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />}
          {state.err && <p className="form-err" role="alert">{state.err}</p>}
          <button className="btn btn-red wide" disabled={state.busy}>{state.busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        </form>
        <p className="muted center">
          {mode === 'login' ? 'New to The Red Lantern?' : 'Already have an account?'}{' '}
          <button className="textlink gold" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setState({ busy: false, err: '' }); }}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </section>
  );
}
