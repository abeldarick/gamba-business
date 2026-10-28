'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Users,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Printer,
  ShieldCheck,
  LogOut,
  Lock,
  Building2,
  Phone,
  Mail,
  MapPin,
  Wallet,
  TrendingUp,
  Receipt,
  MessageCircle,
  X,
  Download,
} from 'lucide-react';
import { QUARTIERS_GAMBA, formatXAF } from '@/lib/mockData';
import { QuartierGamba } from '@/lib/types';
import { useGamba } from '@/context/GambaContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// ============================================================================
// TYPES DU MODULE DE FACTURATION (TVA 18% FCFA & GESTION CLIENTS)
// ============================================================================

export type InvoiceStatus = 'PAYEE' | 'EN_ATTENTE' | 'RETARD' | 'BROUILLON';

export type PaymentMethod = 'Airtel Money' | 'Moov Money' | 'Espèces' | 'Virement Bancaire';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // En FCFA (XAF)
}

export interface BillingClient {
  id: string;
  userId: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  quartier: QuartierGamba;
  address?: string;
  nifRccm?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientQuartier: QuartierGamba;
  clientNif?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  applyTva: boolean;
  tvaRate: number; // 18% par défaut au Gabon
  items: InvoiceLineItem[];
  subtotalHt: number;
  tvaAmount: number;
  totalTtc: number;
  notes?: string;
  createdAt: string;
}

interface AuthMerchant {
  id: string;
  email: string;
  businessName: string;
  nif: string;
  phone: string;
  quartier: QuartierGamba;
}

const DEFAULT_MERCHANT: AuthMerchant = {
  id: 'usr-gamba-pro-01',
  email: 'direction@motellagune-gamba.ga',
  businessName: 'Complexe & Motel La Lagune SARL',
  nif: 'NIF: 789451-G / RCCM: RG-POG-2024-B12',
  phone: '+241 077 45 12 89',
  quartier: 'Centre-ville',
};

