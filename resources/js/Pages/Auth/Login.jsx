import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                .login-container {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .fade-in {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .input-focus:focus {
                    border-color: #FF7A59;
                    ring-color: rgba(255, 122, 89, 0.1);
                }
            `}</style>

            <div className="login-container w-full max-w-md mx-auto">
                {/* Status Message */}
                {status && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 fade-in">
                        {status}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-5 fade-in">
                    {/* Email Field */}
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Email address"
                            className="text-sm font-medium text-gray-700 mb-1.5"
                        />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="input-focus mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-100"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-1.5 text-sm" />
                    </div>

                    {/* Password Field */}
                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-sm font-medium text-gray-700 mb-1.5"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="input-focus mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-100"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-1.5 text-sm" />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Remember me
                            </span>
                        </div>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <PrimaryButton
                        className="w-full justify-center py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing}
                    >
                        {processing ? 'Logging in...' : 'Login'}
                    </PrimaryButton>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600 fade-in">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                        Register now
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}