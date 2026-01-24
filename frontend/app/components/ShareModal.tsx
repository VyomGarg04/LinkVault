import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Copy, Download, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
    url: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareModal({ url, title, isOpen, onClose }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success("QR Code downloaded!");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-secondary border border-border-color rounded-2xl shadow-2xl p-6 glass-panel animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <Share2 className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Share your Link Vault</h2>
                    <p className="text-sm text-text-secondary mt-1">Get more visitors by sharing your unique link.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl mb-6 shadow-inner">
                    <QRCodeCanvas
                        id="qr-code"
                        value={url}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            readOnly
                            value={url}
                            className="flex-1 input-neon rounded-lg px-3 py-2.5 text-sm bg-tertiary border-border-light text-text-secondary"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-2.5 bg-tertiary border border-border-light rounded-lg hover:border-accent hover:text-accent transition-colors"
                            title="Copy Link"
                        >
                            {copied ? <CheckIcon /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download QR Code
                    </button>
                </div>
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-500"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
