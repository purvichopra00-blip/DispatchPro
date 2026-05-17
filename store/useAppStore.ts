import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Tender {
  id: string;
  type: string;
  product: string;
  grade: string;
  qty: number;
  date: string;
  status: string;
  factoryName: string;
  factoryLocation: string;
  season: string;
  basePrice: number;
  totalBids: number;
  highestBid: number;
  yourLastBid: number | null;
}

export interface Bid {
  id: string;
  tenderId: string;
  factory: string;
  qty: number;
  price: number;
  status: string;
  date: string;
  gstin?: string;
  addressId?: string;
  notes?: string;
}

export interface Order {
  id: string;
  tenderId: string;
  companyName: string;
  product: string;
  grade: string;
  totalQty: number;
  dispatchedQty: number;
  remainingQty: number;
  totalAmount: number;
  status: string;
  paymentVerified: boolean;
  dispatchStatus?: string;
}

export interface Dispatch {
  id: string;
  orderId: string;
  factoryName: string;
  customerName: string;
  deliveryAddr: string;
  qty: number;
  vehicleNo: string;
  transporterName: string;
  status: string;
  date: string;
  notes?: string;
  gstin?: string;
}

export interface Contact {
  id: string;
  name: string;
  gstin: string;
  address: string;
  type: 'Buyer' | 'Self';
}

export interface Profile {
  name: string;
  phone: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Business {
  companyName: string;
  gstin: string;
  pan: string;
  address: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
}

export interface Notification {
  id: number;
  title: string;
  msg: string;
  time: string;
  type: string;
  unread: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

export interface Settings {
  pushNotifications: boolean;
  emailUpdates: boolean;
  whatsappAlerts: boolean;
  language: string;
}

export interface AppState {
  tenders: Tender[];
  bids: Bid[];
  orders: Order[];
  payments: any[];
  dispatches: Dispatch[];
  contacts: Contact[];
  profile: Profile;
  business: Business;
  notifications: Notification[];
  settings: Settings;
  documents: Document[];
  authUser: any | null;
  setAuthUser: (user: any) => void;
  clearAuthUser: () => void;
  updateProfile: (data: Partial<Profile>) => void;
  updateBusiness: (data: Partial<Business>) => void;
  clearNotifications: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addDocument: (doc: Omit<Document, 'id'>) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  deleteContact: (id: string) => void;
  addBid: (bidData: Omit<Bid, 'id' | 'status' | 'date'>) => void;
  acceptBid: (tenderId: string) => void;
  addDispatchRequest: (requestData: Omit<Dispatch, 'id' | 'status' | 'date'>) => void;
  updateDispatchRequest: (id: string, updatedData: Partial<Dispatch>) => void;
  addPayment: (paymentData: any) => void;
  verifyPayment: (orderId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tenders: [
        { 
          id: 'TND-2026-ASR', type: 'Open Tender', product: 'Sugar', grade: 'S-30', qty: 1000, date: '16 May 2026', status: 'Accepted',
          factoryName: 'ASR Sugar Factory', factoryLocation: 'Uttar Pradesh', season: '2025-26', basePrice: 3400,
          totalBids: 18, highestBid: 3450, yourLastBid: 3425
        },
        { 
          id: 'TND-2026-BLP', type: 'Open Tender', product: 'Sugar', grade: 'M-30', qty: 2500, date: '17 May 2026', status: 'Open',
          factoryName: 'Balrampur Sugar Mills', factoryLocation: 'Balrampur, UP', season: '2025-26', basePrice: 3500,
          totalBids: 4, highestBid: 3520, yourLastBid: null
        },
        { 
          id: 'TND-2026-TRV', type: 'Open Tender', product: 'Sugar', grade: 'L-31', qty: 1500, date: '17 May 2026', status: 'Open',
          factoryName: 'Triveni Sugar Factory', factoryLocation: 'Muzaffarnagar, UP', season: '2025-26', basePrice: 3480,
          totalBids: 2, highestBid: 3480, yourLastBid: null
        }
      ],
      bids: [
        { id: 'BID-9901', tenderId: 'TND-2026-ASR', factory: 'ASR Sugar Factory', qty: 1000, price: 3425, status: 'Accepted', date: '16 May 2026' }
      ], 
      orders: [
        {
          id: 'ORD-ASR-772',
          tenderId: 'TND-2026-ASR',
          companyName: 'ASR Sugar Factory',
          product: 'Sugar',
          grade: 'S-30',
          totalQty: 1000,
          dispatchedQty: 150,
          remainingQty: 850,
          totalAmount: 3425000,
          status: 'Ready for Dispatch',
          paymentVerified: true,
          dispatchStatus: 'Partially Requested'
        }
      ],
      payments: [],
      dispatches: [
        {
          id: 'DSP-9921',
          orderId: 'ORD-ASR-772',
          factoryName: 'ASR Sugar Factory',
          customerName: 'ABC Foods Pvt Ltd',
          deliveryAddr: 'Plot 42, Okhla Phase III, New Delhi',
          qty: 150,
          vehicleNo: 'UP-32-AA-1234',
          transporterName: 'Tyagi Logistics',
          status: 'Approved',
          date: '16 May 2026'
        }
      ],
      contacts: [
        { id: 'C-1', name: 'ABC Foods Pvt Ltd', gstin: '07AAAAA0000A1Z5', address: 'Plot 42, Okhla Phase III, New Delhi', type: 'Buyer' },
        { id: 'C-2', name: 'Global Traders', gstin: '27BBBBB1111B1Z2', address: 'Pimpri Industrial Area, Pune, Maharashtra', type: 'Buyer' },
        { id: 'C-3', name: 'Main Warehouse (Self)', gstin: '09RT9988A1Z5', address: 'Sector 15, Lucknow, UP', type: 'Self' },
      ],
      profile: {
        name: 'Rajesh Tyagi',
        phone: '+91 98765 43210',
        email: 'rajesh@tyagitraders.com',
        role: 'Proprietor',
        avatar: 'RT'
      },
      business: {
        companyName: 'Tyagi Traders & Logistics',
        gstin: '09RT9988A1Z5',
        pan: 'ABCPT1234F',
        address: '12/4, Transport Nagar, Lucknow, Uttar Pradesh',
        bankName: 'HDFC Bank',
        accountNo: '50100223344556',
        ifsc: 'HDFC0001234'
      },
      authUser: null,

      setAuthUser: (user) => set({ authUser: user }),
      clearAuthUser: () => set({ authUser: null }),

      updateProfile: (data) => set((state) => ({
        profile: { ...state.profile, ...data }
      })),

      updateBusiness: (data) => set((state) => ({
        business: { ...state.business, ...data }
      })),

      notifications: [
        { id: 1, title: 'Order Accepted', msg: 'Your bid for ASR Sugar (1000 QTL) has been accepted!', time: 'Just now', type: 'success', unread: true }
      ],

      settings: {
        pushNotifications: true,
        emailUpdates: false,
        whatsappAlerts: true,
        language: 'English'
      },

      clearNotifications: () => set({ notifications: [] }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      documents: [
        { id: 'D1', name: 'GST Certificate', type: 'Legal', date: '12 May 2026', size: '1.2 MB' }
      ],

      addDocument: (doc) => set((state) => ({
        documents: [{ id: `D-${Date.now()}`, ...doc }, ...state.documents]
      })),

      addContact: (contact) => set((state) => ({
        contacts: [{ id: `C-${Date.now()}`, ...contact }, ...state.contacts]
      })),

      deleteContact: (id) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== id)
      })),

