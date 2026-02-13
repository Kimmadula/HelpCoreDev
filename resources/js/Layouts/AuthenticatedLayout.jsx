import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    // Initialize sidebar based on localStorage or screen size
    const [showingSidebar, setShowingSidebar] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-open');
            if (saved !== null) {
                return JSON.parse(saved);
            }
            return window.innerWidth >= 1024; // Default open on large screens
        }
        return false; // Default closed for SSR/initial render
    });

    // Persist state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-open', JSON.stringify(showingSidebar));
        }
    }, [showingSidebar]);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            {/* 
                Mobile: fixed, transform translates in/out. Width always 64.
                Desktop: relative (static in flex), width animates 0 <-> 64.
            */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col
                    w-64
                    ${showingSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    lg:static lg:inset-auto lg:z-auto
                    ${showingSidebar ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
                `}
            >
                {/* Content Wrapper - helps with clean hiding when width is 0 */}
                <div className={`flex flex-col h-full ${!showingSidebar && 'lg:hidden'}`}>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <ApplicationLogo className="w-6 h-6 fill-current text-slate-800" />
                            </div>
                            <span className="text-xl font-bold whitespace-nowrap">Admin</span>

                            {/* Mobile close button */}
                            <button
                                className="ml-auto lg:hidden text-gray-400 hover:text-white"
                                onClick={() => setShowingSidebar(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <nav className="space-y-2 flex-1">
                            <Link
                                href={route('admin.products')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${route().current('admin.products')
                                    ? 'bg-slate-700 text-white'
                                    : 'text-gray-300 hover:bg-slate-700'
                                    }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <span className="text-sm font-medium">PRODUCTS</span>
                            </Link>

                            <Link
                                href={route('admin.users') || '/admin/users'}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${route().current('admin.users')
                                    ? 'bg-slate-700 text-white'
                                    : 'text-gray-300 hover:bg-slate-700'
                                    }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-sm font-medium">USERS</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Logout at bottom */}
                    <div className="mt-auto p-4 border-t border-slate-700">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors whitespace-nowrap"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm font-medium">LOG OUT</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile sidebar */}
            {showingSidebar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setShowingSidebar(false)}
                ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Hamburger Menu - Visible on all screens */}
                            <button
                                onClick={() => setShowingSidebar(!showingSidebar)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Dynamic Title */}
                            <div className="text-xl font-semibold text-gray-800">
                                {header || 'Dashboard'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* User Profile */}
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">Administrator</div>
                                </div>
                                <Link
                                    href={route('profile.edit')}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity"
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}