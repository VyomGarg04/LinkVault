import { LinkStyle, ThemeConfig } from '@/types';
import { ExternalLink } from 'lucide-react';
import { getFaviconUrl } from '@/lib/utils';
import clsx from 'clsx';

interface LinkCardProps {
    link: any;
    theme: ThemeConfig;
    onClick: (id: string, url: string) => void;
}

export default function LinkCard({ link, theme, onClick }: LinkCardProps) {
    let customStyle: LinkStyle = {};
    try {
        if (link.style) {
            customStyle = JSON.parse(link.style);
        }
    } catch (e) { }

    // Merge styles: Custom takes precedence over Theme
    const bgColor = customStyle.bgColor || theme.buttonBgColor;
    const textColor = customStyle.textColor || theme.buttonTextColor;
    const fontFamily = customStyle.fontFamily || theme.fontFamily;

    // Animation Class
    const animationClass = customStyle.animation
        ? `animate-${customStyle.animation}`
        : '';

    // Highlight Class (e.g. green breathing glow if highlighted)
    const highlightClass = customStyle.highlight
        ? 'ring-2 ring-offset-2 ring-green-500 ring-offset-black/50'
        : 'border border-white/5';

    return (
        <div
            onClick={() => onClick(link.id, link.url)}
            className={clsx(
                'group w-full p-4 rounded-xl transition-all cursor-pointer flex items-center relative overflow-hidden shadow-md',
                'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
                animationClass,
                highlightClass
            )}
            style={{
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: fontFamily
            }}
        >
            {/* Inner Shine Animation (Only if no custom animation that might conflict) */}
            {!customStyle.animation && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            )}

            {/* Icon */}
            <div className="absolute left-4 w-10 h-10 flex items-center justify-center p-1 rounded-lg bg-black/10 group-hover:bg-white/10 transition-colors">
                {getFaviconUrl(link.url) ? (
                    <img
                        src={getFaviconUrl(link.url)!}
                        alt=""
                        className="w-full h-full object-contain opacity-90 group-hover:scale-110 transition-transform"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <ExternalLink className={`w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity ${getFaviconUrl(link.url) ? 'hidden' : ''}`} />
            </div>

            <div className="w-full text-center font-medium transition-colors text-lg pr-8 pl-8 truncate">
                {link.title}
            </div>

            {/* Hover Arrow */}
            <ExternalLink className="absolute right-4 w-4 h-4 opacity-0 group-hover:opacity-50 transition-all transform translate-x-2 group-hover:translate-x-0" />
        </div>
    );
}
