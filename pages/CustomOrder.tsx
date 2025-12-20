
import React, { useState } from 'react';
import { UploadCloud, Send, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { CustomRequest } from '../types';

interface CustomOrderProps {
    onBack: () => void;
    onSubmit?: (data: Omit<CustomRequest, 'id' | 'date' | 'status'>) => void;
}

export const CustomOrder: React.FC<CustomOrderProps> = ({ onBack, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        description: '',
        material: 'PLA',
        color: 'Beyaz'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (onSubmit) {
            onSubmit(formData);
        }

        setStep(2);
        window.scrollTo(0,0);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <button 
                onClick={onBack}
                className="flex items-center text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
            >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Ana Sayfaya Dön
            </button>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4">Özel Tasarım & Baskı Hizmeti</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Hazır modellerle sınırlı kalmayın. Aklınızdaki tasarımı veya elinizdeki 3D model dosyasını bize gönderin, profesyonel kalitede üretelim.
                </p>
            </div>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                    <div className="bg-brand-50 text-brand-600 p-4 rounded-full mb-4">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">1. Dosyanı Gönder</h3>
                    <p className="text-sm text-slate-500">STL, OBJ dosyanı yükle veya fikrini detaylıca anlat.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">2. Teklif Al</h3>
                    <p className="text-sm text-slate-500">Uzmanlarımız modeli incelesin, sana en uygun fiyatı sunalım.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="bg-green-50 text-green-600 p-4 rounded-full mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">3. Kapına Gelsin</h3>
                    <p className="text-sm text-slate-500">Onayından sonra yüksek kalitede basıp kargolayalım.</p>
                </div>
            </div>

            {step === 1 ? (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header bg updated to brand color */}
                    <div className="bg-brand-600 p-6 text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Send size={20} />
                            Talep Oluştur
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                                <input 
                                    required
                                    type="email" 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tercih Edilen Materyal</label>
                                <select 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                                    value={formData.material}
                                    onChange={e => setFormData({...formData, material: e.target.value})}
                                >
                                    <option>PLA (Standart)</option>
                                    <option>PETG (Dayanıklı)</option>
                                    <option>TPU (Esnek)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                                <input 
                                    required
                                    type="tel" 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                                    placeholder="05..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Proje Detayları / Model Linki</label>
                            <textarea 
                                required
                                rows={4}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-white text-slate-900"
                                placeholder="Modelin boyutları, kullanım amacı veya varsa Thingiverse/Printables linkini buraya yapıştırabilirsiniz."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        {/* File Upload Simulation */}
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group bg-white">
                            <UploadCloud className="mx-auto h-12 w-12 text-slate-400 group-hover:text-brand-500 mb-3 transition-colors" />
                            <p className="text-sm text-slate-600 font-medium">Dosya Yükle (STL, OBJ, 3MF)</p>
                            <p className="text-xs text-slate-400 mt-1">Maksimum 50MB</p>
                            <input type="file" className="hidden" />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                                Talebi Gönder
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Talebiniz Alındı!</h2>
                    <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto">
                        Projenizi inceleyip en kısa sürede <strong>{formData.email}</strong> adresi üzerinden size fiyat teklifimizi ileteceğiz.
                    </p>
                    <button 
                        onClick={onBack}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                    >
                        Alışverişe Dön
                    </button>
                </div>
            )}
        </div>
    );
};
