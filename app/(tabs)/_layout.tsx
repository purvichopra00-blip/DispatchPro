import React, { useRef, useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Animated, Dimensions, Modal, TextInput, Switch, Platform, KeyboardAvoidingView, PanResponder 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  User, Building2, Users, FileText, Settings, LogOut, 
  X, Plus, ChevronRight, CheckCircle, Trash2, ShieldAlert 
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { signOut } from '@/store/auth';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.82;

export default function TabLayout() {
  const router = useRouter();
  
  // Zustand store variables
  const isSidebarOpen = useUiStore(state => state.isSidebarOpen);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);
  const profile = useAppStore(state => state.profile);
  const business = useAppStore(state => state.business);
  const contacts = useAppStore(state => state.contacts);
  const settings = useAppStore(state => state.settings);
  const documents = useAppStore(state => state.documents);

  // Store methods
  const updateBusiness = useAppStore(state => state.updateBusiness);
  const addContact = useAppStore(state => state.addContact);
  const deleteContact = useAppStore(state => state.deleteContact);
  const addDocument = useAppStore(state => state.addDocument);
  const updateSettings = useAppStore(state => state.updateSettings);

  // Animations values
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // PanResponder swipe left to close drawer gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Intercept gesture if swiping left (negative dx) with moderate horizontal drag
        return Math.abs(gestureState.dx) > 10 && gestureState.dx < 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Slide the drawer to follow the user's finger in real-time
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -DRAWER_WIDTH * 0.25 || gestureState.vx < -0.5) {
          // Swipe was significant or fast enough -> shut the drawer
          setSidebarOpen(false);
        } else {
          // Bounce/spring back to fully open
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Active Modals states
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'business' | 'contacts' | 'documents' | 'settings'

  // Form states for Modals
  const [bizForm, setBizForm] = useState({ ...business });
  const [newContact, setNewContact] = useState({ name: '', gstin: '', address: '', type: 'Buyer' as 'Buyer' | 'Self' });
  const [showAddContact, setShowAddContact] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', type: 'Legal', size: '1.5 MB' });
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sidebar slide animation
  useEffect(() => {
    console.log('[DEBUG] isSidebarOpen changed:', isSidebarOpen);
    if (isSidebarOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start(() => console.log('[DEBUG] Slide open animation finished'));
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => console.log('[DEBUG] Slide close animation finished'));
    }
  }, [isSidebarOpen]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    try {
      await signOut();
    } catch (e) {
      console.error('[Nhost Auth] Sign-out failed:', e);
    }
    // Dynamic redirect to login screen
    router.replace('/login');
  };

  const handleSaveBusiness = () => {
    updateBusiness(bizForm);
    setActiveModal(null);
    triggerToast('Business Profile Updated');
  };

  const handleAddContactSubmit = () => {
    if (!newContact.name || !newContact.gstin || !newContact.address) return;
    addContact(newContact);
    setNewContact({ name: '', gstin: '', address: '', type: 'Buyer' });
    setShowAddContact(false);
    triggerToast('Contact Saved Successfully');
  };

  const handleAddDocSubmit = () => {
    if (!newDoc.name) return;
    addDocument({
      name: newDoc.name,
      type: newDoc.type,
      size: newDoc.size,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    });
    setNewDoc({ name: '', type: 'Legal', size: '1.5 MB' });
    setShowAddDoc(false);
    triggerToast('Document Uploaded Successfully');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Bottom Tabs Screen */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tabs.Screen
          name="tenders"
          options={{
            title: 'Tenders',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="file-contract" size={16} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="clipboard-list" size={16} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="rupee-sign" size={16} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="dispatches"
          options={{
            title: 'Dispatches',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="truck" size={16} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="two" options={{ href: null }} />
      </Tabs>

      {/* Dynamic Success Toast */}
      {successToast && (
        <View style={styles.toast}>
          <CheckCircle size={18} color="#FFF" />
          <Text style={styles.toastTxt}>{successToast}</Text>
        </View>
      )}

      {/* Custom B2B Navigation Sidebar Drawer Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={() => setSidebarOpen(false)}
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(30, 32, 44, 0.4)', opacity: fadeAnim }} />
        </TouchableOpacity>
      )}

      <Animated.View 
        style={[
          styles.drawer, 
          { transform: [{ translateX: slideAnim }] },
          !isSidebarOpen && { display: 'none' }
        ]}
        {...panResponder.panHandlers}
        pointerEvents={isSidebarOpen ? 'auto' : 'none'}
      >
        {/* Profile Card Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarTxt}>{profile.avatar}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileRole}>{profile.role}</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeHdrBtn} 
            onPress={() => setSidebarOpen(false)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
          >
            <X size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Corporate details banner */}
        <View style={styles.corpBanner}>
          <Building2 size={16} color={Colors.white} style={{ opacity: 0.8 }} />
          <Text numberOfLines={1} style={styles.corpBannerTxt}>
            {business.companyName}
          </Text>
        </View>

        {/* Navigation Menus List */}
        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.menuSecTitle}>CORPORATE PARAMETERS</Text>
          
          {/* Menu 1: Business profile */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { setBizForm({ ...business }); setActiveModal('business'); }}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255, 107, 87, 0.08)' }]}>
                <Building2 size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemLabel}>Business Profile</Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Menu 2: Saved customers */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { setShowAddContact(false); setActiveModal('contacts'); }}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(52, 152, 219, 0.08)' }]}>
                <Users size={18} color="#3498db" />
              </View>
              <Text style={styles.menuItemLabel}>Saved Customers</Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Menu 3: Legal documents */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => { setShowAddDoc(false); setActiveModal('documents'); }}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(46, 204, 113, 0.08)' }]}>
                <FileText size={18} color="#2ecc71" />
              </View>
              <Text style={styles.menuItemLabel}>Legal Documents</Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Menu 4: System settings */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setActiveModal('settings')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(155, 89, 182, 0.08)' }]}>
                <Settings size={18} color="#9b59b6" />
              </View>
              <Text style={styles.menuItemLabel}>System Settings</Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.menuDivider} />

          {/* Logout button */}
          <TouchableOpacity 
            style={[styles.menuItem, { marginTop: 8 }]} 
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.08)' }]}>
                <LogOut size={18} color="#e74c3c" />
              </View>
              <Text style={[styles.menuItemLabel, { color: '#e74c3c', fontWeight: '700' }]}>Logout Session</Text>
            </View>
            <ChevronRight size={16} color="#e74c3c" style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </ScrollView>

        {/* Footer Brand tag */}
        <View style={styles.drawerFooter}>
          <Text style={styles.footerBrand}>DispatchPro Mobile</Text>
          <Text style={styles.footerVer}>v1.5.0 Locked Stable</Text>
        </View>
      </Animated.View>

      {/* ========================================================================= */}
      {/* 🏢 1. BUSINESS PROFILE EDITOR MODAL */}
      <Modal visible={activeModal === 'business'} animationType="slide" transparent={true} onRequestClose={() => setActiveModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderSec}>
              <Text style={styles.modalTitle}>Business Profile</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setActiveModal(null)}>
                <X size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Legal Name</Text>
                <TextInput style={styles.textInput} value={bizForm.companyName} onChangeText={t => setBizForm({...bizForm, companyName: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GSTIN / Tax ID</Text>
                <TextInput style={styles.textInput} value={bizForm.gstin} onChangeText={t => setBizForm({...bizForm, gstin: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Corporate PAN</Text>
                <TextInput style={styles.textInput} value={bizForm.pan} onChangeText={t => setBizForm({...bizForm, pan: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput style={styles.textInput} value={bizForm.bankName} onChangeText={t => setBizForm({...bizForm, bankName: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={bizForm.accountNo} onChangeText={t => setBizForm({...bizForm, accountNo: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank IFSC Code</Text>
                <TextInput style={styles.textInput} value={bizForm.ifsc} onChangeText={t => setBizForm({...bizForm, ifsc: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Registered Address</Text>
                <TextInput style={[styles.textInput, { minHeight: 60 }]} multiline value={bizForm.address} onChangeText={t => setBizForm({...bizForm, address: t})} />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBusiness}>
                <Text style={styles.saveBtnTxt}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================================= */}
      {/* 👥 2. SAVED CUSTOMERS / CONTACTS MODAL */}
      <Modal visible={activeModal === 'contacts'} animationType="slide" transparent={true} onRequestClose={() => setActiveModal(null)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderSec}>
              <Text style={styles.modalTitle}>Saved Customers</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setActiveModal(null)}>
                <X size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {showAddContact ? (
                /* ADD NEW CONTACT SUB FORM */
                <View style={styles.addFormContainer}>
                  <Text style={styles.addFormTitle}>Add New Buyer / Contact</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name / Warehouse</Text>
                    <TextInput style={styles.textInput} placeholder="Main Buyer Ltd." value={newContact.name} onChangeText={t => setNewContact({...newContact, name: t})} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>GSTIN</Text>
                    <TextInput style={styles.textInput} placeholder="09AAAAA..." value={newContact.gstin} onChangeText={t => setNewContact({...newContact, gstin: t})} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Address</Text>
                    <TextInput style={[styles.textInput, { minHeight: 50 }]} multiline placeholder="Enter full address" value={newContact.address} onChangeText={t => setNewContact({...newContact, address: t})} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setShowAddContact(false)}>
                      <Text style={styles.outlineBtnTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginTop: 0 }]} onPress={handleAddContactSubmit}>
                      <Text style={styles.saveBtnTxt}>Save Contact</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* LIST CONTACTS */
                <View>
                  <TouchableOpacity style={styles.addNewItemTrigger} onPress={() => setShowAddContact(true)}>
                    <Plus size={16} color={Colors.primary} />
                    <Text style={styles.addNewItemTriggerTxt}>Add New Customer / Buyer</Text>
                  </TouchableOpacity>

                  {contacts.map(c => (
                    <View key={c.id} style={styles.contactItemCard}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.contactItemName}>{c.name}</Text>
                        <Text style={styles.contactItemGstin}>GSTIN: {c.gstin}</Text>
                        <Text numberOfLines={2} style={styles.contactItemAddr}>{c.address}</Text>
                      </View>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteContact(c.id)}>
                        <Trash2 size={16} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================================= */}
      {/* 📄 3. LEGAL DOCUMENTS VAULT MODAL */}
      <Modal visible={activeModal === 'documents'} animationType="slide" transparent={true} onRequestClose={() => setActiveModal(null)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderSec}>
              <Text style={styles.modalTitle}>Documents Vault</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setActiveModal(null)}>
                <X size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {showAddDoc ? (
                /* ADD NEW DOCUMENT FORM */
                <View style={styles.addFormContainer}>
                  <Text style={styles.addFormTitle}>Upload Certificate</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Document Name</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. GST Registration Certificate" value={newDoc.name} onChangeText={t => setNewDoc({...newDoc, name: t})} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setShowAddDoc(false)}>
                      <Text style={styles.outlineBtnTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginTop: 0 }]} onPress={handleAddDocSubmit}>
                      <Text style={styles.saveBtnTxt}>Upload Document</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* DOCUMENT LIST */
                <View>
                  <TouchableOpacity style={styles.addNewItemTrigger} onPress={() => setShowAddDoc(true)}>
                    <Plus size={16} color={Colors.primary} />
                    <Text style={styles.addNewItemTriggerTxt}>Upload New B2B Document</Text>
                  </TouchableOpacity>

                  {documents.map(d => (
                    <View key={d.id} style={styles.docItemCard}>
                      <FileText size={22} color="#2ecc71" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.docItemName}>{d.name}</Text>
                        <Text style={styles.docItemMeta}>{d.type} • {d.size} • {d.date}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================================= */}
      {/* ⚙️ 4. SYSTEM TOGGLES / SETTINGS MODAL */}
      <Modal visible={activeModal === 'settings'} animationType="slide" transparent={true} onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderSec}>
              <Text style={styles.modalTitle}>System Settings</Text>
              <TouchableOpacity 
                style={styles.modalClose} 
                onPress={() => setActiveModal(null)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                activeOpacity={0.7}
              >
                <X size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.settingsTogglesCard}>
                {/* Push Notification Switch */}
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Push Notifications</Text>
                    <Text style={styles.toggleDesc}>Alerts on bid approval and dispatch updates</Text>
                  </View>
                  <Switch 
                    value={settings.pushNotifications} 
                    onValueChange={v => updateSettings({ pushNotifications: v })}
                    trackColor={{ false: '#767577', true: 'rgba(255, 107, 87, 0.4)' }}
                    thumbColor={settings.pushNotifications ? Colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.toggleDivider} />

                {/* WhatsApp Alerts Switch */}
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>WhatsApp Alerts</Text>
                    <Text style={styles.toggleDesc}>Get real-time truck logs directly on WhatsApp</Text>
                  </View>
                  <Switch 
                    value={settings.whatsappAlerts} 
                    onValueChange={v => updateSettings({ whatsappAlerts: v })}
                    trackColor={{ false: '#767577', true: 'rgba(255, 107, 87, 0.4)' }}
                    thumbColor={settings.whatsappAlerts ? Colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.toggleDivider} />

                {/* Email updates Switch */}
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Email PDF Invoices</Text>
                    <Text style={styles.toggleDesc}>Receive invoices and verification receipts via mail</Text>
                  </View>
                  <Switch 
                    value={settings.emailUpdates} 
                    onValueChange={v => updateSettings({ emailUpdates: v })}
                    trackColor={{ false: '#767577', true: 'rgba(255, 107, 87, 0.4)' }}
                    thumbColor={settings.emailUpdates ? Colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setActiveModal(null)}>
                  <Text style={styles.outlineBtnTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { flex: 1, marginTop: 0 }]} onPress={() => setActiveModal(null)}>
                  <Text style={styles.saveBtnTxt}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    elevation: 12,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 4,
  },
  // Toast notifications styles
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: Colors.success,
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2000,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Backdrop and side panel drawer styles
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF',
    zIndex: 1001,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  profileHeader: {
    backgroundColor: '#1E202C', // Slate header matching business cards
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  avatarTxt: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileRole: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeHdrBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 72 : 52,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  corpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  corpBannerTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  menuSecTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
    marginHorizontal: 8,
  },
  drawerFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 4,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  footerVer: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  // Modal Overlays and scroll lists styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 32, 44, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    paddingTop: 8,
  },
  modalHeaderSec: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
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
  textInput: {
    backgroundColor: '#F5F6FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E9F0',
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnTxt: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.divider,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnTxt: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  // Add item form cards (e.g. Contacts, Docs)
  addFormContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  addFormTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  addNewItemTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 87, 0.04)',
    marginBottom: 20,
  },
  addNewItemTriggerTxt: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  contactItemCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  contactItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  contactItemGstin: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  contactItemAddr: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Doc card styles
  docItemCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  docItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  docItemMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  // Toggle Row settings
  settingsTogglesCard: {
    backgroundColor: Colors.background,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    maxWidth: '85%',
  },
  toggleDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
});
