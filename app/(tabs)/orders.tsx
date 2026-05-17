import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { 
  Menu, Search, Building2, IndianRupee, ArrowRight, X, Clock, 
  CheckCircle, Truck, Info, User, MapPin, Tag, Users, AlertCircle, ClipboardList 
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAppStore, Order } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

const { width } = Dimensions.get('window');
const formatAmount = (n: number) => '₹' + n.toLocaleString('en-IN');

interface OrderCardProps {
  order: Order;
  onCreateDispatch: (order: Order) => void;
}

function OrderCard({ order, onCreateDispatch }: OrderCardProps) {
  const statusColor = Colors.primary;
  const progress = ((order.totalQty - order.remainingQty) / order.totalQty) * 100;

  return (
    <View style={[s.card, { borderLeftColor: statusColor }]}>
      {/* Header Section */}
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{order.companyName}</Text>
          <Text style={s.cardSubtitle}>Sugar {order.grade}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <Text style={[s.statusBadgeTxt, { color: statusColor }]}>{order.status}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={s.metricsRow}>
        <View>
          <Text style={s.metricVal}>{order.remainingQty} <Text style={s.metricLabel}>PENDING</Text></Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.metricVal}>{order.totalQty} <Text style={s.metricLabel}>TOTAL</Text></Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[s.metricVal, { color: Colors.textPrimary }]}>{formatAmount(order.totalAmount)}</Text>
        </View>
      </View>

      {/* Progress Bar Section */}
      <View style={s.progressContainer}>
        <View style={s.progressBarBg}>
          <View style={[s.progressBar, { width: `${progress}%`, backgroundColor: statusColor }]} />
        </View>
        <View style={s.progressLabels}>
          <Text style={s.progressLabelTxt}>{order.totalQty - order.remainingQty} DISPATCHED</Text>
          <Text style={s.progressLabelTxt}>{order.remainingQty} PENDING</Text>
        </View>
      </View>

      {/* Operational Signal Indicators */}
      <View style={s.signalsRow}>
        <View style={s.signal}>
          <Clock size={12} color={Colors.textMuted} />
          <Text style={s.signalTxt}>Last activity 2h ago</Text>
        </View>
        <View style={s.signal}>
          <CheckCircle size={12} color={Colors.success} />
          <Text style={[s.signalTxt, { color: Colors.success, fontWeight: '700' }]}>Ready for Dispatch</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={s.dispatchBtn} 
        onPress={() => onCreateDispatch(order)}
        activeOpacity={0.8}
      >
        <Text style={s.dispatchBtnTxt}>Create Dispatch Request</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OrdersScreen() {
  const orders = useAppStore(state => state.orders);
  const contacts = useAppStore(state => state.contacts);
  const addDispatchRequest = useAppStore(state => state.addDispatchRequest);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);

  const buyers = contacts.filter(c => c.type === 'Buyer');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Dispatch Scheduler Form States
  const [customerName, setCustomerName] = useState('');
  const [gstin, setGstin] = useState('');
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const [qty, setQty] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCreateDispatch = (order: Order) => {
    setSelectedOrder(order);
    setCustomerName('');
    setGstin('');
    setDeliveryAddr('');
    setQty('');
    setVehicleNo('');
    setTransporterName('');
    setNotes('');
    setError('');
    setShowDispatchModal(true);
  };

  const suggestions = customerName.length > 0
    ? buyers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
    : [];

  const handleSelectCustomer = (c: any) => {
    setCustomerName(c.name);
    setGstin(c.gstin);
    setDeliveryAddr(c.address);
    setShowSuggestions(false);
  };

  const handleSubmitDispatch = () => {
    if (!customerName || !deliveryAddr || !qty) {
      setError('Please fill in all required fields.');
      return;
    }
    const qtyNum = parseFloat(qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid dispatch quantity.');
      return;
    }
    if (qtyNum > selectedOrder!.remainingQty) {
      setError(`Quantity cannot exceed remaining balance (${selectedOrder!.remainingQty} QTL).`);
      return;
    }

    addDispatchRequest({
      orderId: selectedOrder!.id,
      factoryName: selectedOrder!.companyName,
      customerName,
      gstin,
      deliveryAddr,
      qty: qtyNum,
      vehicleNo,
      transporterName,
      notes
    });

    setShowDispatchModal(false);
    setSelectedOrder(null);
  };

  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn} onPress={() => setSidebarOpen(true)}>
            <Menu size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>Orders</Text>
          <TouchableOpacity style={s.hdrBtn}>
            <Search size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
        {orders.length === 0 ? (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconCircle}>
              <ClipboardList size={36} color={Colors.textMuted} />
            </View>
            <Text style={s.emptyTitle}>No orders yet</Text>
            <Text style={s.emptySubtitle}>Accepted tenders will appear here for you to manage dispatches.</Text>
          </View>
        ) : (
          <View style={s.listContainer}>
            {orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onCreateDispatch={handleCreateDispatch}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Dispatch Bottom Drawer Modal */}
      {selectedOrder && (
        <Modal
          visible={showDispatchModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDispatchModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.overlay}
          >
            <View style={s.drawer}>
              <View style={s.drawerHandle} />
              
              <View style={s.drawerHeader}>
                <View>
                  <Text style={s.drawerPreTitle}>DOI SCHEDULER REQUEST</Text>
                  <Text style={s.drawerTitle}>{selectedOrder.companyName}</Text>
                </View>
                <TouchableOpacity style={s.closeBtn} onPress={() => { setShowDispatchModal(false); setSelectedOrder(null); }}>
                  <X size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.drawerScroll}>
                {error ? (
                  <View style={s.errorBox}>
                    <AlertCircle size={18} color="#e53e3e" />
                    <Text style={s.errorTxt}>{error}</Text>
                  </View>
                ) : null}

                {/* Customer Search / Selection Box */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Send To / Customer Name</Text>
                  <View style={s.inputBox}>
                    <Users size={16} color={Colors.primary} />
                    <TextInput 
                      style={s.textInput}
                      value={customerName}
                      onChangeText={t => { setCustomerName(t); setShowSuggestions(true); setError(''); }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search saved buyers..."
                    />
                  </View>
                  {showSuggestions && suggestions.length > 0 && (
                    <View style={s.suggestionsBox}>
                      {suggestions.map(sItem => (
                        <TouchableOpacity 
                          key={sItem.id} 
                          style={s.suggestionItem}
                          onPress={() => handleSelectCustomer(sItem)}
                        >
                          <Text style={s.suggestionTxt}>{sItem.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* GSTIN Information View */}
                {gstin ? (
                  <View style={s.gstinInfo}>
                    <Text style={s.gstinTxt}>Selected Buyer GSTIN: <Text style={{fontWeight: '700', color: Colors.primary}}>{gstin}</Text></Text>
                  </View>
                ) : null}

                {/* Dispatch Quantity Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Dispatch Qty (QTL) *</Text>
                  <View style={s.inputBox}>
                    <Tag size={16} color={Colors.primary} />
                    <TextInput 
                      style={s.textInput}
                      keyboardType="numeric"
                      value={qty}
                      onChangeText={t => { setQty(t); setError(''); }}
                      placeholder="0 QTL"
                    />
                  </View>
                </View>

                {/* Vehicle Number Input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Vehicle No (Optional)</Text>
                  <View style={s.inputBox}>
                    <Truck size={16} color={Colors.primary} />
                    <TextInput 
                      style={s.textInput}
                      value={vehicleNo}
                      onChangeText={setVehicleNo}
                      placeholder="UP-32-XX-XXXX"
                    />
                  </View>
                </View>

                {/* Address Box */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Delivery Address</Text>
                  <View style={[s.inputBox, { height: 'auto', minHeight: 70, alignItems: 'flex-start', paddingVertical: 8 }]}>
                    <MapPin size={16} color={Colors.primary} style={{ marginTop: 2 }} />
                    <TextInput 
                      style={[s.textInput, { textAlignVertical: 'top', minHeight: 60 }]}
                      multiline
                      value={deliveryAddr}
                      onChangeText={setDeliveryAddr}
                      placeholder="Full delivery address..."
                    />
                  </View>
                </View>

                {/* Transporter Name Box */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Transporter Name (Optional)</Text>
                  <View style={s.inputBox}>
                    <Truck size={16} color={Colors.primary} />
                    <TextInput 
                      style={s.textInput}
                      value={transporterName}
                      onChangeText={setTransporterName}
                      placeholder="Enter transporter details"
                    />
                  </View>
                </View>

                {/* Submit Action Button */}
                <TouchableOpacity 
                  style={s.submitBtn} 
                  onPress={handleSubmitDispatch}
                  activeOpacity={0.85}
                >
                  <Text style={s.submitBtnTxt}>Submit DOI Request</Text>
                  <ArrowRight size={18} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={s.cancelBtn} 
                  onPress={() => { setShowDispatchModal(false); setSelectedOrder(null); }}
                >
                  <Text style={s.cancelBtnTxt}>Cancel</Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hdrSafe: {
    backgroundColor: Colors.primary,
  },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? 40 : 14,
    backgroundColor: Colors.primary,
  },
  hdrBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  scrollContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 100,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30,32,44,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Order Card styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 4,
    padding: 18,
    marginBottom: 14,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  signalsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dispatchBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  dispatchBtnTxt: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal Drawer style
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 32, 44, 0.4)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    maxHeight: '94%',
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.divider,
    alignSelf: 'center',
    marginVertical: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  drawerPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c53030',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 0,
  },
  // Suggestions box styles
  suggestionsBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  suggestionTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gstinInfo: {
    backgroundColor: 'rgba(255, 107, 87, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  gstinTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
