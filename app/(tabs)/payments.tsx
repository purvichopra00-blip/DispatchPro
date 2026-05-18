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
  KeyboardAvoidingView
} from 'react-native';
import { 
  Menu, Download, Receipt, CheckCircle, Clock,
  ArrowUpRight, X, Printer, IndianRupee, FileText, Plus, AlertCircle, Building2
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

const { width } = Dimensions.get('window');
const formatAmount = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function PaymentsScreen() {
  const payments = useAppStore(state => state.payments);
  const addPayment = useAppStore(state => state.addPayment);
  const verifyPayment = useAppStore(state => state.verifyPayment);
  const orders = useAppStore(state => state.orders);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Form states
  const [payAmount, setPayAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);

  // Dynamic ledger outstanding balance
  const unpaidOrders = orders.filter(o => !o.paymentVerified);
  const outstandingAmount = orders.reduce((sum, o) => sum + (o.remainingQty * (o.totalAmount / o.totalQty || 0)), 0);

  const handleUpload = () => {
    if (!payAmount || !utr || !orderId) {
      setError('Please fill in all required fields.');
      return;
    }
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const matchedOrder = orders.find(o => o.id === orderId);

    addPayment({
      amount: amountNum,
      utr,
      order: orderId,
      company: matchedOrder?.companyName || 'ASR Sugar Factory',
      status: 'Pending Verification',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    });

    // Mock automatic verification after 5 seconds to show the B2B verification flow
    const currentOrderId = orderId;
    setTimeout(() => {
      verifyPayment(currentOrderId);
    }, 5000);

    setIsUploading(false);
    setPayAmount('');
    setUtr('');
    setOrderId('');
    setError('');
  };

  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn} onPress={() => setSidebarOpen(true)}>
            <Menu size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>Payments</Text>
          <TouchableOpacity 
            style={s.hdrBtn} 
            onPress={() => {
              setPayAmount(''); setUtr(''); setOrderId(''); setError('');
              setIsUploading(true);
            }}
          >
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
        <View style={s.content}>
          {/* Stunning Ledger Balance Header Card */}
          <View style={s.balanceCard}>
            <View style={s.accentCircle} />
            <Text style={s.balanceLabel}>Outstanding Balance</Text>
            <Text style={s.balanceVal}>{formatAmount(outstandingAmount)}</Text>
            <Text style={s.balanceSub}>Next due in 3 days • Auto billing active</Text>
          </View>

          <Text style={s.sectionTitle}>Payment History</Text>

          {payments.length === 0 ? (
            <View style={s.emptyContainer}>
              <View style={s.emptyIconCircle}>
                <Receipt size={32} color={Colors.textMuted} />
              </View>
              <Text style={s.emptyTitle}>No transaction history</Text>
              <Text style={s.emptySubtitle}>Your uploaded payments and verifying invoices will be listed here.</Text>
            </View>
          ) : (
            payments.map((p: any) => (
              <TouchableOpacity 
                className="card" 
                key={p.id} 
                style={s.paymentCard}
                onPress={() => setSelectedPayment(p)}
                activeOpacity={0.8}
              >
                <View style={[
                  s.iconBox,
                  { 
                    backgroundColor: p.status === 'Verified' || p.status === 'Completed'
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : p.status === 'Rejected' 
                      ? 'rgba(239, 68, 68, 0.08)' 
                      : 'rgba(245, 158, 11, 0.08)' 
                  }
                ]}>
                  <Receipt 
                    size={20} 
                    color={
                      p.status === 'Verified' || p.status === 'Completed'
                        ? Colors.success 
                        : p.status === 'Rejected' 
                        ? '#EF4444' 
                        : Colors.warning
                    } 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.paymentAmount}>{formatAmount(p.amount)}</Text>
                  <Text style={s.paymentCompany}>{p.company}</Text>
                  <Text style={s.paymentMeta}>{p.date} • UTR: {p.utr || 'N/A'}</Text>
                </View>
                <View style={[
                  s.badge,
                  {
                    backgroundColor: p.status === 'Verified' || p.status === 'Completed'
                      ? 'rgba(16, 185, 129, 0.08)'
                      : p.status === 'Rejected'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(245, 158, 11, 0.08)'
                  }
                ]}>
                  <Text style={[
                    s.badgeTxt,
                    {
                      color: p.status === 'Verified' || p.status === 'Completed'
                        ? Colors.success
                        : p.status === 'Rejected'
                        ? '#EF4444'
                        : Colors.warning
                    }
                  ]}>
                    {p.status === 'Pending Verification' ? 'Verifying' : p.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Upload Payment Drawer Modal */}
      {isUploading && (
        <Modal
          visible={isUploading}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsUploading(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.overlay}
          >
            <View style={s.drawer}>
              <View style={s.drawerHandle} />
              
              <View style={s.drawerHeader}>
                <Text style={s.drawerTitle}>Upload Payment</Text>
                <TouchableOpacity style={s.closeBtn} onPress={() => setIsUploading(false)}>
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

                {/* Dropdown Order Selector */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Select Order Reference *</Text>
                  <TouchableOpacity 
                    style={s.inputBox}
                    onPress={() => setShowOrderDropdown(!showOrderDropdown)}
                  >
                    <Building2 size={16} color={Colors.primary} />
                    <Text style={[s.textInput, { color: orderId ? Colors.textPrimary : Colors.textMuted }]}>
                      {orderId ? orders.find(o => o.id === orderId)?.companyName : 'Choose Order Reference'}
                    </Text>
                  </TouchableOpacity>
                  {showOrderDropdown && (
                    <View style={s.dropdownBox}>
                      {unpaidOrders.length === 0 ? (
                        <View style={{ padding: 12 }}><Text style={s.dropdownItemTxt}>No unpaid orders available</Text></View>
                      ) : (
                        unpaidOrders.map(o => (
                          <TouchableOpacity 
                            key={o.id} 
                            style={s.dropdownItem}
                            onPress={() => { setOrderId(o.id); setShowOrderDropdown(false); setError(''); }}
                          >
                            <Text style={s.dropdownItemTxt}>{o.id} - {o.companyName}</Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>

                {/* Amount input */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Amount Paid *</Text>
                  <View style={s.inputBox}>
                    <Text style={s.rupeeSymbol}>₹</Text>
                    <TextInput 
                      style={s.textInput}
                      keyboardType="numeric"
                      value={payAmount}
                      onChangeText={t => { setPayAmount(t); setError(''); }}
                      placeholder="0.00"
                    />
                  </View>
                </View>

                {/* UTR reference */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>UTR / Transaction Reference Number *</Text>
                  <View style={s.inputBox}>
                    <Receipt size={16} color={Colors.primary} />
                    <TextInput 
                      style={s.textInput}
                      value={utr}
                      onChangeText={setUtr}
                      placeholder="12-digit transaction number"
                    />
                  </View>
                </View>

                {/* Screenshot Receipt Box */}
                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Payment Receipt Screenshot</Text>
                  <TouchableOpacity style={s.receiptBox} activeOpacity={0.7}>
                    <FileText size={24} color={Colors.primary} style={{ marginBottom: 6 }} />
                    <Text style={s.receiptTitle}>Upload Payment Receipt</Text>
                    <Text style={s.receiptSub}>JPG, PNG, or PDF formats supported</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.submitBtn} onPress={handleUpload}>
                  <Text style={s.submitBtnTxt}>Submit Payment</Text>
                  <ArrowUpRight size={16} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity style={s.cancelBtn} onPress={() => setIsUploading(false)}>
                  <Text style={s.cancelBtnTxt}>Cancel</Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* Details modal overlay */}
      {selectedPayment && (
        <Modal
          visible={!!selectedPayment}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectedPayment(null)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <TouchableOpacity 
                style={s.modalClose} 
                onPress={() => setSelectedPayment(null)}
              >
                <X size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
              
              <View style={s.modalHeader}>
                <View style={s.modalIconCircle}>
                  <Receipt size={28} color={Colors.primary} />
                </View>
                <Text style={s.modalAmount}>{formatAmount(selectedPayment.amount)}</Text>
                <Text style={s.modalCompany}>{selectedPayment.company}</Text>
              </View>

              <View style={s.modalGrid}>
                <View style={s.modalRow}>
                  <Text style={s.modalLabel}>UTR Reference</Text>
                  <Text style={s.modalVal}>{selectedPayment.utr}</Text>
                </View>
                <View style={s.modalRow}>
                  <Text style={s.modalLabel}>Verification Status</Text>
                  <Text style={[s.modalVal, { color: Colors.primary }]}>{selectedPayment.status}</Text>
                </View>
                <View style={s.modalRow}>
                  <Text style={s.modalLabel}>Transaction Date</Text>
                  <Text style={s.modalVal}>{selectedPayment.date}</Text>
                </View>
              </View>

              <TouchableOpacity style={s.downloadBtn} activeOpacity={0.8}>
                <Download size={16} color="#FFF" />
                <Text style={s.downloadBtnTxt}>Download Payment Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    paddingHorizontal: 16,
  },
  // Ledger card styles
  balanceCard: {
    backgroundColor: '#1E202C', // Deep B2B slate color
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  accentCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    opacity: 0.65,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  balanceVal: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  balanceSub: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.5,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(30,32,44,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Payment card styles
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paymentCompany: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTxt: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  // Modal drawer styling
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 0,
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Custom dropdown selector styles
  dropdownBox: {
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
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dropdownItemTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  receiptBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.divider,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  receiptSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
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
  // Detail modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 32, 44, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  modalCompany: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  modalGrid: {
    gap: 12,
    marginBottom: 24,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalVal: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  downloadBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnTxt: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
