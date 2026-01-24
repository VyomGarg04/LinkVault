'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, User as UserIcon, X, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';

export default function ProfileSettingsPage() {
    const { user, setUser, isLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [loading, setLoading] = useState(false);

    // Cropping States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
        if (user) {
            setName(user.name || '');
            setUsername(user.username || '');
            setAvatar(user.avatar || '');
        }
    }, [isLoading, user, router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', { name, username, avatar });
            setUser(data.user);
            toast.success("Profile updated");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) return toast.error("File too large (Max 10MB)");
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
                setZoom(1);
                setCrop({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropSave = async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            setAvatar(croppedImage);
            setIsCropping(false);
            setImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (e) {
            toast.error("Failed to crop image");
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (isLoading || !user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Cropping Modal */}
            {isCropping && imageSrc && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden flex flex-col h-[500px]">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-semibold text-lg">Crop Profile Picture</h3>
                            <button onClick={handleCropCancel} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="relative flex-1 bg-slate-950">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={true}
                                cropShape="round"
                            />
                        </div>
                        <div className="p-4 bg-slate-800/50 border-t border-slate-800 space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="text-xs text-slate-400 font-medium">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button onClick={handleCropCancel} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleCropSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center space-x-2">
                                    <Check className="w-4 h-4" />
                                    <span>Set Picture</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
                    <Link href="/dashboard/settings" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">Profile Settings</h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handleProfileUpdate} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                            {avatar ? (
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl text-slate-500 font-bold">{name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-2 bg-indigo-500/10 px-4 py-2 rounded-lg transition-colors border border-indigo-500/20">
                                <Upload className="w-4 h-4" />
                                <span>Upload New Picture</span>
                            </button>
                            <p className="text-xs text-slate-500">Max 5MB. JPG, PNG.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Display Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Username</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium flex items-center space-x-2 disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