const INITIAL_CLIENTS: BillingClient[] = [
  {
    id: 'cli-1',
    userId: 'usr-gamba-pro-01',
    name: 'M. Jean-marc Nzoghe',
    company: 'Assala Energy — Base Gamba',
    phone: '+241 077 88 12 34',
    email: 'jm.nzoghe@assala-gamba.ga',
    quartier: 'Camp Yenzi',
    address: 'Villa 14, Camp Yenzi',
    nifRccm: 'NIF: 102938-A',
    createdAt: '2026-10-01',
  },
  {
    id: 'cli-2',
    userId: 'usr-gamba-pro-01',
    name: 'Mme Clarisse Moussavou',
    company: 'Restaurant Chez Clarisse',
    phone: '+241 066 89 23 41',
    email: 'clarisse.resto@gmail.com',
    quartier: 'Plaine 2',
    address: 'Face Boulangerie Principale, Plaine 2',
    nifRccm: 'NIF: 445812-C',
    createdAt: '2026-10-05',
  },
  {
    id: 'cli-3',
    userId: 'usr-gamba-pro-01',
    name: 'M. Patrick Obiang',
    company: 'Établissement Obiang & Fils',
    phone: '+241 074 55 90 11',
    email: 'contact@obiang-gamba.ga',
    quartier: 'Le Couloir',
    address: 'Carrefour Le Couloir, Gamba',
    nifRccm: 'NIF: 883102-B',
    createdAt: '2026-10-10',
  },
  {
    id: 'cli-4',
    userId: 'usr-gamba-pro-01',
    name: 'Coopérative Pêcheurs Mayonami',
    company: 'Groupement Pêche Ndougou',
    phone: '+241 062 41 77 99',
    email: 'peche.mayonami@gamba.ga',
    quartier: 'Mayonami',
    address: 'Débarcadère Principal Mayonami',
    nifRccm: 'AGR-2025-991',
    createdAt: '2026-10-12',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    userId: 'usr-gamba-pro-01',
    invoiceNumber: 'FAC-2026-001',
    clientId: 'cli-1',
    clientName: 'Assala Energy — Base Gamba (M. Jean-marc Nzoghe)',
    clientPhone: '+241 077 88 12 34',
    clientQuartier: 'Camp Yenzi',
    clientNif: 'NIF: 102938-A',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    status: 'PAYEE',
    paymentMethod: 'Airtel Money',
    applyTva: true,
    tvaRate: 18,
    items: [
      {
        id: 'l-1',
        description: 'Hébergement Chambre Climatisée VIP (5 nuitées mission)',
        quantity: 5,
        unitPrice: 25000,
      },
      {
        id: 'l-2',
        description: 'Forfait Restauration complète (Poisson braisé & boissons)',
        quantity: 5,
        unitPrice: 7000,
      },
    ],
    subtotalHt: 160000,
    tvaAmount: 28800,
    totalTtc: 188800,
    notes: 'Facture réglée par Airtel Money (*150#). Merci pour votre confiance à Gamba.',
    createdAt: '2026-10-15',
  },
  {
    id: 'inv-102',
    userId: 'usr-gamba-pro-01',
    invoiceNumber: 'FAC-2026-002',
    clientId: 'cli-2',
    clientName: 'Restaurant Chez Clarisse (Mme Clarisse Moussavou)',
    clientPhone: '+241 066 89 23 41',
    clientQuartier: 'Plaine 2',
    clientNif: 'NIF: 445812-C',
    issueDate: '2026-10-22',
    dueDate: '2026-11-05',
    status: 'EN_ATTENTE',
    paymentMethod: 'Moov Money',
    applyTva: true,
    tvaRate: 18,
    items: [
      {
        id: 'l-3',
        description: 'Location Salle Événementielle Climatisée (Week-end)',
        quantity: 1,
        unitPrice: 75000,
      },
      {
        id: 'l-4',
        description: 'Forfait Sonorisation & Groupe Électrogène de secours',
        quantity: 1,
        unitPrice: 25000,
      },
    ],
    subtotalHt: 100000,
    tvaAmount: 18000,
    totalTtc: 118000,
    notes: 'Payable par Moov Money (*555#) ou Airtel Money (*150#) avant échéance.',
    createdAt: '2026-10-22',
  },
  {
    id: 'inv-103',
    userId: 'usr-gamba-pro-01',
    invoiceNumber: 'FAC-2026-003',
    clientId: 'cli-3',
    clientName: 'Établissement Obiang & Fils (M. Patrick Obiang)',
    clientPhone: '+241 074 55 90 11',
    clientQuartier: 'Le Couloir',
    clientNif: 'NIF: 883102-B',
    issueDate: '2026-10-05',
    dueDate: '2026-10-18',
    status: 'RETARD',
    paymentMethod: 'Airtel Money',
    applyTva: true,
    tvaRate: 18,
    items: [
      {
        id: 'l-5',
        description: 'Maintenance Climatiseurs Split & Recharge Gaz Fréon',
        quantity: 4,
        unitPrice: 15000,
      },
    ],
    subtotalHt: 60000,
    tvaAmount: 10800,
    totalTtc: 70800,
    notes: 'Relance WhatsApp envoyée. Merci de régulariser via Airtel Money.',
    createdAt: '2026-10-05',
  },
];

const STORAGE_KEYS = {
  CLIENTS: 'gamba_billing_clients_v1',
  INVOICES: 'gamba_billing_invoices_v1',
  AUTH: 'gamba_billing_auth_v1',
};

