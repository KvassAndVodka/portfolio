'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGithub, FaLock, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setIsLoading(false);
        } else {
            window.location.href = '/admin';
        }
    };

    const handleGitHubLogin = () => {
        signIn('github', { callbackUrl: '/admin' });
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 hover:opacity-80 transition-opacity">
                        Javier Raut
                    </Link>
                    <p className="text-xs font-mono text-[var(--accent)] mt-2 uppercase tracking-widest">Admin /// Login</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-xl">
                    <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">Sign in to continue</h1>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Credentials Form */}
                    <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#0c0a09] px-2 text-stone-500">or continue with</span>
                        </div>
                    </div>

                    {/* GitHub Login */}
                    <button
                        onClick={handleGitHubLogin}
                        className="w-full py-3 bg-[#24292e] text-white font-medium rounded-lg hover:bg-[#1a1e22] transition-all flex items-center justify-center gap-3"
                    >
                        <FaGithub size={20} />
                        Sign in with GitHub
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-stone-500 mt-6">
                    <Link href="/" className="hover:text-[var(--accent)] transition-colors">
                        ← Back to site
                    </Link>
                </p>
            </div>
        </div>
    );
}
