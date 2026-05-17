import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  PanResponder,
  KeyboardAvoidingView,
  Modal
} from 'react-native';
import { 
  Menu, Bell, Clock, Building2, Tag, IndianRupee, MapPin, X, 
  ArrowRight, CheckCircle, ClipboardList, Truck, Check, AlertCircle, Users 
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

const { width } = Dimensions.get('window');

// Local Helper to format Indian Rupee
const formatAmount = (n: number) => '₹' + n.toLocaleString('en-IN');

function ActivitySummary() {
  const tenders = useAppStore(state => state.tenders);
  const orders = useAppStore(state => state.orders);
  const dispatches = useAppStore(state => state.dispatches);

  // Dynamic calculations from store
  const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
  const activeDispatches = dispatches.filter(d => d.status !== 'Delivered').length;
  const totalOutstanding = orders.reduce((sum, o) => sum + (o.remainingQty * (o.totalAmount / o.totalQty || 0)), 0);
  const outstandingFormatted = totalOutstanding >= 100000 
    ? `₹${(totalOutstanding / 100000).toFixed(1)}L` 
    : formatAmount(totalOutstanding);

  const summary = [
    { label: 'Orders Pending', val: String(pendingOrders), icon: <ClipboardList size={18} color="#FF7F50" />, bg: 'rgba(255, 127, 80, 0.08)' },
    { label: 'Active Dispatches', val: String(activeDispatches), icon: <Truck size={18} color="#00CEC9" />, bg: 'rgba(0, 206, 201, 0.08)' },
    { label: 'Outstanding', val: outstandingFormatted, icon: <IndianRupee size={18} color="#1E202C" />, bg: 'rgba(30, 32, 44, 0.06)' }
  ];

  return (
    <View style={s.summaryContainer}>
      {summary.map(sItem => (
        <View key={sItem.label} style={s.summaryCard}>
          <View style={[s.summaryIconBox, { backgroundColor: sItem.bg }]}>
            {sItem.icon}
          </View>
          <View style={s.summaryValContainer}>
            <Text style={s.summaryVal}>{sItem.val}</Text>
            <Text numberOfLines={1} style={s.summaryLabel}>{sItem.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// Custom Gesture Swipe to Confirm Button Component
interface SwipeButtonProps {
  onSuccess: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

function SwipeButton({ onSuccess, isSubmitting, disabled }: SwipeButtonProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [containerWidth, setContainerWidth] = useState(width - 48);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !isSubmitting,
      onPanResponderMove: (e, gestureState) => {
        const maxSlide = containerWidth - 64; // Handle width + margins
        const newX = Math.max(0, Math.min(maxSlide, gestureState.dx));
        pan.x.setValue(newX);
      },
      onPanResponderRelease: (e, gestureState) => {
        const maxSlide = containerWidth - 64;
        if (gestureState.dx >= maxSlide * 0.78) {
          // Trigger success! slide all the way
          Animated.spring(pan, {
            toValue: { x: maxSlide, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onSuccess();
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Reset slider if isSubmitting becomes false or component mounts
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [isSubmitting]);

  return (
    <View 
      style={[s.swipeBg, disabled && { opacity: 0.5 }]} 
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={s.swipeTextContainer}>
        <Text style={s.swipeText}>
          {isSubmitting ? 'SUBMITTING BID...' : 'SWIPE RIGHT TO CONFIRM BID'}
        </Text>
      </View>
      <Animated.View
        style={[s.swipeHandle, { transform: [{ translateX: pan.x }] }]}
        {...panResponder.panHandlers}
      >
        <ArrowRight size={24} color="#FFF" />
      </Animated.View>
    </View>
  );
}

export default function TendersScreen() {
  const [filter, setFilter] = useState('All');
  const [isBidding, setIsBidding] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  // Store selections
  const tenders = useAppStore(state => state.tenders);
  const orders = useAppStore(state => state.orders);
  const addBid = useAppStore(state => state.addBid);
  const contacts = useAppStore(state => state.contacts);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);

  const selfAddresses = contacts.filter(c => c.type === 'Self');

  // Input states for Place Bid modal
  const [bidQty, setBidQty] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(selfAddresses[0] || { id: 'C-3', name: 'Main Warehouse (Self)', gstin: '09RT9988A1Z5', address: 'Sector 15, Lucknow, UP' });
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filters = ['All', 'Open', 'Under Review', 'Accepted', 'Rejected'];

  const filteredTenders = tenders.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Open') return t.status === 'Active';
    return t.status === filter;
  });

  const handleOpenBid = (tender: Tender) => {
    setSelectedTender(tender);
    setBidQty(String(tender.qty));
    setBidPrice(String(tender.basePrice));
    setNotes('');
    setError('');
    setIsBidding(true);
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const handleSwipeSuccess = () => {
    if (!bidQty || !bidPrice) {
      setError('Please enter a valid quantity and price');
      return;
    }
    const qtyNum = parseFloat(bidQty);
    const priceNum = parseFloat(bidPrice);

    if (qtyNum > (selectedTender?.qty || 0)) {
      setError(`Quantity cannot exceed remaining ${selectedTender?.qty} QTL.`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Call store
    addBid({
      tenderId: selectedTender!.id,
      factory: selectedTender!.factoryName,
      qty: qtyNum,
      price: priceNum,
      notes: notes,
      gstin: selectedAddress.gstin,
      addressId: selectedAddress.id
    });

    // Simulate network completion
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Auto-close overlay after 2 seconds
      setTimeout(() => {
        setIsBidding(false);
        setSelectedTender(null);
        setIsSubmitted(false);
      }, 2000);
    }, 1500);
  };

  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn} onPress={() => setSidebarOpen(true)}>
            <Menu size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>DispatchPro</Text>
          <TouchableOpacity style={s.hdrBtn}>
            <Bell size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
        {/* Dynamic Activity Cards */}
        <ActivitySummary />

        {/* Filter Scroll Row */}
        <View style={s.chipRowContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {filters.map(f => (
              <TouchableOpacity 
                key={f} 
                style={[s.chip, filter === f && s.chipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[s.chipTxt, filter === f && s.chipTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tenders List */}
        <View style={s.listContainer}>
          {filteredTenders.length === 0 ? (
            <View style={s.emptyState}>
              <AlertCircle size={40} color={Colors.textMuted} />
              <Text style={s.emptyTxt}>No tenders in this status.</Text>
            </View>
          ) : (
            filteredTenders.map(tender => {
              const order = orders.find(o => o.tenderId === tender.id);
              const progressPercent = order ? ((order.totalQty - order.remainingQty) / order.totalQty) * 100 : 0;
              const dispatchedQty = order ? order.totalQty - order.remainingQty : 0;

              return (
                <View key={tender.id} style={s.card}>
                  {/* Title and Base Price Row */}
                  <View style={s.cardHeader}>
                    <View>
                      <Text style={s.cardGrade}>Grade {tender.grade}</Text>
                      <Text style={s.cardType}>{tender.type} • #{tender.id}</Text>
                    </View>
                    <View style={s.priceBox}>
                      <Text style={s.priceVal}>{formatAmount(tender.basePrice)}</Text>
                      <Text style={s.priceSub}>per QTL</Text>
                    </View>
                  </View>

                  {/* Factory Name */}
                  <View style={s.factoryRow}>
                    <Building2 size={14} color={Colors.textMuted} />
                    <Text style={s.factoryTxt}>{tender.factoryName}</Text>
                  </View>

                  {/* Compact Metrics Row */}
                  <View style={s.metricsRow}>
                    <View style={s.metricBadge}>
                      <Text style={s.metricBadgeTxt}>{tender.qty} <Text style={{fontWeight: '500', color: Colors.textSecondary}}>QTL</Text></Text>
                    </View>
                    <View style={s.metricDot} />
                    <Text style={s.metricTxt}>{tender.totalBids} Bids</Text>
                    <View style={s.metricDot} />
                    <View style={s.timerRow}>
                      <Clock size={12} color={Colors.textSecondary} />
                      <Text style={s.timerTxt}>02h 14m</Text>
                    </View>
                  </View>

                  {/* Progress bar for Accepted */}
                  {tender.status === 'Accepted' && order && (
                    <View style={s.progressSection}>
                      <View style={s.progressBarContainer}>
                        <View style={[s.progressBar, { width: `${progressPercent}%` }]} />
                      </View>
                      <View style={s.progressLabels}>
                        <Text style={s.progressLabelTxt}>{dispatchedQty} QTL DISPATCHED</Text>
                        <Text style={s.progressLabelTxt}>{order.remainingQty} QTL REMAINING</Text>
                      </View>
                    </View>
                  )}

                  {/* Footer Status / Actions */}
                  <View style={s.cardFooter}>
                    <View style={s.statusBadge}>
                      <View style={[s.statusDot, { 
                        backgroundColor: tender.status === 'Accepted' ? '#3498db' : tender.status === 'Active' ? Colors.success : Colors.textMuted 
                      }]} />
                      <Text style={[s.statusTxt, { 
                        color: tender.status === 'Accepted' ? '#3498db' : tender.status === 'Active' ? Colors.success : Colors.textSecondary 
                      }]}>
                        {tender.status === 'Active' ? 'Open' : tender.status}
                      </Text>
                    </View>

                    {tender.status === 'Active' ? (
                      <TouchableOpacity 
                        style={s.bidBtn}
                        onPress={() => handleOpenBid(tender)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.bidBtnTxt}>Place Bid</Text>
                      </TouchableOpacity>
                    ) : tender.status === 'Accepted' ? (
                      <View style={s.acceptedIndicator}>
                        <CheckCircle size={16} color="#3498db" />
                        <Text style={s.acceptedTxt}>Bid Won</Text>
                      </View>
                    ) : (
                      <Text style={s.closedTxt}>Closed</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Place Bid Drawer Modal */}
      {selectedTender && (
        <Modal
          visible={isBidding}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsBidding(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.overlay}
          >
            <View style={s.drawer}>
              {/* Top Handle bar */}
              <View style={s.drawerHandle} />

              {/* SUCCESS OVERLAY STATE */}
              {isSubmitted && (
                <View style={s.successOverlay}>
                  <View style={s.successCircle}>
                    <Check size={40} color={Colors.white} />
                  </View>
                  <Text style={s.successTitle}>Bid Submitted Successfully</Text>
                  <Text style={s.successDetails}>
                    {bidQty} QTL @ ₹{bidPrice} / QTL
                  </Text>
                  <Text style={s.successStatus}>Status: Under Review</Text>
                </View>
              )}

              {/* Modal Header */}
              <View style={s.drawerHeader}>
                <View>
                  <Text style={s.drawerPreTitle}>TENDER ID #{selectedTender.id}</Text>
                  <Text style={s.drawerTitle}>{selectedTender.factoryName}</Text>
                </View>
                <TouchableOpacity 
                  style={s.closeBtn} 
                  onPress={() => { setIsBidding(false); setSelectedTender(null); }}
                >
                  <X size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.drawerScroll}>
                
                {/* Section 1: Dynamic Row Indicators */}
                <View style={s.drawerSumGrid}>
                  <View style={s.sumCell}>
                    <Text style={s.sumCellLabel}>Grade</Text>
                    <Text style={s.sumCellVal}>{selectedTender.grade}</Text>
                  </View>
                  <View style={s.sumCell}>
                    <Text style={s.sumCellLabel}>Total Qty</Text>
                    <Text style={s.sumCellVal}>{selectedTender.qty} QTL</Text>
                  </View>
                  <View style={s.sumCell}>
                    <Text style={s.sumCellLabel}>Base Price</Text>
                    <Text style={[s.sumCellVal, { color: Colors.primary }]}>{formatAmount(selectedTender.basePrice)}</Text>
                  </View>
                </View>

                {/* Section 2: Validation Error */}
                {error ? (
                  <View style={s.errorBox}>
                    <AlertCircle size={18} color="#e53e3e" />
                    <Text style={s.errorTxt}>{error}</Text>
                  </View>
                ) : null}

                {/* Section 3: Live Statistics badges */}
                <View style={s.signalsRow}>
                  <View style={s.signalBadge}>
                    <Users size={14} color={Colors.primary} />
                    <Text style={s.signalBadgeTxt}>{selectedTender.totalBids} Active Bidders</Text>
                  </View>
                  <View style={s.signalBadgeDot} />
                  <View style={s.signalBadge}>
                    <Clock size={14} color="#EF4444" />
                    <Text style={[s.signalBadgeTxt, { color: '#EF4444' }]}>Closes in 02h 14m</Text>
                  </View>
                </View>

                {/* Section 4: Dynamic Self-Shipping Card Section (From Mockup) */}
                <View style={s.shippingContainer}>
                  <Text style={s.shippingHeaderTitle}>SHIPPING DETAILS</Text>
                  
                  {/* Row 1: Warehouse / GSTIN Selection */}
                  <TouchableOpacity style={s.shippingRow}>
                    <View style={s.shippingLeft}>
                      <Building2 size={16} color={Colors.primary} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={s.shippingMainTxt}>{selectedAddress.gstin} ({selectedAddress.name})</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={s.shippingDivider} />

                  {/* Row 2: Map Pin Address Detail */}
                  <TouchableOpacity style={s.shippingRow}>
                    <View style={s.shippingLeft}>
                      <MapPin size={16} color={Colors.primary} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={s.shippingMainTxt}>{selectedAddress.address}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Section 5: Side-by-Side Dual Inputs (From Mockup) */}
                <View style={s.inputGrid}>
                  <View style={s.gridCol}>
                    <Text style={s.inputLabel}>Bid Quantity (QTL)</Text>
                    <View style={[s.inputBox, error && !bidQty && s.inputBoxError]}>
                      <Tag size={16} color={Colors.primary} />
                      <TextInput 
                        style={s.textInput}
                        keyboardType="numeric"
                        value={bidQty}
                        onChangeText={t => { setBidQty(t); setError(''); }}
                        placeholder="0 QTL"
                      />
                    </View>
                  </View>
                  <View style={s.gridCol}>
                    <Text style={s.inputLabel}>Price / QTL</Text>
                    <View style={[s.inputBox, error && !bidPrice && s.inputBoxError]}>
                      <Text style={s.rupeeIcon}>₹</Text>
                      <TextInput 
                        style={s.textInput}
                        keyboardType="numeric"
                        value={bidPrice}
                        onChangeText={t => { setBidPrice(t); setError(''); }}
                        placeholder="₹ 0"
                      />
                    </View>
                  </View>
                </View>

                {/* Notes Input Field */}
                <View style={s.notesContainer}>
                  <Text style={s.inputLabel}>Notes (Optional)</Text>
                  <View style={s.notesInputBox}>
                    <ClipboardList size={16} color={Colors.primary} style={{ marginTop: 2 }} />
                    <TextInput
                      style={[s.textInput, { minHeight: 48, textAlignVertical: 'top', paddingVertical: 4 }]}
                      multiline
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Special instructions..."
                    />
                  </View>
                </View>

                {/* Calculated Bid Summary Row */}
                {bidQty && bidPrice ? (
                  <View style={s.summaryTotalCard}>
                    <View style={s.summaryTotalRow}>
                      <Text style={s.summaryTotalFormula}>{bidQty} QTL × ₹{bidPrice}</Text>
                      <Text style={s.summaryTotalVal}>
                        ₹{Number(parseFloat(bidQty) * parseFloat(bidPrice) || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Swipe Button CTA Container */}
                <View style={s.swipeContainer}>
                  <SwipeButton 
                    onSuccess={handleSwipeSuccess}
                    isSubmitting={isSubmitting}
                  />
                </View>

                {/* Cancel Trigger Text */}
                <TouchableOpacity 
                  style={s.cancelBtn} 
                  onPress={() => { setIsBidding(false); setSelectedTender(null); }}
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
  },
  // Summary section styles
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValContainer: {
    gap: 2,
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Filter chips styles
  chipRowContainer: {
    marginBottom: 16,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTxtActive: {
    color: Colors.white,
  },
  // Tenders list cards styles
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTxt: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    marginBottom: 4,
  },
  cardGrade: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardType: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 12,
  },
  factoryTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metricBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricBadgeTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metricDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
  },
  metricTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  // Progress Bar Sections
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    borderStyle: 'dashed',
    paddingVertical: 12,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
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
  // Footer parts
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  bidBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bidBtnTxt: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  acceptedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  acceptedTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3498db',
  },
  closedTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  // Drawer / Modal overlay styles
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
    position: 'relative',
    overflow: 'hidden',
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
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 22,
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
  drawerSumGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sumCell: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 16,
    gap: 4,
  },
  sumCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  sumCellVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
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
  signalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 107, 87, 0.08)',
    borderRadius: 12,
    marginBottom: 20,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalBadgeTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  signalBadgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  // Shipping details styles (From Mockup UI)
  shippingContainer: {
    backgroundColor: '#F5F6FA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  shippingHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  shippingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shippingMainTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  shippingDivider: {
    height: 1,
    backgroundColor: '#E6E9F0',
    marginVertical: 6,
  },
  // Side-by-Side inputs layout
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
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
  inputBoxError: {
    borderColor: '#e53e3e',
    backgroundColor: '#fff5f5',
  },
  rupeeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 0,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesInputBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F6FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  // Total summary card styles
  summaryTotalCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalFormula: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  // Swipe confirmation button styles
  swipeContainer: {
    marginBottom: 12,
  },
  swipeBg: {
    height: 64,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    position: 'relative',
    justifyContent: 'center',
  },
  swipeTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  swipeHandle: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  // Success overlay state style
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  successDetails: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  successStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
