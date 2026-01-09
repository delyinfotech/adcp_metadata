'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, storeAuth } from '@/lib/api';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formState, setFormState] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
    tenantSlug: 'demo',
  });

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const response = await login(formState.email, formState.password);
        storeAuth(response);
        router.push('/library');
      } else {
        const response = await register({
          email: formState.email,
          password: formState.password,
          firstName: formState.firstName,
          lastName: formState.lastName,
          username: formState.username,
          tenantSlug: formState.tenantSlug,
        });
        storeAuth(response);
        router.push('/library');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background-dark flex items-center justify-center p-6">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-status-processing/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">GEN21 MediaX AI</h1>
          <p className="text-text-muted mt-1">Intelligent Media Asset Management</p>
        </div>

        {/* Card */}
        <div className="bg-background-medium rounded-2xl border border-background-light p-8 shadow-xl">
          {/* Mode Toggle */}
          <div className="flex bg-background-light rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">First Name</label>
                    <input
                      className="w-full h-11 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                      placeholder="John"
                      value={formState.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">Last Name</label>
                    <input
                      className="w-full h-11 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                      placeholder="Doe"
                      value={formState.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">Username</label>
                    <input
                      className="w-full h-11 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                      placeholder="johndoe"
                      value={formState.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">Tenant</label>
                    <input
                      className="w-full h-11 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                      placeholder="demo"
                      value={formState.tenantSlug}
                      onChange={(e) => handleChange('tenantSlug', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-text-muted mb-1.5">Email</label>
              <input
                className="w-full h-11 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full h-11 px-4 pr-11 bg-background-light border border-background-hover rounded-lg text-white text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={formState.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-status-failed/10 border border-status-failed/20 rounded-lg text-status-failed text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-background-light rounded-lg">
            <p className="text-xs text-text-muted mb-2">Demo credentials:</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">admin@demo.mediax.ai</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">Admin123!</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
