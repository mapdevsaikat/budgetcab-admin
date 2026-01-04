'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, DollarSign, LogOut, Menu, X, User, LayoutDashboard, Settings } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

interface NavbarProps {
    userEmail?: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/bookings') {
            return pathname === '/bookings';
        }
        return pathname.startsWith(path);
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Bookings', href: '/bookings', icon: Calendar },
        { name: 'Drivers', href: '/drivers', icon: Users },
        { name: 'Pricing', href: '/pricing', icon: DollarSign },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <nav className="bg-maahi-brand text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold tracking-tight text-white">
                                <span className="text-maahi-warn">Maahi</span>Cabs Admin
                            </span>
                        </div>
                        {/* Desktop Navigation */}
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                                        ? 'bg-maahi-accent text-white shadow-sm'
                                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User & SignOut - Desktop */}
                    <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
                        <div className="flex items-center text-sm text-gray-200">
                            <User className="w-4 h-4 mr-2" />
                            <span className="max-w-[150px] truncate" title={userEmail}>{userEmail}</span>
                        </div>
                        <form action={signOut}>
                            <button
                                type="submit"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-maahi-brand bg-maahi-warn hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maahi-warn transition-colors shadow-sm"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </button>
                        </form>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden bg-maahi-brand border-t border-white/10">
                    <div className="pt-2 pb-3 space-y-1 px-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive(item.href)
                                    ? 'bg-maahi-accent text-white'
                                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-white/10">
                        <div className="flex items-center px-4 mb-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-maahi-warn" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-white">Admin User</div>
                                <div className="text-sm font-medium text-gray-300 truncate">{userEmail}</div>
                            </div>
                        </div>
                        <div className="px-2">
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-maahi-brand bg-maahi-warn hover:bg-yellow-400 shadow-sm"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
