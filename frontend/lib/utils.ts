import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getFaviconUrl(url: string) {
    try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch (e) {
        return null;
    }
}
