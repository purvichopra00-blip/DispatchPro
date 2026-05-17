import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { MOCK_ORDERS } from '@/constants/MockData';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = MOCK_ORDERS.find(o => o.id === orderId) || MOCK_ORDERS[0];

  const [billTo, setBillTo] = useState('');
  const [shipTo, setShipTo] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [qty, setQty] = useState('');
  const [showBillDD, setShowBillDD] = useState(false);
  const [showShipDD, setShowShipDD] = useState(false);

  const addresses = ['Head Office – Noida', 'Warehouse – Delhi', 'Branch Office – Mumbai'];

  const handleSubmit = () => {
    Alert.alert('Success', 'Vehicle added successfully!', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={16} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>Add Vehicle</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={s.summaryCard}>
          <View style={s.sumRow}>
            <View style={s.sumIcon}><FontAwesome5 name="clipboard-check" size={16} color={Colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.sumCo}>{order.companyName}</Text>
              <Text style={s.sumUnit}>{order.unitName}</Text>
            </View>
          </View>
          <View style={s.sumGrid}>
            <View style={s.sumGi}><Text style={s.sumGL}>Order No</Text><Text style={s.sumGV}>{order.orderNo}</Text></View>
            <View style={s.sumGi}><Text style={s.sumGL}>Available</Text><Text style={[s.sumGV,{color:Colors.success}]}>{order.availableQty} QTL</Text></View>
            <View style={s.sumGi}><Text style={s.sumGL}>Product</Text><Text style={s.sumGV}>{order.product} {order.grade}</Text></View>
            <View style={s.sumGi}><Text style={s.sumGL}>Price/QTL</Text><Text style={s.sumGV}>₹{order.pricePerQTL.toLocaleString('en-IN')}</Text></View>
          </View>
        </View>

        {/* Form Fields */}
        <Text style={s.sectionTitle}>Vehicle Details</Text>

        {/* Bill To Dropdown */}
        <Text style={s.label}>Bill To</Text>
        <TouchableOpacity style={s.dropdown} onPress={() => { setShowBillDD(!showBillDD); setShowShipDD(false); }}>
          <Text style={billTo ? s.ddVal : s.ddPlaceholder}>{billTo || 'Select Billing Address'}</Text>
          <FontAwesome5 name={showBillDD ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.textMuted} />
        </TouchableOpacity>
        {showBillDD && (
          <View style={s.ddList}>
            {addresses.map(a => (
              <TouchableOpacity key={a} style={s.ddItem} onPress={() => { setBillTo(a); setShowBillDD(false); }}>
                <Text style={s.ddItemTxt}>{a}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.ddAddBtn} onPress={() => router.push('/select-address')}>
              <FontAwesome5 name="plus" size={10} color={Colors.primary} />
              <Text style={s.ddAddTxt}>Select from Address Book</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ship To Dropdown */}
        <Text style={s.label}>Ship To</Text>
        <TouchableOpacity style={s.dropdown} onPress={() => { setShowShipDD(!showShipDD); setShowBillDD(false); }}>
          <Text style={shipTo ? s.ddVal : s.ddPlaceholder}>{shipTo || 'Select Shipping Address'}</Text>
          <FontAwesome5 name={showShipDD ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.textMuted} />
        </TouchableOpacity>
        {showShipDD && (
          <View style={s.ddList}>
            {addresses.map(a => (
              <TouchableOpacity key={a} style={s.ddItem} onPress={() => { setShipTo(a); setShowShipDD(false); }}>
                <Text style={s.ddItemTxt}>{a}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.ddAddBtn} onPress={() => router.push('/select-address')}>
              <FontAwesome5 name="plus" size={10} color={Colors.primary} />
              <Text style={s.ddAddTxt}>Select from Address Book</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Text inputs */}
        <Text style={s.label}>Vehicle Number</Text>
        <View style={s.inputWrap}>
          <FontAwesome5 name="truck" size={14} color={Colors.primary} style={s.inputIcon} />
          <TextInput style={s.input} placeholder="e.g. UP-32-AB-1234" placeholderTextColor={Colors.placeholder} value={vehicle} onChangeText={setVehicle} autoCapitalize="characters" />
        </View>

        <Text style={s.label}>Driver Name</Text>
        <View style={s.inputWrap}>
          <FontAwesome5 name="user" size={14} color={Colors.primary} style={s.inputIcon} />
          <TextInput style={s.input} placeholder="Enter driver name" placeholderTextColor={Colors.placeholder} value={driver} onChangeText={setDriver} />
        </View>

        <Text style={s.label}>Driver Mobile</Text>
        <View style={s.inputWrap}>
          <FontAwesome5 name="phone-alt" size={14} color={Colors.primary} style={s.inputIcon} />
          <TextInput style={s.input} placeholder="Enter mobile number" placeholderTextColor={Colors.placeholder} value={driverMobile} onChangeText={setDriverMobile} keyboardType="phone-pad" />
        </View>

        <Text style={s.label}>Quantity (QTL)</Text>
        <View style={s.inputWrap}>
          <FontAwesome5 name="weight" size={14} color={Colors.primary} style={s.inputIcon} />
          <TextInput style={s.input} placeholder="Enter quantity" placeholderTextColor={Colors.placeholder} value={qty} onChangeText={setQty} keyboardType="numeric" />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <FontAwesome5 name="plus-circle" size={16} color={Colors.white} />
          <Text style={s.submitTxt}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  hdrSafe:{backgroundColor:Colors.primary},
  hdr:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,paddingTop:Platform.OS==='android'?40:14,backgroundColor:Colors.primary},
  hdrBtn:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(255,255,255,0.12)',justifyContent:'center',alignItems:'center'},
  hdrTitle:{fontSize:20,fontWeight:'700',color:Colors.white},
  scroll:{paddingHorizontal:16,paddingTop:16},
  summaryCard:{backgroundColor:Colors.white,borderRadius:14,padding:16,borderWidth:1,borderColor:Colors.cardBorder,elevation:2,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6,marginBottom:20},
  sumRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},
  sumIcon:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(108,63,197,0.08)',justifyContent:'center',alignItems:'center'},
  sumCo:{fontSize:15,fontWeight:'700',color:Colors.textPrimary},
  sumUnit:{fontSize:12,color:Colors.textSecondary,marginTop:1},
  sumGrid:{flexDirection:'row',flexWrap:'wrap'},
  sumGi:{width:'50%',paddingVertical:4},
  sumGL:{fontSize:10,fontWeight:'600',color:Colors.textMuted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:2},
  sumGV:{fontSize:13,fontWeight:'600',color:Colors.textPrimary},
  sectionTitle:{fontSize:16,fontWeight:'700',color:Colors.textPrimary,marginBottom:16},
  label:{fontSize:12,fontWeight:'600',color:Colors.textSecondary,marginBottom:6,marginTop:12},
  dropdown:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:Colors.white,borderRadius:12,borderWidth:1,borderColor:Colors.cardBorder,paddingHorizontal:16,height:50},
  ddVal:{fontSize:14,color:Colors.textPrimary,fontWeight:'500'},
  ddPlaceholder:{fontSize:14,color:Colors.placeholder},
  ddList:{backgroundColor:Colors.white,borderRadius:12,borderWidth:1,borderColor:Colors.cardBorder,marginTop:4,overflow:'hidden'},
  ddItem:{paddingHorizontal:16,paddingVertical:14,borderBottomWidth:1,borderBottomColor:Colors.divider},
  ddItemTxt:{fontSize:14,color:Colors.textPrimary},
  ddAddBtn:{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,paddingVertical:14,backgroundColor:'rgba(108,63,197,0.04)'},
  ddAddTxt:{fontSize:13,fontWeight:'600',color:Colors.primary},
  inputWrap:{flexDirection:'row',alignItems:'center',backgroundColor:Colors.white,borderRadius:12,borderWidth:1,borderColor:Colors.cardBorder,paddingHorizontal:16},
  inputIcon:{marginRight:12},
  input:{flex:1,height:50,fontSize:14,color:Colors.textPrimary},
  bottomBar:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:Colors.white,paddingHorizontal:16,paddingVertical:12,paddingBottom:Platform.OS==='ios'?32:16,borderTopWidth:1,borderTopColor:Colors.cardBorder,elevation:10,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:-4},shadowOpacity:0.1,shadowRadius:8},
  submitBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,height:54,borderRadius:16,backgroundColor:Colors.primary,elevation:6,shadowColor:Colors.primary,shadowOffset:{width:0,height:4},shadowOpacity:0.35,shadowRadius:10},
  submitTxt:{fontSize:16,fontWeight:'700',color:Colors.white},
});