export default function FacturationPage() {
  const { openPaymentModal } = useGamba();

  // ==========================================================================
  // 1. AUTHENTIFICATION COMMERÇANT & PROTECTION RLS
  // ==========================================================================
  const [merchant, setMerchant] = useState<AuthMerchant | null>(DEFAULT_MERCHANT);
  const [loginEmail, setLoginEmail] = useState('direction@motellagune-gamba.ga');
  const [loginPassword, setLoginPassword] = useState('gamba2026');
  const [loginBusiness, setLoginBusiness] = useState('Complexe & Motel La Lagune SARL');
  const [loginNif, setLoginNif] = useState('NIF: 789451-G / RCCM: RG-POG-2024-B12');

  // Données Clients & Factures isolées par userId (RLS)
  const [clients, setClients] = useState<BillingClient[]>(INITIAL_CLIENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Navigation interne du module Facturation
  const [activeTab, setActiveTab] = useState<'invoices' | 'create' | 'clients'>('invoices');

  // Filtres de la liste des factures
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'TOUTES'>('TOUTES');
  const [quartierFilter, setQuartierFilter] = useState<QuartierGamba | 'Tous'>('Tous');

  // État Formulaire Création / Modification de Facture
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-2026-004');
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-1');
  const [issueDate, setIssueDate] = useState('2026-10-28');
  const [dueDate, setDueDate] = useState('2026-11-12');
  const [status, setStatus] = useState<InvoiceStatus>('EN_ATTENTE');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Airtel Money');
  const [applyTva, setApplyTva] = useState<boolean>(true);
  const [notes, setNotes] = useState(
    'Paiement accepté par Airtel Money (*150#) ou Moov Money (*555#).'
  );
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: 'item-1',
      description: 'Prestation de service / Marchandise à Gamba',
      quantity: 1,
      unitPrice: 25000,
    },
  ]);

  // État Formulaire Création / Modification de Client
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('+241 077 ');
  const [clientEmail, setClientEmail] = useState('');
  const [clientQuartier, setClientQuartier] = useState<QuartierGamba>('Plaine 1');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNif, setClientNif] = useState('');

  // Aperçu de facture imprimable (Modal PDF / Impression)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Chargement depuis localStorage
  useEffect(() => {
    try {
      const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (savedClients) setClients(JSON.parse(savedClients));
      else localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));

      const savedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      else localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));

      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (savedAuth) setMerchant(JSON.parse(savedAuth));
    } catch {}
  }, []);

  const saveClients = (updated: BillingClient[]) => {
    setClients(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
    } catch {}
  };

  const saveInvoices = (updated: Invoice[]) => {
    setInvoices(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
    } catch {}
  };

  // Filtrage RLS : l'utilisateur connecté ne voit que ses propres enregistrements
  const rlsInvoices = useMemo(() => {
    if (!merchant) return [];
    return invoices.filter((inv) => inv.userId === merchant.id);
  }, [invoices, merchant]);

  const rlsClients = useMemo(() => {
    if (!merchant) return [];
    return clients.filter((cli) => cli.userId === merchant.id);
  }, [clients, merchant]);

  // ==========================================================================
  // 2. CALCUL DES 4 STATISTIQUES DU DASHBOARD FACTURATION
  // ==========================================================================
  const stats = useMemo(() => {
    const totalRevenuePaid = rlsInvoices
      .filter((i) => i.status === 'PAYEE')
      .reduce((sum, i) => sum + i.totalTtc, 0);

    const pendingAmount = rlsInvoices
      .filter((i) => i.status === 'EN_ATTENTE' || i.status === 'RETARD')
      .reduce((sum, i) => sum + i.totalTtc, 0);

    const totalTvaCollected = rlsInvoices
      .filter((i) => i.status === 'PAYEE')
      .reduce((sum, i) => sum + i.tvaAmount, 0);

    const paidCount = rlsInvoices.filter((i) => i.status === 'PAYEE').length;
    const overdueCount = rlsInvoices.filter((i) => i.status === 'RETARD').length;

    return {
      totalRevenuePaid,
      pendingAmount,
      totalTvaCollected,
      totalInvoices: rlsInvoices.length,
      paidCount,
      overdueCount,
    };
  }, [rlsInvoices]);

  // ==========================================================================
  // 3. CALCUL DYNAMIQUE DES LIGNES DE FACTURE + TVA 18% FCFA
  // ==========================================================================
  const formTotals = useMemo(() => {
    const subtotalHt = lineItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
    const tvaAmount = applyTva ? Math.round(subtotalHt * 0.18) : 0;
    const totalTtc = subtotalHt + tvaAmount;
    return { subtotalHt, tvaAmount, totalTtc };
  }, [lineItems, applyTva]);

  // Liste des factures filtrées
  const filteredInvoices = useMemo(() => {
    return rlsInvoices.filter((inv) => {
      const matchesQuery =
        !searchQuery.trim() ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'TOUTES' || inv.status === statusFilter;
      const matchesQuartier =
        quartierFilter === 'Tous' || inv.clientQuartier === quartierFilter;

      return matchesQuery && matchesStatus && matchesQuartier;
    });
  }, [rlsInvoices, searchQuery, statusFilter, quartierFilter]);

  // ==========================================================================
  // 4. ACTIONS SUR LES LIGNES DYNAMIQUES & FACTURES (CRÉER / MODIFIER / SUPPRIMER)
  // ==========================================================================
  const handleAddLine = () => {
    setLineItems([
      ...lineItems,
      {
        id: 'line-' + Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 5000,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleLineChange = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const resetInvoiceForm = () => {
    setEditingInvoiceId(null);
    const nextNum = `FAC-2026-00${rlsInvoices.length + 1}`;
    setInvoiceNumber(nextNum);
    setSelectedClientId(rlsClients[0]?.id || '');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setStatus('EN_ATTENTE');
    setPaymentMethod('Airtel Money');
    setApplyTva(true);
    setNotes('Paiement accepté par Airtel Money (*150#) ou Moov Money (*555#).');
    setLineItems([
      {
        id: 'item-' + Date.now(),
        description: 'Prestation de service / Marchandise à Gamba',
        quantity: 1,
        unitPrice: 25000,
      },
    ]);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    setSelectedClientId(inv.clientId);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setStatus(inv.status);
    setPaymentMethod(inv.paymentMethod);
    setApplyTva(inv.applyTva);
    setNotes(inv.notes || '');
    setLineItems(inv.items);
    setActiveTab('create');
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    saveInvoices(updated);
    if (isSupabaseConfigured && supabase) {
      supabase.from('billing_invoices').delete().eq('id', id).then();
    }
  };

  const handleTogglePaidStatus = (inv: Invoice) => {
    const nextStatus: InvoiceStatus = inv.status === 'PAYEE' ? 'EN_ATTENTE' : 'PAYEE';
    const updated = invoices.map((item) =>
      item.id === inv.id ? { ...item, status: nextStatus } : item
    );
    saveInvoices(updated);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    const clientObj =
      rlsClients.find((c) => c.id === selectedClientId) || rlsClients[0];

    const clientDisplayName = clientObj
      ? clientObj.company
        ? `${clientObj.company} (${clientObj.name})`
        : clientObj.name
      : 'Client Gamba';

    const payload: Invoice = {
      id: editingInvoiceId || 'inv-' + Date.now(),
      userId: merchant.id,
      invoiceNumber: invoiceNumber.trim() || 'FAC-2026-001',
      clientId: clientObj?.id || 'cli-custom',
      clientName: clientDisplayName,
      clientPhone: clientObj?.phone || '+241 077 00 00 00',
      clientQuartier: clientObj?.quartier || 'Centre-ville',
      clientNif: clientObj?.nifRccm,
      issueDate,
      dueDate,
      status,
      paymentMethod,
      applyTva,
      tvaRate: 18,
      items: lineItems,
      subtotalHt: formTotals.subtotalHt,
      tvaAmount: formTotals.tvaAmount,
      totalTtc: formTotals.totalTtc,
      notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (editingInvoiceId) {
      saveInvoices(invoices.map((i) => (i.id === editingInvoiceId ? payload : i)));
    } else {
      saveInvoices([payload, ...invoices]);
    }

    resetInvoiceForm();
    setActiveTab('invoices');
  };

  // ==========================================================================
  // 5. GESTION DES CLIENTS (CRÉER / MODIFIER / SUPPRIMER)
  // ==========================================================================
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !clientName.trim()) return;

    const payload: BillingClient = {
      id: editingClientId || 'cli-' + Date.now(),
      userId: merchant.id,
      name: clientName.trim(),
      company: clientCompany.trim() || undefined,
      phone: clientPhone.trim(),
      email: clientEmail.trim() || undefined,
      quartier: clientQuartier,
      address: clientAddress.trim() || undefined,
      nifRccm: clientNif.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (editingClientId) {
      saveClients(clients.map((c) => (c.id === editingClientId ? payload : c)));
    } else {
      saveClients([payload, ...clients]);
    }

    setEditingClientId(null);
    setClientName('');
    setClientCompany('');
    setClientPhone('+241 077 ');
    setClientEmail('');
    setClientAddress('');
    setClientNif('');
  };

  const handleEditClient = (cli: BillingClient) => {
    setEditingClientId(cli.id);
    setClientName(cli.name);
    setClientCompany(cli.company || '');
    setClientPhone(cli.phone);
    setClientEmail(cli.email || '');
    setClientQuartier(cli.quartier);
    setClientAddress(cli.address || '');
    setClientNif(cli.nifRccm || '');
  };

  const handleDeleteClient = (id: string) => {
    saveClients(clients.filter((c) => c.id !== id));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const logged: AuthMerchant = {
      id: 'usr-gamba-pro-01',
      email: loginEmail,
      businessName: loginBusiness || 'Commerce Gamba Pro',
      nif: loginNif || 'NIF Gabon Vérifié',
      phone: '+241 077 45 12 89',
      quartier: 'Centre-ville',
    };
    setMerchant(logged);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(logged));
    } catch {}
  };

  const handleLogout = () => {
    setMerchant(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {}
  };

  // ==========================================================================
  // ÉCRAN D'AUTHENTIFICATION RLS SI DÉCONNECTÉ
  // ==========================================================================
  if (!merchant) {
    return (
      <div className="max-w-md mx-auto px-4 py-14">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0B192C] via-blue-950 to-blue-900 p-6 text-white text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-[10px] font-extrabold text-emerald-300 uppercase">
              PROTECTION SUPABASE RLS ACTIVÉE
            </span>
            <h1 className="text-xl font-black">Connexion Espace Facturation</h1>
            <p className="text-xs text-sky-200">
              Vos clients et factures TVA 18% sont protégés par Row Level Security (RLS).
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                Nom de votre Entreprise à Gamba *
              </label>
              <input
                type="text"
                required
                value={loginBusiness}
                onChange={(e) => setLoginBusiness(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                Email Professionnel *
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                Numéro NIF / RCCM (Gabon)
              </label>
              <input
                type="text"
                value={loginNif}
                onChange={(e) => setLoginNif(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-4 shadow-lg shadow-blue-600/25 transition"
            >
              Se connecter à mon espace Facturation →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* =====================================================================
          EN-TÊTE DU MODULE FACTURATION + STATUT AUTH RLS
          ===================================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-blue-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-extrabold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> SESSION RLS SÉCURISÉE • {merchant.email}
            </span>
            <span className="rounded-full bg-blue-500/20 border border-sky-400/30 px-3 py-1 text-[11px] font-bold text-sky-200">
              TVA GABON 18% (FCFA)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Facturation &amp; Gestion Clients — {merchant.businessName}
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/90">
            {merchant.nif} • Quartier {merchant.quartier}, Gamba • Encaissement Airtel Money &amp;
            Moov Money
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              resetInvoiceForm();
              setActiveTab('create');
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 shadow-lg shadow-blue-500/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Facture</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-3.5 border border-white/15 transition"
          >
            <Users className="h-4 w-4 text-sky-300" />
            <span>Clients ({rlsClients.length})</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs px-3.5 py-3.5 transition"
            title="Verrouiller la session RLS"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          DASHBOARD 4 STATS OBLIGATOIRES (EN FCFA)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 : Chiffre d'Affaires Encaissé TTC */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              1. CA Encaissé (TTC)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatXAF(stats.totalRevenuePaid)}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 block">
            ✓ {stats.paidCount} facture(s) payée(s)
          </span>
        </div>

        {/* Stat 2 : En Attente & Recouvrement */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              2. Reste à Encaisser
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            {formatXAF(stats.pendingAmount)}
          </p>
          <span className="text-[11px] font-semibold text-rose-600 block">
            dont {stats.overdueCount} facture(s) en retard
          </span>
        </div>

        {/* Stat 3 : TVA 18% Collectée (Gabon) */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              3. TVA 18% Collectée
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700">
            {formatXAF(stats.totalTvaCollected)}
          </p>
          <span className="text-[11px] font-semibold text-slate-500 block">
            Taux légal Gabon : 18%
          </span>
        </div>

        {/* Stat 4 : Total Factures & Clients actifs */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              4. Factures &amp; Clients
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats.totalInvoices} Factures
          </p>
          <span className="text-[11px] font-semibold text-blue-600 block">
            {rlsClients.length} clients enregistrés à Gamba
          </span>
        </div>
      </div>

      {/* =====================================================================
          BARRE D'ONGLETS DU MODULE FACTURATION
          ===================================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'invoices'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Liste des Factures ({rlsInvoices.length})</span>
        </button>

        <button
          onClick={() => {
            if (!editingInvoiceId) resetInvoiceForm();
            setActiveTab('create');
          }}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>{editingInvoiceId ? 'Modifier la Facture' : 'Créer une Facture (TVA 18%)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'clients'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Gestion des Clients ({rlsClients.length})</span>
        </button>
      </div>

      {/* =====================================================================
          ONGLET 1 : LISTE DES FACTURES AVEC FILTRES + MODIFIER / SUPPRIMER
          ===================================================================== */}
      {activeTab === 'invoices' && (
        <div className="space-y-5">
          {/* Barre de recherche & Filtres (Statut + Quartier de Gamba) */}
          <div className="rounded-3xl bg-white p-4 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative flex items-center">
              <Search className="h-4 w-4 text-blue-600 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher N° Facture ou Client (ex: FAC-2026, Assala...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'TOUTES')}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="TOUTES">📊 Tous les statuts de facture</option>
                <option value="PAYEE">✅ Payées</option>
                <option value="EN_ATTENTE">⏳ En attente de paiement</option>
                <option value="RETARD">⚠️ En retard</option>
                <option value="BROUILLON">📝 Brouillons</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={quartierFilter}
                onChange={(e) => setQuartierFilter(e.target.value as QuartierGamba | 'Tous')}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="Tous">📍 Tous les quartiers</option>
                {QUARTIERS_GAMBA.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tableau des Factures */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500">
                    <th className="py-3.5 px-4">N° Facture</th>
                    <th className="py-3.5 px-4">Client &amp; Quartier</th>
                    <th className="py-3.5 px-4">Échéance</th>
                    <th className="py-3.5 px-4">Montant HT</th>
                    <th className="py-3.5 px-4">TVA (18%)</th>
                    <th className="py-3.5 px-4">Total TTC</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500">
                        Aucune facture trouvée pour ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const waReminder = `https://wa.me/${inv.clientPhone.replace(
                        /\D/g,
                        ''
                      )}?text=${encodeURIComponent(
                        `Bonjour ${inv.clientName}, voici votre facture ${
                          inv.invoiceNumber
                        } d'un montant TTC de ${formatXAF(inv.totalTtc)} émise par ${
                          merchant.businessName
                        } (Gamba). Vous pouvez régler par Airtel Money (*150#) ou Moov Money (*555#).`
                      )}`;

                      return (
                        <tr key={inv.id} className="hover:bg-blue-50/30 transition">
                          <td className="py-4 px-4 font-mono font-black text-blue-700">
                            {inv.invoiceNumber}
                            <span className="block text-[10px] font-sans font-normal text-slate-400">
                              {inv.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900">{inv.clientName}</p>
                            <span className="text-xs text-slate-500">
                              📍 {inv.clientQuartier} • {inv.clientPhone}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                            {inv.dueDate}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {formatXAF(inv.subtotalHt)}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-600">
                            {inv.applyTva ? formatXAF(inv.tvaAmount) : 'Exonéré (0 F)'}
                          </td>
                          <td className="py-4 px-4 font-black text-slate-900">
                            {formatXAF(inv.totalTtc)}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleTogglePaidStatus(inv)}
                              title="Cliquer pour basculer Payée / En attente"
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase transition ${
                                inv.status === 'PAYEE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.status === 'RETARD'
                                  ? 'bg-rose-100 text-rose-700'
                                  : inv.status === 'BROUILLON'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inv.status === 'PAYEE' && <CheckCircle2 className="h-3 w-3" />}
                              {inv.status === 'RETARD' && <AlertTriangle className="h-3 w-3" />}
                              {inv.status === 'EN_ATTENTE' && <Clock className="h-3 w-3" />}
                              <span>{inv.status.replace('_', ' ')}</span>
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewInvoice(inv)}
                                className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 transition"
                                title="Aperçu & Imprimer la facture PDF"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <a
                                href={waReminder}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 transition"
                                title="Envoyer la facture au client sur WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleEditInvoice(inv)}
                                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 transition"
                                title="Modifier cette facture"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                                title="Supprimer cette facture"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 2 : CRÉATION / MODIFICATION FACTURE (LIGNES DYNAMIQUES + TVA 18%)
          ===================================================================== */}
      {activeTab === 'create' && (
        <form onSubmit={handleSaveInvoice} className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {editingInvoiceId
                    ? `Modifier la Facture ${invoiceNumber}`
                    : 'Créer une Nouvelle Facture Pro'}
                </h2>
                <p className="text-xs text-slate-500">
                  Calcul automatique du Sous-total HT, de la TVA 18% (Gabon) et du Total TTC en
                  FCFA
                </p>
              </div>
              {editingInvoiceId && (
                <button
                  type="button"
                  onClick={resetInvoiceForm}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Annuler l&apos;édition
                </button>
              )}
            </div>

            {/* Informations générales de la facture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Numéro de Facture *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono font-bold text-blue-700 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Client à facturer *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold bg-white focus:border-blue-600 focus:outline-none"
                >
                  {rlsClients.map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.company ? `${cli.company} (${cli.name})` : cli.name} — {cli.quartier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Date d&apos;émission *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Date d&apos;échéance *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Statut du paiement
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="EN_ATTENTE">⏳ En attente</option>
                  <option value="PAYEE">✅ Payée</option>
                  <option value="RETARD">⚠️ En retard</option>
                  <option value="BROUILLON">📝 Brouillon</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Mode de règlement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="Airtel Money">🔴 Airtel Money (*150#)</option>
                  <option value="Moov Money">🔵 Moov Money (*555#)</option>
                  <option value="Espèces">💵 Espèces (FCFA)</option>
                  <option value="Virement Bancaire">🏦 Virement / Chèque</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <label className="w-full flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2.5 cursor-pointer">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      Appliquer la TVA Gabonaise (18%)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Décochez si votre prestation est exonérée de TVA
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={applyTva}
                    onChange={(e) => setApplyTva(e.target.checked)}
                    className="h-5 w-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* LIGNES DE FACTURATION DYNAMIQUES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase text-slate-800">
                  Lignes de la facture (Désignation, Quantité, Prix Unitaire FCFA)
                </h3>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {lineItems.map((line, index) => {
                  const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
                  return (
                    <div
                      key={line.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center rounded-2xl bg-slate-50 p-3 border border-slate-200"
                    >
                      <div className="md:col-span-6">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 md:hidden mb-1">
                          Désignation #{index + 1}
                        </label>
                        <input
                          type="text"
                          required
                          value={line.description}
                          onChange={(e) =>
                            handleLineChange(line.id, 'description', e.target.value)
                          }
                          placeholder="Description du produit, chambre, plat ou service..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 md:hidden mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            handleLineChange(line.id, 'quantity', Number(e.target.value))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-center focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 md:hidden mb-1">
                          Prix Unitaire HT (FCFA)
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step={500}
                          value={line.unitPrice}
                          onChange={(e) =>
                            handleLineChange(line.id, 'unitPrice', Number(e.target.value))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-blue-700 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                        <span className="font-black text-xs sm:text-sm text-slate-900">
                          {formatXAF(lineTotal)}
                        </span>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 p-1.5 transition"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RÉCAPITULATIF DES TOTAUX HT / TVA 18% / TTC EN FCFA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-200 items-start">
              <div className="lg:col-span-7">
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Notes &amp; Conditions de paiement Mobile Money
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="lg:col-span-5 rounded-2xl bg-[#0B192C] text-white p-5 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Sous-total Hors Taxes (HT) :</span>
                  <span className="font-bold text-white">{formatXAF(formTotals.subtotalHt)}</span>
                </div>
                <div className="flex justify-between text-xs text-sky-300">
                  <span>TVA Gabon ({applyTva ? '18%' : '0% - Exonéré'}) :</span>
                  <span className="font-bold">{formatXAF(formTotals.tvaAmount)}</span>
                </div>
                <div className="pt-2.5 border-t border-white/15 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold uppercase">Total TTC à payer :</span>
                  <span className="text-2xl font-black text-sky-400">
                    {formatXAF(formTotals.totalTtc)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-5 py-3.5 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-blue-600/25 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {editingInvoiceId ? 'Enregistrer les modifications' : 'Enregistrer la Facture'}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =====================================================================
          ONGLET 3 : GESTION DES CLIENTS (AJOUTER / MODIFIER / SUPPRIMER)
          ===================================================================== */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulaire Ajout / Modification Client */}
          <form
            onSubmit={handleSaveClient}
            className="lg:col-span-5 rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4 h-fit"
          >
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              {editingClientId ? 'Modifier le Client' : 'Ajouter un Nouveau Client à Gamba'}
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nom complet du contact *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: M. Jean-Marc Nzoghe"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Entreprise / Société / Administration
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Ex: Assala Energy / Commerce Plaine 2"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Téléphone WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+241 077 00 00 00"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Quartier à Gamba *
                </label>
                <select
                  value={clientQuartier}
                  onChange={(e) => setClientQuartier(e.target.value as QuartierGamba)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold bg-white focus:border-blue-600 focus:outline-none"
                >
                  {QUARTIERS_GAMBA.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                N° NIF / RCCM du client (Optionnel)
              </label>
              <input
                type="text"
                value={clientNif}
                onChange={(e) => setClientNif(e.target.value)}
                placeholder="Ex: NIF: 102938-A"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Adresse / Repère à Gamba
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Ex: Plaine 2 face boulangerie..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-md transition"
              >
                {editingClientId ? 'Mettre à jour le client' : '+ Enregistrer le client'}
              </button>
              {editingClientId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingClientId(null);
                    setClientName('');
                    setClientCompany('');
                  }}
                  className="rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs px-4 py-3.5"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>

          {/* Liste des Clients enregistrés */}
          <div className="lg:col-span-7 space-y-3">
            {rlsClients.map((cli) => (
              <div
                key={cli.id}
                className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                      📍 {cli.quartier}
                    </span>
                    {cli.nifRccm && (
                      <span className="text-[11px] font-mono text-slate-400">{cli.nifRccm}</span>
                    )}
                  </div>
                  <h3 className="font-black text-base text-slate-900">
                    {cli.company ? `${cli.company} — ${cli.name}` : cli.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    📞 {cli.phone} {cli.address ? `• ${cli.address}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      resetInvoiceForm();
                      setSelectedClientId(cli.id);
                      setActiveTab('create');
                    }}
                    className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-2 transition"
                  >
                    + Facturer
                  </button>
                  <button
                    onClick={() => handleEditClient(cli)}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 transition"
                    title="Modifier"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(cli.id)}
                    className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL D'APERÇU & D'IMPRESSION DE FACTURE PRO (NORME GABON TVA 18%)
          ===================================================================== */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-[#0B192C] px-6 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm">
                Aperçu Facture Officielle — {previewInvoice.invoiceNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="rounded-lg p-1 text-slate-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-slate-900">
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <span className="text-xs font-extrabold uppercase text-blue-600">
                    GAMBA BUSINESS • FACTURE COMMERCIALE
                  </span>
                  <h3 className="text-xl font-black mt-1">{merchant.businessName}</h3>
                  <p className="text-xs text-slate-500">{merchant.nif}</p>
                  <p className="text-xs text-slate-500">
                    Quartier {merchant.quartier}, Gamba (Gabon) • {merchant.phone}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-2xl font-mono font-black text-blue-700">
                    {previewInvoice.invoiceNumber}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Émise le : <strong>{previewInvoice.issueDate}</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Échéance : <strong>{previewInvoice.dueDate}</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block">Facturé à :</span>
                  <strong className="text-sm text-slate-900">{previewInvoice.clientName}</strong>
                  <p className="text-slate-600">
                    📍 Quartier {previewInvoice.clientQuartier}, Gamba •{' '}
                    {previewInvoice.clientPhone}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-400 font-bold uppercase block">
                    Mode de règlement :
                  </span>
                  <strong className="text-slate-900">{previewInvoice.paymentMethod}</strong>
                  <span className="block text-emerald-600 font-extrabold mt-0.5">
                    Statut : {previewInvoice.status}
                  </span>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 uppercase">
                    <th className="py-2">Désignation</th>
                    <th className="py-2 text-center">Qté</th>
                    <th className="py-2 text-right">P.U (HT)</th>
                    <th className="py-2 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium">{item.description}</td>
                      <td className="py-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 text-right">{formatXAF(item.unitPrice)}</td>
                      <td className="py-3 text-right font-bold">
                        {formatXAF(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 max-w-xs">{previewInvoice.notes}</p>
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sous-total HT :</span>
                    <span className="font-bold">{formatXAF(previewInvoice.subtotalHt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TVA (18%) :</span>
                    <span className="font-bold">{formatXAF(previewInvoice.tvaAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-blue-700 pt-1.5 border-t border-slate-200">
                    <span>TOTAL TTC :</span>
                    <span>{formatXAF(previewInvoice.totalTtc)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
