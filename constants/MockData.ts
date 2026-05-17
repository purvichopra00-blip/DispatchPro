// ─── Mock Data for DispatchPro ───

export interface Order {
  id: string;
  companyName: string;
  unitName: string;
  buyerName: string;
  tenderNo: string;
  orderNo: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  pricePerQTL: number;
  totalAmount: number;
  tenderType: string;
  product: string;
  grade: string;
  season: string;
  totalQty: number;
  dispatchedQty: number;
  yetToLoadQty: number;
  availableQty: number;
}

export interface Address {
  id: string;
  label: string;
  gstin: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    companyName: 'Balrampur Chini Mills Ltd.',
    unitName: 'Balrampur Unit',
    buyerName: 'Rajesh Kumar',
    tenderNo: 'TND-2026-00142',
    orderNo: 'ORD-2026-05-0021',
    status: 'Approved',
    pricePerQTL: 3450,
    totalAmount: 1725000,
    tenderType: 'Open Tender',
    product: 'Sugar',
    grade: 'S-30',
    season: '2025-26',
    totalQty: 500,
    dispatchedQty: 200,
    yetToLoadQty: 150,
    availableQty: 150,
  },
  {
    id: '2',
    companyName: 'Dhampur Sugar Mills Ltd.',
    unitName: 'Dhampur Unit',
    buyerName: 'Sanjay Agarwal',
    tenderNo: 'TND-2026-00189',
    orderNo: 'ORD-2026-05-0034',
    status: 'Approved',
    pricePerQTL: 3520,
    totalAmount: 2464000,
    tenderType: 'Limited Tender',
    product: 'Sugar',
    grade: 'M-30',
    season: '2025-26',
    totalQty: 700,
    dispatchedQty: 350,
    yetToLoadQty: 200,
    availableQty: 150,
  },
  {
    id: '3',
    companyName: 'Triveni Engineering Ltd.',
    unitName: 'Khatauli Unit',
    buyerName: 'Amit Sharma',
    tenderNo: 'TND-2026-00205',
    orderNo: 'ORD-2026-05-0047',
    status: 'Pending',
    pricePerQTL: 3380,
    totalAmount: 1014000,
    tenderType: 'Open Tender',
    product: 'Sugar',
    grade: 'S-30',
    season: '2025-26',
    totalQty: 300,
    dispatchedQty: 0,
    yetToLoadQty: 300,
    availableQty: 300,
  },
  {
    id: '4',
    companyName: 'Bajaj Hindusthan Sugar Ltd.',
    unitName: 'Palia Kalan Unit',
    buyerName: 'Priya Verma',
    tenderNo: 'TND-2026-00221',
    orderNo: 'ORD-2026-05-0058',
    status: 'Approved',
    pricePerQTL: 3490,
    totalAmount: 3490000,
    tenderType: 'Limited Tender',
    product: 'Sugar',
    grade: 'M-30',
    season: '2025-26',
    totalQty: 1000,
    dispatchedQty: 600,
    yetToLoadQty: 200,
    availableQty: 200,
  },
];

export const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Head Office',
    gstin: '09AABCB1234F1ZP',
    line1: 'Plot No. 45, Industrial Area',
    line2: 'Phase-II, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
  },
  {
    id: '2',
    label: 'Warehouse – Delhi',
    gstin: '07AABCB1234F1ZP',
    line1: '12/A, Narela Industrial Complex',
    line2: 'Near GT Karnal Road',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110040',
  },
  {
    id: '3',
    label: 'Branch Office – Mumbai',
    gstin: '27AABCB1234F1ZP',
    line1: 'Unit 503, Trade Centre',
    line2: 'BKC, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
  },
];

export const DISPATCH_STATUSES = [
  'Arriving',
  'At Plant',
  'DO Issued',
  'Loaded',
  'Reported',
] as const;

export type DispatchStatus = (typeof DISPATCH_STATUSES)[number];
