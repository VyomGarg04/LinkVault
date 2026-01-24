export interface User {
    id: string;
    email: string;
    name?: string;
    username: string;
    avatar?: string;
}

export interface LinkHub {
    id: string;
    slug: string;
    title: string;
    description?: string;
    theme?: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        links: number;
        visits: number;
    };
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface ThemeConfig {
    bgColor: string;
    textColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    fontFamily: string; // 'inter', 'roboto', 'playfair', 'mono'
    avatar?: string;
}

export interface LinkStyle {
    highlight?: boolean;
    bgColor?: string; // Override
    textColor?: string; // Override
    fontFamily?: string; // Override
    animation?: 'none' | 'pulse' | 'float' | 'glow';
}

export interface Link {
    id: string;
    title: string;
    url: string;
    icon?: string;
    isActive: boolean;
    position: number;
    style?: string; // JSON string of LinkStyle
    _count?: {
        clicks: number;
    }
}

export type LinkItem = Link;
