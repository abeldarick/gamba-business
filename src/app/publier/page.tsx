'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Phone,
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
  { label: 'Motel / Chambre', url: '/images/motel-lagune.svg' },
  { label: 'Resto / Grillades', url: '/images/resto-braise.svg' },
  { label: 'Bar / Boissons', url: '/images/bar-ambiance.svg' },
  { label: 'Salon / Coiffure', url: '/images/salon-beaute.svg' },
  { label: 'Boutique / Épicerie', url: '/images/boutique-pro.svg' },
  { label: 'Service / Froid', url: '/images/service-froid.svg' },
  { label: 'Mode / Vêtements', url: '/images/mode-gabon.svg' },
];

export default function PublierAnnoncePage() {
  const router = useRouter();
  const { addListing, openPaymentModal } = useGamba();

  const [title, setTitle] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [category, setCategory] = useState<CategoryId>('Boutiques');
  const [quartier, setQuartier] = useState<QuartierGamba>('Centre-ville');
  const [price, setPrice] = useState('5000');
  const [priceLabel, setPriceLabel] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('077 45 12 89');
  const [phone, setPhone] = useState('+241 077 45 12 89');
  const [addressHint, setAddressHint] = useState('');
  const [mapsUrl, setMapsUrl] = useState('https://www.google.com/maps?q=-2.7258,10.0172');
  const [images, setImages] = useState<string[]>(['/images/boutique-pro.svg']);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('free');
  const [gpsStatus, setGpsStatus] = useState('');

  // Gestion de l'upload local d'images (jusqu'à 4 photos max)
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

  // Détection GPS automatique pour Google Maps à Gamba
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Géolocalisation non supportée sur ce navigateur.');
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
        // Coordonnées par défaut du centre de Gamba (Gabon)
        setMapsUrl('https://www.google.com/maps?q=-2.7258,10.0172');
        setGpsStatus('Position Gamba Centre appliquée ✓');
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const finalImages = images.length > 0 ? images : ['/images/boutique-pro.svg'];

    // On crée d'abord l'annonce en mode gratuit (ou en attente de boost)
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

    // Si le vendeur a choisi une offre payante (Découverte, Pro ou Business), on ouvre immédiatement CinetPay Mobile Money
    if (selectedPlan !== 'free') {
      openPaymentModal(selectedPlan, created.id);
    }

    router.push(`/annonce/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête de la page de publication */}
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-gamba-orange px-3 py-1 text-xs font-black uppercase">
          <Sparkles className="h-3.5 w-3.5" /> ESPACE VENDEURS &amp; COMMERÇANTS DE GAMBA
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Publier une annonce sur GAMBA BUSINESS
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Remplissez ce formulaire en 1 minute. Les clients de Gamba vous contacteront directement
          sur votre numéro WhatsApp !
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOC 1 : INFORMATIONS DU COMMERCE & DE L'ANNONCE */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store className="h-5 w-5 text-gamba-orange" />
            <span>1. Informations sur votre annonce</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Titre de l&apos;annonce *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Chambres climatisées Motel La Lagune / Poisson braisé frais..."
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-medium focus:border-gamba-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Nom du Commerce / Vendeur *
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Ex: Chez Maman Clarisse / Salon VIP"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-medium focus:border-gamba-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-bold bg-white focus:border-gamba-orange focus:outline-none"
              >
                {CATEGORIES_GAMBA.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
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
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-black text-gamba-orange focus:border-gamba-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Précision sur le prix (Optionnel)
              </label>
              <input
                type="text"
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                placeholder="Ex: / nuitée, / plat, À partir de..."
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-medium focus:border-gamba-orange focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Description détaillée *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez vos produits, tarifs, horaires d'ouverture, si vous livrez à domicile dans Gamba, si vous acceptez Airtel Money / Moov Money..."
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-medium focus:border-gamba-orange focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BLOC 2 : PHOTOS (MAX 4) */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-gamba-orange" />
              <span>2. Photos de l&apos;annonce (Max 4 photos)</span>
            </h2>
            <span className="text-xs font-bold text-gray-500">{images.length} / 4 photos</span>
          </div>

          {/* Grille d'aperçu des photos sélectionnées */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative h-32 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-900 group"
              >
                <img src={imgUrl} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700"
                  title="Supprimer cette photo"
                >
                  <X className="h-4 w-4" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-gamba-orange px-2 py-0.5 text-[10px] font-black text-white">
                    Photo principale
                  </span>
                )}
              </div>
            ))}

            {images.length < 4 && (
              <label className="h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-gamba-orange bg-gray-50 hover:bg-orange-50/40 flex flex-col items-center justify-center cursor-pointer transition p-3 text-center">
                <Upload className="h-6 w-6 text-gamba-orange mb-1" />
                <span className="text-xs font-bold text-gray-700">Ajouter une photo</span>
                <span className="text-[10px] text-gray-400">Depuis votre téléphone</span>
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

          {/* Visuels pros prêts à l'emploi si le commerçant n'a pas de photo sous la main */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              💡 Pas de photo sous la main ? Choisissez une affiche illustrée prête à l&apos;emploi :
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => addPresetImage(preset.url)}
                  className="rounded-lg border border-gray-200 hover:border-gamba-orange bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOC 3 : QUARTIER, GOOGLE MAPS & WHATSAPP */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="h-5 w-5 text-gamba-orange" />
            <span>3. Localisation à Gamba &amp; Numéro WhatsApp</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Quartier à Gamba *
              </label>
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value as QuartierGamba)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-bold bg-white focus:border-gamba-orange focus:outline-none"
              >
                {QUARTIERS_GAMBA.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Repère facile (Adresse locale) *
              </label>
              <input
                type="text"
                required
                value={addressHint}
                onChange={(e) => setAddressHint(e.target.value)}
                placeholder="Ex: En face de la boulangerie / À 100m du carrefour..."
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm font-medium focus:border-gamba-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Numéro WhatsApp (Pour recevoir les clients) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-3 text-xs font-bold text-gray-700">
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
                  className="w-full rounded-r-xl border border-gray-300 px-3.5 py-3 text-sm font-bold focus:border-gamba-orange focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Position Google Maps (Lien ou GPS)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://www.google.com/maps?q=..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-xs font-medium focus:border-gamba-orange focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs px-3 py-2"
                  title="Utiliser ma position GPS actuelle"
                >
                  <Compass className="h-4 w-4 text-gamba-orange" />
                  <span>Mon GPS</span>
                </button>
              </div>
              {gpsStatus && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">{gpsStatus}</p>
              )}
            </div>
          </div>
        </div>

        {/* BLOC 4 : CHOIX DE LA FORMULE (FREEMIUM 7 JOURS OU BOOST MOBILE MONEY) */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border-2 border-gamba-orange/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Crown className="h-5 w-5 text-gamba-orange" />
              <span>4. Choisissez la visibilité de votre annonce</span>
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Airtel Money &amp; Moov Money
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option Gratuite 7 jours */}
            <div
              onClick={() => setSelectedPlan('free')}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition ${
                selectedPlan === 'free'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-gray-900">ESSAI GRATUIT (7 JOURS)</span>
                <span className="font-black text-sm text-emerald-600">0 FCFA</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                1 annonce standard gratuite pendant 7 jours dans les résultats classiques.
              </p>
            </div>

            {/* Les 3 offres payantes */}
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition ${
                  selectedPlan === plan.id
                    ? 'border-gamba-orange bg-orange-50/60 shadow-sm'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-900">{plan.name}</span>
                  <span className="font-black text-sm text-gamba-orange">
                    {formatXAF(plan.priceXAF)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {plan.durationDays} jours • {plan.features[0]}
                </p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-black text-base py-4 px-6 shadow-xl shadow-orange-500/25 transition"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>
              {selectedPlan === 'free'
                ? 'Publier mon annonce gratuite (7 jours)'
                : `Publier et Payer avec Airtel / Moov Money (${formatXAF(
                    PRICING_PLANS.find((p) => p.id === selectedPlan)?.priceXAF || 0
                  )})`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
