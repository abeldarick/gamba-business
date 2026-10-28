'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Sparkles,
  Store,
  Upload,
  X,
  Compass,
  Crown,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import {
  CATEGORIES_GAMBA,
  QUARTIERS_GAMBA,
  PRICING_PLANS,
  formatXAF,
} from '@/lib/mockData';
import { CategoryId, PlanTier, QuartierGamba } from '@/lib/types';

const PRESET_IMAGES = [
  {
    label: 'Photo Motel / Chambre',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Photo Poisson Braisé',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Photo Bar / Lounge',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Photo Salon Coiffure',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Photo Alimentation',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Photo Service Clim/Élec',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Photo Boutique Mode',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
  },
];

export default function PublierAnnoncePage() {
  const router = useRouter();
  const { addListing, openPaymentModal } = useGamba();

  const [title, setTitle] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [category, setCategory] = useState<CategoryId>('Boutiques');
  const [quartier, setQuartier] = useState<QuartierGamba>('Plaine 1');
  const [price, setPrice] = useState('5000');
  const [priceLabel, setPriceLabel] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('077 45 12 89');
  const [phone, setPhone] = useState('+241 077 45 12 89');
  const [addressHint, setAddressHint] = useState('');
  const [mapsUrl, setMapsUrl] = useState('https://www.google.com/maps?q=-2.7258,10.0172');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  ]);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('free');
  const [gpsStatus, setGpsStatus] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (images.length >= 4) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => (prev.length < 4 ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addPresetImage = (url: string) => {
    if (images.includes(url)) return;
    if (images.length >= 4) {
      setImages([url, ...images.slice(0, 3)]);
    } else {
      setImages([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Position Gamba Centre appliquée ✓');
      return;
    }
    setGpsStatus('Détection de votre position à Gamba...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapsUrl(`https://www.google.com/maps?q=${latitude.toFixed(5)},${longitude.toFixed(5)}`);
        setGpsStatus('Position Google Maps enregistrée avec succès ✓');
      },
      () => {
        setMapsUrl('https://www.google.com/maps?q=-2.7258,10.0172');
        setGpsStatus('Coordonnées GPS Gamba (Ndougou) enregistrées ✓');
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const finalImages =
      images.length > 0
        ? images
        : [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
          ];

    const created = addListing({
      title: title.trim(),
      sellerName: sellerName.trim() || 'Commerçant Gamba',
      category,
      quartier,
      price: Number(price) || 0,
      priceLabel: priceLabel.trim() || undefined,
      description: description.trim(),
      whatsapp: whatsapp.trim(),
      phone: phone.trim() || whatsapp.trim(),
      mapsUrl: mapsUrl.trim() || 'https://www.google.com/maps?q=-2.7258,10.0172',
      addressHint: addressHint.trim() || `Quartier ${quartier}, Gamba`,
      images: finalImages,
      planTier: 'free',
    });

    if (selectedPlan !== 'free') {
      openPaymentModal(selectedPlan, created.id);
    }

    router.push(`/annonce/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 text-xs font-extrabold uppercase">
          <Sparkles className="h-3.5 w-3.5" /> ESPACE VENDEURS &amp; COMMERÇANTS DE GAMBA
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Publier une annonce sur GAMBA BUSINESS
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Ajoutez vos informations et jusqu&apos;à 4 photos réelles. Les clients de Gamba vous
          écriront directement sur WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOC 1 */}
        <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="h-5 w-5 text-blue-600" />
            <span>1. Informations sur votre commerce ou produit</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Titre de l&apos;annonce *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Chambres climatisées Motel La Lagune / Carpe braisée fraîche..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Nom du Commerce / Vendeur *
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Ex: Chez Maman Clarisse / Salon VIP"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold bg-white focus:border-blue-600 focus:outline-none"
              >
                {CATEGORIES_GAMBA.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Prix en FCFA (XAF) *
              </label>
              <input
                type="number"
                required
                min={0}
                step={500}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-blue-700 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Unité de prix (Optionnel)
              </label>
              <input
                type="text"
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                placeholder="Ex: / nuitée, / plat, À partir de..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Description détaillée *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Précisez vos avantages : climatisation, groupe électrogène, livraison dans Gamba, paiement Airtel/Moov Money..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BLOC 2 : PHOTOS (MAX 4) */}
        <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span>2. Photos de l&apos;annonce (Max 4 photos)</span>
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {images.length} / 4 photos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group"
              >
                <img src={imgUrl} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow hover:bg-rose-700"
                  title="Supprimer cette photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <label className="h-28 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 flex flex-col items-center justify-center cursor-pointer transition p-3 text-center">
                <Upload className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-xs font-extrabold text-blue-700">+ Ajouter photo</span>
                <span className="text-[10px] text-slate-500">Galerie ou Caméra</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              📸 Ou choisissez une photo réelle professionnelle adaptée à votre activité :
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => addPresetImage(preset.url)}
                  className="rounded-xl border border-slate-200 hover:border-blue-600 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOC 3 : QUARTIER, GOOGLE MAPS & WHATSAPP */}
        <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>3. Quartier à Gamba &amp; Numéro WhatsApp</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Quartier à Gamba *
              </label>
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value as QuartierGamba)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold bg-white focus:border-blue-600 focus:outline-none"
              >
                {QUARTIERS_GAMBA.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Repère facile (Adresse locale) *
              </label>
              <input
                type="text"
                required
                value={addressHint}
                onChange={(e) => setAddressHint(e.target.value)}
                placeholder="Ex: Plaine 2 en face de la boulangerie / Carrefour Le Couloir..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Numéro WhatsApp (Pour recevoir les clients) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 px-3.5 text-xs font-bold text-slate-700">
                  🇬🇦 +241
                </span>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    setPhone(`+241 ${e.target.value}`);
                  }}
                  placeholder="077 45 12 89"
                  className="w-full rounded-r-xl border border-slate-300 px-4 py-3 text-sm font-bold focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Position Google Maps
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://www.google.com/maps?q=..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-xs font-medium focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2"
                >
                  <Compass className="h-4 w-4" />
                  <span>Mon GPS</span>
                </button>
              </div>
              {gpsStatus && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">{gpsStatus}</p>
              )}
            </div>
          </div>
        </div>

        {/* BLOC 4 : CHOIX DE LA FORMULE (ESSAI GRATUIT 2 JOURS OU BOOST MOBILE MONEY) */}
        <div className="rounded-3xl bg-white p-5 sm:p-7 border-2 border-blue-600/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              <span>4. Choisissez votre formule de visibilité</span>
            </h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              Airtel Money &amp; Moov Money
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option Gratuite 2 jours */}
            <div
              onClick={() => setSelectedPlan('free')}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition ${
                selectedPlan === 'free'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">ESSAI GRATUIT (2 JOURS)</span>
                <span className="font-black text-sm text-emerald-600">0 FCFA</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                1 annonce standard gratuite pendant 2 jours.
              </p>
            </div>

            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition ${
                  selectedPlan === plan.id
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{plan.name}</span>
                  <span className="font-black text-sm text-blue-600">
                    {formatXAF(plan.priceXAF)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {plan.durationDays} jours • {plan.features[0]}
                </p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base py-4 px-6 shadow-xl shadow-blue-600/25 transition"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>
              {selectedPlan === 'free'
                ? 'Publier mon annonce gratuite (2 jours)'
                : `Publier et Payer ${formatXAF(
                    PRICING_PLANS.find((p) => p.id === selectedPlan)?.priceXAF || 0
                  )} via Airtel / Moov Money`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