      addBid: (bidData) => set((state) => {
        const newBidId = `BID-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          bids: [...state.bids, { id: newBidId, ...bidData, status: 'Under Review', date: new Date().toLocaleDateString('en-GB') }],
          tenders: state.tenders.map(t => t.id === bidData.tenderId ? { ...t, status: 'Under Review' } : t)
        };
      }),

      acceptBid: (tenderId) => set((state) => {
        const tender = state.tenders.find(t => t.id === tenderId);
        if (!tender) return state;
        const bid = state.bids.find(b => b.tenderId === tenderId);
        
        const qty = bid ? Number(bid.qty) : tender.qty;
        const price = bid ? Number(bid.price) : tender.basePrice;

        const newOrder = {
          id: `ORD-ASR-${Math.floor(100 + Math.random() * 900)}`,
          companyName: tender.factoryName,
          unitName: tender.factoryName,
          tenderId: tenderId,
          product: 'Sugar',
          grade: tender.grade,
          totalQty: qty,
          dispatchedQty: 0,
          remainingQty: qty,
          totalAmount: qty * price,
          status: 'Ready for Dispatch',
          paymentVerified: true
        };

        const existingOrder = state.orders.find(o => o.tenderId === tenderId);
        if (existingOrder) return state;

        return {
          tenders: state.tenders.map(t => t.id === tenderId ? { ...t, status: 'Accepted' } : t),
          bids: state.bids.map(b => b.tenderId === tenderId ? { ...b, status: 'Accepted' } : b),
          orders: [newOrder, ...state.orders]
        };
      }),

      addDispatchRequest: (requestData) => set((state) => {
        const newDispatch = {
          id: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
          ...requestData,
          status: 'Approval Pending',
          date: new Date().toLocaleDateString('en-GB')
        };
        
        const updatedOrders = state.orders.map(o => {
          if (o.id === requestData.orderId) {
            return {
              ...o,
              dispatchedQty: o.dispatchedQty + requestData.qty,
              remainingQty: o.remainingQty - requestData.qty,
              status: 'Dispatch Active'
            };
          }
          return o;
        });

        return {
          dispatches: [newDispatch, ...state.dispatches],
          orders: updatedOrders
        };
      }),

      updateDispatchRequest: (id, updatedData) => set((state) => ({
        dispatches: state.dispatches.map(d => d.id === id ? { ...d, ...updatedData } : d)
      })),

      addPayment: (paymentData) => set((state) => ({
        payments: [{
          id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          ...paymentData,
          status: 'Pending Verification',
          date: new Date().toLocaleDateString('en-GB')
        }, ...state.payments]
      })),

      verifyPayment: (orderId) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, paymentVerified: true, status: 'Ready for Dispatch' } : o)
      }))
    }),
    {
      name: 'dispatchpro-v7-isolated',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
