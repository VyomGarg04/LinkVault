'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            // If we have a user from hydration/local storage but partial, fetch full
            // Actually currently we only fetch on mount.
            try {
                const { data } = await api.get('/auth/me');
                if (data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // If it's 401, we just set user to null
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (data: any) => {
        const res = await api.post('/auth/login', data);
        setUser(res.data.user);
        router.push('/dashboard');
    };

    const register = async (data: any) => {
        const res = await api.post('/auth/register', data);
        setUser(res.data.user);
        router.push('/dashboard');
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
