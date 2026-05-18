import { nhost } from './nhost';

// GraphQL data layer for the Hasura `public` tables.
// The DB columns are snake_case; the app interfaces are camelCase, so every
// table has a camel->snake field map and rows are converted on the way in/out.

type Row = Record<string, any>;

const MAPS = {
  tenders: {
    id: 'id', type: 'type', product: 'product', grade: 'grade', qty: 'qty',
    date: 'date', status: 'status', factoryName: 'factory_name',
    factoryLocation: 'factory_location', season: 'season', basePrice: 'base_price',
    totalBids: 'total_bids', highestBid: 'highest_bid', yourLastBid: 'your_last_bid',
  },
  bids: {
    id: 'id', tenderId: 'tender_id', factory: 'factory', qty: 'qty',
    price: 'price', status: 'status', date: 'date',
  },
  orders: {
    id: 'id', tenderId: 'tender_id', companyName: 'company_name', product: 'product',
    grade: 'grade', totalQty: 'total_qty', dispatchedQty: 'dispatched_qty',
    remainingQty: 'remaining_qty', totalAmount: 'total_amount', status: 'status',
    paymentVerified: 'payment_verified', dispatchStatus: 'dispatch_status',
  },
  dispatches: {
    id: 'id', orderId: 'order_id', factoryName: 'factory_name',
    customerName: 'customer_name', deliveryAddr: 'delivery_addr', qty: 'qty',
    vehicleNo: 'vehicle_no', transporterName: 'transporter_name',
    status: 'status', date: 'date',
  },
  contacts: { id: 'id', name: 'name', gstin: 'gstin', address: 'address', type: 'type' },
  business: {
    id: 'id', companyName: 'company_name', gstin: 'gstin', pan: 'pan',
    address: 'address', bankName: 'bank_name', accountNo: 'account_no', ifsc: 'ifsc',
  },
  profile: {
    id: 'id', name: 'name', phone: 'phone', email: 'email',
    role: 'role', avatar: 'avatar',
  },
  documents: { id: 'id', name: 'name', type: 'type', date: 'date', size: 'size' },
} as const;

export type TableName = keyof typeof MAPS;

// The v2 client does not reliably propagate the session JWT to the GraphQL
// client, so the token is captured straight from the auth state change
// (see store/auth.ts) and attached to every request explicitly.
let cachedToken: string | undefined;
export function setAuthToken(token?: string) {
  cachedToken = token;
}

async function gql<T = any>(query: string, variables?: Row): Promise<T> {
  let token = cachedToken ?? nhost.auth.getAccessToken();
  if (!token) {
    // Cold start — wait for the session to restore, then retry.
    await nhost.auth.isAuthenticatedAsync();
    token = cachedToken ?? nhost.auth.getAccessToken();
  }
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  const res: any = await nhost.graphql.request(query, variables ?? {}, config);
  if (res.error) {
    const err = res.error;
    const msg = Array.isArray(err)
      ? err.map((e: any) => e.message).join('; ')
      : err.message;
    throw new Error(msg || 'GraphQL request failed');
  }
  return res.data as T;
}

const fieldMap = (t: TableName): Row => MAPS[t] as unknown as Row;
const cols = (t: TableName) => Object.values(fieldMap(t)).join(' ');

function fromRow(t: TableName, row: Row): Row {
  const m = fieldMap(t);
  const out: Row = {};
  for (const camel in m) out[camel] = row[m[camel]];
  return out;
}

function toRow(t: TableName, obj: Row): Row {
  const m = fieldMap(t);
  const out: Row = {};
  for (const camel in m) {
    if (obj[camel] !== undefined) out[m[camel]] = obj[camel];
  }
  return out;
}

export async function fetchAll(t: TableName): Promise<Row[]> {
  const data = await gql(`query { ${t} { ${cols(t)} } }`);
  return (data[t] as Row[]).map((r) => fromRow(t, r));
}

export async function insertRow(t: TableName, obj: Row): Promise<Row> {
  const data = await gql(
    `mutation($obj: ${t}_insert_input!) {
       insert_${t}_one(object: $obj) { ${cols(t)} }
     }`,
    { obj: toRow(t, obj) },
  );
  return fromRow(t, data[`insert_${t}_one`]);
}

export async function updateRow(
  t: TableName,
  id: string,
  changes: Row,
): Promise<Row> {
  const data = await gql(
    `mutation($id: String!, $set: ${t}_set_input!) {
       update_${t}_by_pk(pk_columns: { id: $id }, _set: $set) { ${cols(t)} }
     }`,
    { id, set: toRow(t, changes) },
  );
  return fromRow(t, data[`update_${t}_by_pk`]);
}

export async function deleteRow(t: TableName, id: string): Promise<void> {
  await gql(
    `mutation($id: String!) { delete_${t}_by_pk(id: $id) { id } }`,
    { id },
  );
}

// Bulk status update for every bid on a tender (used when a bid is accepted).
export async function updateBidsByTender(
  tenderId: string,
  changes: Row,
): Promise<void> {
  await gql(
    `mutation($tid: String!, $set: bids_set_input!) {
       update_bids(where: { tender_id: { _eq: $tid } }, _set: $set) {
         affected_rows
       }
     }`,
    { tid: tenderId, set: toRow('bids', changes) },
  );
}
