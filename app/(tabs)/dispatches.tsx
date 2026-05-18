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
  Menu, Search, Truck as TruckIcon, MapPin, Building2, User, 
  Clock, CheckCircle, Navigation, X, Info, FileText, 
  ChevronRight, ArrowRight, Tag, Users, AlertCircle 
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAppStore, Dispatch } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

const { width } = Dimensions.get('window');

const DISPATCH_STATUSES = [
  'Approval Pending',
  'Approved',
  'Vehicle Assigned',
  'At Plant',
  'Loaded',
  'Dispatched',
  'Delivered'
];

interface TimelineProps {
  currentStatus: string;
}

function Timeline({ currentStatus }: TimelineProps) {
  const currentIndex = DISPATCH_STATUSES.indexOf(currentStatus);
  const nodes = [
    { label: 'Pending', activeIndex: 0 },
    { label: 'Assigned', activeIndex: 2 },
    { label: 'Dispatched', activeIndex: 5 },
    { label: 'Delivered', activeIndex: 6 }
  ];

  return (
    <View style={s.timelineContainer}>
      {nodes.map((node, i) => {
        const isCompleted = currentIndex >= node.activeIndex;
        const isCurrent = currentIndex === node.activeIndex || 
          (currentIndex > node.activeIndex && (i === nodes.length - 1 || currentIndex < nodes[i+1].activeIndex));
        
        return (
          <View key={node.label} style={s.timelineNode}>
            {i !== 0 && (
              <View style={[
                s.timelineLine, 
                { backgroundColor: isCompleted ? Colors.primary : Colors.divider }
              ]} />
            )}
            <View style={[
              s.timelineCircle,
              { 
                backgroundColor: isCompleted ? Colors.primary : Colors.background,
                borderColor: isCompleted ? Colors.primary : Colors.divider
              }
            ]}>
              {isCompleted ? <CheckCircle size={10} color="#FFF" /> : null}
            </View>
            <Text style={[
              s.timelineTxt,
              { 
                fontWeight: isCurrent ? '800' : '600', 
                color: isCurrent ? Colors.textPrimary : Colors.textMuted 
              }
            ]}>
              {node.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function DispatchesScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const dispatches = useAppStore(state => state.dispatches);
  const customers = useAppStore(state => state.contacts);
  const updateDispatchRequest = useAppStore(state => state.updateDispatchRequest);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);

  // Edit Form States
  const [editQty, setEditQty] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editTransporter, setEditTransporter] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editName, setEditName] = useState('');
  const [editGstin, setEditGstin] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filters = ['All', ...DISPATCH_STATUSES];

  const filteredDispatches = activeTab === 'All' 
    ? dispatches 
    : dispatches.filter(d => d.status === activeTab);

  const startEditing = (d: Dispatch) => {
    setEditQty(String(d.qty));
    setEditVehicle(d.vehicleNo || '');
    setEditTransporter(d.transporterName || '');
    setEditAddress(d.deliveryAddr || '');
    setEditName(d.customerName || '');
    setEditGstin(d.gstin || '');
    setIsEditing(true);
  };

  const handleSaveUpdate = () => {
    if (!editName || !editAddress || !editQty) return;
    
    updateDispatchRequest(selectedDispatch!.id, {
      qty: parseFloat(editQty),
      vehicleNo: editVehicle,
      transporterName: editTransporter,
      deliveryAddr: editAddress,
      customerName: editName,
      gstin: editGstin
    });

    setIsEditing(false);
    setSelectedDispatch(null);
  };

  const suggestions = editName.length > 0 
    ? (customers || []).filter((c: any) => c.name.toLowerCase().includes(editName.toLowerCase()))
    : [];

  const handleSelectCustomer = (c: any) => {
    setEditName(c.name);
    setEditGstin(c.gstin);
    setEditAddress(c.address);
    setShowSuggestions(false);
  };

  return (
    <View style={s.container}>
      {/* Top Fixed Section */}
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn} onPress={() => setSidebarOpen(true)}>
            <Menu size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>Dispatches</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab slider */}
        <View style={s.statusTabContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.statusTabScroll}
          >
            {filters.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[s.statusTab, activeTab === tab && s.statusTabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.statusTabText, activeTab === tab && s.statusTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Dispatches List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
        {filteredDispatches.length === 0 ? (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconCircle}>
              <Navigation size={38} color={Colors.textMuted} />
            </View>
            <Text style={s.emptyTitle}>No Dispatches Found</Text>
            <Text style={s.emptySubtitle}>There are no dispatch records in the "{activeTab}" status.</Text>
          </View>
        ) : (
          <View style={s.listContainer}>
            {filteredDispatches.map(d => (
              <View key={d.id} style={s.card}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.cardDSP}>{d.id}</Text>
                    <Text style={s.cardCustomer}>{d.customerName}</Text>
                    <Text style={s.cardFactory}>{d.factoryName} • Sugar S-30</Text>
                  </View>
                  <View style={[
                    s.badge,
                    { 
                      backgroundColor: d.status === 'Delivered' 
                        ? 'rgba(16, 185, 129, 0.08)' 
                        : d.status === 'Approval Pending' 
                        ? 'rgba(245, 158, 11, 0.08)' 
                        : 'rgba(255, 107, 87, 0.08)' 
                    }
                  ]}>
                    <Text style={[
                      s.badgeTxt,
                      { 
                        color: d.status === 'Delivered' 
                          ? Colors.success 
                          : d.status === 'Approval Pending' 
                          ? Colors.warning 
                          : Colors.primary 
                      }
                    ]}>
                      {d.status}
                    </Text>
                  </View>
                </View>

                {/* Logistics grid */}
                <View style={s.logisticsGrid}>
                  <View style={s.gridItem}>
                    <Text style={s.gridLabel}>Vehicle Status</Text>
                    <View style={s.gridRow}>
                      <TruckIcon size={14} color={Colors.primary} />
                      <Text style={s.gridVal}>{d.vehicleNo || 'Unassigned'}</Text>
                    </View>
                  </View>
                  <View style={s.gridItem}>
                    <Text style={s.gridLabel}>Dispatch Qty</Text>
                    <View style={s.gridRow}>
                      <CheckCircle size={14} color={Colors.success} />
                      <Text style={s.gridVal}>{d.qty} QTL</Text>
                    </View>
                  </View>
                  <View style={[s.gridItem, { width: '100%' }]}>
                    <Text style={s.gridLabel}>Delivery Address</Text>
                    <View style={s.gridRow}>
                      <MapPin size={14} color={Colors.primary} />
                      <Text style={s.gridAddr} numberOfLines={2}>{d.deliveryAddr}</Text>
                    </View>
                  </View>
                  <View style={[s.gridItem, { width: '100%', borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={s.gridLabel}>Est. Dispatch</Text>
                    <View style={s.gridRow}>
                      <Clock size={14} color={Colors.primary} />
                      <Text style={s.gridVal}>{d.date} • {d.status === 'Approval Pending' ? 'Awaiting Approval' : 'On Schedule'}</Text>
                    </View>
                  </View>
                </View>

                {/* Logistics status timeline */}
                <Timeline currentStatus={d.status} />

                {/* View Trigger */}
                <TouchableOpacity 
                  style={s.viewDetailsBtn}
                  onPress={() => { setSelectedDispatch(d); setIsEditing(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={s.viewDetailsBtnTxt}>View / Update Request</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Dispatch Details Bottom Sheet Modal */}
      {selectedDispatch && (
        <Modal
          visible={!!selectedDispatch}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedDispatch(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.overlay}
          >
            <View style={s.drawer}>
              <View style={s.drawerHandle} />
              
              <View style={s.drawerHeader}>
                <View>
                  <Text style={s.drawerPreTitle}>{isEditing ? 'EDIT DISPATCH REQUEST' : 'DISPATCH DETAILS'}</Text>
                  <Text style={s.drawerTitle}>{selectedDispatch.id}</Text>
                </View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedDispatch(null)}>
                  <X size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.drawerScroll}>
                {isEditing ? (
                  /* EDIT MODE FORM */
                  <View style={{ gap: 16 }}>
                    <View style={s.inputGroup}>
                      <Text style={s.inputLabel}>Customer Name</Text>
                      <View style={s.inputBox}>
                        <User size={18} color={Colors.primary} />
                        <TextInput 
                          style={s.textInput}
                          value={editName}
                          onChangeText={t => { setEditName(t); setShowSuggestions(true); }}
                          placeholder="Type customer name..."
                        />
                      </View>
                    </View>

                    <View style={s.inputGroup}>
                      <Text style={s.inputLabel}>Delivery Address</Text>
                      <View style={[s.inputBox, { height: 'auto', minHeight: 60, paddingVertical: 8 }]}>
                        <MapPin size={18} color={Colors.primary} style={{ marginTop: 2 }} />
                        <TextInput 
                          style={[s.textInput, { textAlignVertical: 'top', minHeight: 50 }]}
                          multiline
                          value={editAddress}
                          onChangeText={setEditAddress}
                          placeholder="Delivery address details..."
                        />
                      </View>
                    </View>

                    {/* Dispatch Quantity Input */}
                    <View style={s.inputGroup}>
                      <Text style={s.inputLabel}>Quantity (QTL) *</Text>
                      <View style={s.inputBox}>
                        <Tag size={16} color={Colors.primary} />
                        <TextInput 
                          style={s.textInput}
                          keyboardType="numeric"
                          value={editQty}
                          onChangeText={setEditQty}
                          placeholder="0 QTL"
                        />
                      </View>
                    </View>

                    {/* Vehicle Number Input */}
                    <View style={s.inputGroup}>
                      <Text style={s.inputLabel}>Vehicle No</Text>
                      <View style={s.inputBox}>
                        <TruckIcon size={16} color={Colors.primary} />
                        <TextInput 
                          style={s.textInput}
                          value={editVehicle}
                          onChangeText={setEditVehicle}
                          placeholder="Vehicle Number"
                        />
                      </View>
                    </View>

                    <View style={s.inputGroup}>
                      <Text style={s.inputLabel}>Transporter</Text>
                      <View style={s.inputBox}>
                        <Users size={16} color={Colors.primary} />
                        <TextInput 
                          style={s.textInput}
                          value={editTransporter}
                          onChangeText={setEditTransporter}
                          placeholder="Transporter Name"
                        />
                      </View>
                    </View>

                    <View style={s.drawerActions}>
                      <TouchableOpacity style={s.outlineBtn} onPress={() => setIsEditing(false)}>
                        <Text style={s.outlineBtnTxt}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.primaryBtn} onPress={handleSaveUpdate}>
                        <Text style={s.primaryBtnTxt}>Save Changes</Text>
                        <ArrowRight size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* VIEW DETAILS MODE */
                  <View style={{ gap: 20 }}>
                    <View style={s.detailCard}>
                      <Text style={s.detailCardTitle}>Business Info</Text>
                      
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Customer Name</Text>
                        <Text style={s.detailValue}>{selectedDispatch.customerName}</Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>GSTIN</Text>
                        <Text style={s.detailValue}>{selectedDispatch.gstin || '09AAAAA0000A1Z5'}</Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Quantity</Text>
                        <Text style={s.detailValue}>{selectedDispatch.qty} QTL</Text>
                      </View>
                    </View>

                    <View style={s.detailCard}>
                      <Text style={s.detailCardTitle}>Logistics Detail</Text>
                      
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Transporter</Text>
                        <Text style={s.detailValue}>{selectedDispatch.transporterName || 'Self Managed'}</Text>
                      </View>
                      <View style={s.detailRow}>
                        <Text style={s.detailLabel}>Vehicle No</Text>
                        <Text style={s.detailValue}>{selectedDispatch.vehicleNo || 'Unassigned'}</Text>
                      </View>
                    </View>

                    <View style={s.drawerActions}>
                      <TouchableOpacity style={s.outlineBtn} onPress={() => setSelectedDispatch(null)}>
                        <Text style={s.outlineBtnTxt}>Close</Text>
                      </TouchableOpacity>
                      {selectedDispatch.status === 'Approval Pending' ? (
                        <TouchableOpacity style={s.primaryBtn} onPress={() => startEditing(selectedDispatch)}>
                          <Text style={s.primaryBtnTxt}>Update Request</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={s.approvedNotice}>
                          <Text style={s.approvedNoticeTxt}>REQUEST APPROVED • CANNOT EDIT</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* New Dispatch Manual Request Scheduler Drawer */}
      <NewDispatchModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
      />
    </View>
  );
}

// Manual Create Request drawer
interface NewDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NewDispatchModal({ isOpen, onClose }: NewDispatchModalProps) {
  const addDispatch = useAppStore(state => state.addDispatchRequest);
  const contacts = useAppStore(state => state.contacts);
  const buyers = contacts.filter(c => c.type === 'Buyer');

  const [customerName, setCustomerName] = useState('');
  const [qty, setQty] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const [gstin, setGstin] = useState('');
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');

  const suggestions = customerName.length > 0
    ? buyers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
    : [];

  const handleSelectCustomer = (c: any) => {
    setCustomerName(c.name);
    setGstin(c.gstin);
    setDeliveryAddr(c.address);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!customerName || !qty || !deliveryAddr) {
      setError('Please fill in required fields.');
      return;
    }
    const qtyNum = parseFloat(qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    addDispatch({
      orderId: `ORD-MAN-${Math.floor(100 + Math.random() * 900)}`,
      factoryName: 'ASR Sugar Factory',
      customerName,
      gstin,
      deliveryAddr,
      qty: qtyNum,
      vehicleNo,
      transporterName
    });

    onClose();
    // Reset Form
    setCustomerName('');
    setQty('');
    setVehicleNo('');
    setTransporterName('');
    setDeliveryAddr('');
    setGstin('');
    setError('');
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        <View style={s.drawer}>
          <View style={s.drawerHandle} />
          
          <View style={s.drawerHeader}>
            <Text style={s.drawerTitle}>New Dispatch Request</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
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

            {/* Select Customer */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Select Customer *</Text>
              <View style={s.inputBox}>
                <User size={18} color={Colors.primary} />
                <TextInput 
                  style={s.textInput}
                  value={customerName}
                  onChangeText={t => { setCustomerName(t); setShowSuggestions(true); setError(''); }}
                  placeholder="Type customer name..."
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

            {/* GSTIN info */}
            {gstin ? (
              <View style={s.gstinInfo}>
                <Text style={s.gstinTxt}>Selected Buyer GSTIN: <Text style={{fontWeight: '700', color: Colors.primary}}>{gstin}</Text></Text>
              </View>
            ) : null}

            {/* Quantity Input */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Quantity (QTL) *</Text>
              <View style={s.inputBox}>
                <Tag size={16} color={Colors.primary} />
                <TextInput 
                  style={s.textInput}
                  keyboardType="numeric"
                  placeholder="0 QTL"
                  value={qty}
                  onChangeText={t => { setQty(t); setError(''); }}
                />
              </View>
            </View>

            {/* Vehicle Number Input */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Vehicle No</Text>
              <View style={s.inputBox}>
                <TruckIcon size={16} color={Colors.primary} />
                <TextInput 
                  style={s.textInput}
                  placeholder="UP32XX0000"
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                />
              </View>
            </View>

            {/* Delivery address */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Delivery Address *</Text>
              <View style={[s.inputBox, { height: 'auto', minHeight: 70, paddingVertical: 8 }]}>
                <MapPin size={18} color={Colors.primary} style={{ marginTop: 2 }} />
                <TextInput 
                  style={[s.textInput, { textAlignVertical: 'top', minHeight: 60 }]}
                  multiline
                  placeholder="Full delivery address..."
                  value={deliveryAddr}
                  onChangeText={setDeliveryAddr}
                />
              </View>
            </View>

            {/* Transporter */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Transporter</Text>
              <View style={s.inputBox}>
                <Users size={16} color={Colors.primary} />
                <TextInput 
                  style={s.textInput}
                  placeholder="Transporter Name"
                  value={transporterName}
                  onChangeText={setTransporterName}
                />
              </View>
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
              <Text style={s.submitBtnTxt}>Create Dispatch Request</Text>
              <ArrowRight size={16} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  newDispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newDispatchBtnTxt: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  // Tab Bar styles
  statusTabContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  statusTabScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statusTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusTabTextActive: {
    color: Colors.white,
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
  // Card styles
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
    marginBottom: 16,
  },
  cardDSP: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardCustomer: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  cardFactory: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  logisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  gridItem: {
    width: '47%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingBottom: 8,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gridAddr: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.divider,
    height: 44,
    borderRadius: 12,
    marginTop: 18,
  },
  viewDetailsBtnTxt: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  // Timeline node styles
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    borderStyle: 'dashed',
  },
  timelineNode: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    gap: 6,
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    left: '-50%',
    width: '100%',
    height: 2,
    zIndex: 0,
  },
  timelineCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineTxt: {
    fontSize: 10,
  },
  // Drawer / Bottom sheet style
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
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 0,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
  },
  drawerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.divider,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnTxt: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnTxt: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Detail card view styles
  detailCard: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 18,
  },
  detailCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  approvedNotice: {
    flex: 2,
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  approvedNoticeTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  // Manual dispatch modal additions
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
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
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
