import { create } from 'zustand';
import {
  fetchAll,
  insertRow,
  updateRow,
  deleteRow,
  updateBidsByTender,
} from './api';

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
  id?: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Business {
  id?: string;
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
  hydrated: boolean;
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
  hydrate: () => Promise<void>;
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

const today = () => new Date().toLocaleDateString('en-GB');
const randId = (prefix: string, span: number) =>
  `${prefix}-${Math.floor(span + Math.random() * span * 9)}`;

// Background DB write — local state is updated optimistically, so a failed
// sync is logged rather than thrown into the UI.
const sync = (label: string, op: Promise<unknown>) => {
  op.catch((e) => console.error(`[Store] ${label} sync failed:`, e));
};

export const useAppStore = create<AppState>()((set, get) => ({
  hydrated: false,
  tenders: [],
  bids: [],
  orders: [],
  payments: [],
  dispatches: [],
  contacts: [],
  documents: [],

  profile: {
    name: '',
    phone: '',
    email: '',
    role: '',
    avatar: '',
  },
  business: {
    companyName: '',
    gstin: '',
    pan: '',
    address: '',
    bankName: '',
    accountNo: '',
    ifsc: '',
  },

  notifications: [
    {
      id: 1,
      title: 'Order Accepted',
      msg: 'Your bid for ASR Sugar (1000 QTL) has been accepted!',
      time: 'Just now',
      type: 'success',
      unread: true,
    },
  ],
  settings: {
    pushNotifications: true,
    emailUpdates: false,
    whatsappAlerts: true,
    language: 'English',
  },
  authUser: null,

  // Load every DB-backed table from Hasura into the store.
  hydrate: async () => {
    try {
      const [
        tenders,
        bids,
        orders,
        dispatches,
        contacts,
        documents,
        businessRows,
        profileRows,
      ] = await Promise.all([
        fetchAll('tenders'),
        fetchAll('bids'),
        fetchAll('orders'),
        fetchAll('dispatches'),
        fetchAll('contacts'),
        fetchAll('documents'),
        fetchAll('business'),
        fetchAll('profile'),
      ]);
      set({
        tenders: tenders as Tender[],
        bids: bids as Bid[],
        orders: orders as Order[],
        dispatches: dispatches as Dispatch[],
        contacts: contacts as Contact[],
        documents: documents as Document[],
        business: (businessRows[0] as Business) ?? get().business,
        profile: (profileRows[0] as Profile) ?? get().profile,
        hydrated: true,
      });
      console.log(
        `[Store] hydrated from Hasura — ${tenders.length} tenders, ` +
          `${bids.length} bids, ${orders.length} orders, ` +
          `${dispatches.length} dispatches, ${contacts.length} contacts, ` +
          `${documents.length} documents`,
      );
    } catch (e) {
      console.error('[Store] hydrate failed:', e);
    }
  },

  setAuthUser: (user) => set({ authUser: user }),
  clearAuthUser: () => set({ authUser: null }),

  updateProfile: (data) => {
    set((state) => ({ profile: { ...state.profile, ...data } }));
    const profile = get().profile;
    if (profile.id) {
      sync('updateProfile', updateRow('profile', profile.id, data));
    } else {
      const id = `PROF-${Date.now()}`;
      set((state) => ({ profile: { ...state.profile, id } }));
      sync('updateProfile', insertRow('profile', { ...profile, id }));
    }
  },

  updateBusiness: (data) => {
    set((state) => ({ business: { ...state.business, ...data } }));
    const business = get().business;
    if (business.id) {
      sync('updateBusiness', updateRow('business', business.id, data));
    } else {
      const id = `BIZ-${Date.now()}`;
      set((state) => ({ business: { ...state.business, id } }));
      sync('updateBusiness', insertRow('business', { ...business, id }));
    }
  },

  clearNotifications: () => set({ notifications: [] }),

  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  addDocument: (doc) => {
    const newDoc: Document = { id: `D-${Date.now()}`, ...doc };
    set((state) => ({ documents: [newDoc, ...state.documents] }));
    sync('addDocument', insertRow('documents', newDoc));
  },

  addContact: (contact) => {
    const newContact: Contact = { id: `C-${Date.now()}`, ...contact };
    set((state) => ({ contacts: [newContact, ...state.contacts] }));
    sync('addContact', insertRow('contacts', newContact));
  },

  deleteContact: (id) => {
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) }));
    sync('deleteContact', deleteRow('contacts', id));
  },

  addBid: (bidData) => {
    const newBid: Bid = {
      id: randId('BID', 1000),
      ...bidData,
      status: 'Under Review',
      date: today(),
    };
    set((state) => ({
      bids: [...state.bids, newBid],
      tenders: state.tenders.map((t) =>
        t.id === bidData.tenderId ? { ...t, status: 'Under Review' } : t,
      ),
    }));
    sync(
      'addBid',
      insertRow('bids', newBid).then(() =>
        updateRow('tenders', bidData.tenderId, { status: 'Under Review' }),
      ),
    );
  },

  acceptBid: (tenderId) => {
    const state = get();
    const tender = state.tenders.find((t) => t.id === tenderId);
    if (!tender) return;
    if (state.orders.find((o) => o.tenderId === tenderId)) return;

    const bid = state.bids.find((b) => b.tenderId === tenderId);
    const qty = bid ? Number(bid.qty) : tender.qty;
    const price = bid ? Number(bid.price) : tender.basePrice;

    const newOrder: Order = {
      id: randId('ORD', 100),
      tenderId,
      companyName: tender.factoryName,
      product: 'Sugar',
      grade: tender.grade,
      totalQty: qty,
      dispatchedQty: 0,
      remainingQty: qty,
      totalAmount: qty * price,
      status: 'Ready for Dispatch',
      paymentVerified: true,
    };

    set((st) => ({
      tenders: st.tenders.map((t) =>
        t.id === tenderId ? { ...t, status: 'Accepted' } : t,
      ),
      bids: st.bids.map((b) =>
        b.tenderId === tenderId ? { ...b, status: 'Accepted' } : b,
      ),
      orders: [newOrder, ...st.orders],
    }));

    sync(
      'acceptBid',
      (async () => {
        await updateRow('tenders', tenderId, { status: 'Accepted' });
        await updateBidsByTender(tenderId, { status: 'Accepted' });
        await insertRow('orders', newOrder);
      })(),
    );
  },

  addDispatchRequest: (requestData) => {
    const newDispatch: Dispatch = {
      id: randId('DSP', 1000),
      ...requestData,
      status: 'Approval Pending',
      date: today(),
    };

    const order = get().orders.find((o) => o.id === requestData.orderId);
    const orderPatch = order
      ? {
          dispatchedQty: order.dispatchedQty + requestData.qty,
          remainingQty: order.remainingQty - requestData.qty,
          status: 'Dispatch Active',
        }
      : null;

    set((state) => ({
      dispatches: [newDispatch, ...state.dispatches],
      orders: orderPatch
        ? state.orders.map((o) =>
            o.id === requestData.orderId ? { ...o, ...orderPatch } : o,
          )
        : state.orders,
    }));

    sync(
      'addDispatchRequest',
      (async () => {
        await insertRow('dispatches', newDispatch);
        if (orderPatch) {
          await updateRow('orders', requestData.orderId, orderPatch);
        }
      })(),
    );
  },

  updateDispatchRequest: (id, updatedData) => {
    set((state) => ({
      dispatches: state.dispatches.map((d) =>
        d.id === id ? { ...d, ...updatedData } : d,
      ),
    }));
    sync('updateDispatchRequest', updateRow('dispatches', id, updatedData));
  },

  // Payments have no DB table — kept in local state only.
  addPayment: (paymentData) =>
    set((state) => ({
      payments: [
        {
          id: randId('PAY', 1000),
          ...paymentData,
          status: 'Pending Verification',
          date: today(),
        },
        ...state.payments,
      ],
    })),

  verifyPayment: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, paymentVerified: true, status: 'Ready for Dispatch' }
          : o,
      ),
    }));
    sync(
      'verifyPayment',
      updateRow('orders', orderId, {
        paymentVerified: true,
        status: 'Ready for Dispatch',
      }),
    );
  },
}));
