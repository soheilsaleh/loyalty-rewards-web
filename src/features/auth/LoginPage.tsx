import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { Button } from '../../components/Button';
import { useAuth } from '../../auth/useAuth';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState('customer@loyalty.test');
  const [password, setPassword] = useState('password');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          setFieldErrors({
            email: error.errors.email?.[0],
            password: error.errors.password?.[0],
          });
          setFormError('Please fix the highlighted fields.');
        } else if (error.status === 401) {
          setFormError('Email or password is incorrect.');
        } else if (error.status === 429) {
          setFormError('Too many attempts. Please wait a moment and try again.');
          setCooldown(true);
          window.setTimeout(() => setCooldown(false), 10_000);
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Network error. Please check that the API is running.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Loyalty<span className="text-indigo-600">Rewards</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in to view your points and redeem rewards.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}

          <Button type="submit" loading={submitting} disabled={cooldown} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          Demo account: <span className="font-medium">customer@loyalty.test</span> /{' '}
          <span className="font-medium">password</span>
        </p>
      </div>
    </div>
  );
}
