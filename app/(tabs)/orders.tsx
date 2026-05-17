import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { MOCK_ORDERS, Order } from '@/constants/MockData';

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.cardHead}>
        <View style={s.cardHeadL}>
          <View style={s.coIcon}><FontAwesome5 name="building" size={14} color={Colors.primary} /></View>
          <View style={{flex:1}}>
            <Text style={s.coName} numberOfLines={1}>{order.companyName}</Text>
            <Text style={s.unitName}>{order.unitName}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.shareBtn}><FontAwesome5 name="share-alt" size={14} color={Colors.primary} /></TouchableOpacity>
      </View>

      {/* Status */}
      <View style={s.statusRow}>
        <View style={[s.badge, order.status==='Approved'&&s.badgeOk, order.status==='Pending'&&s.badgeWarn]}>
          <FontAwesome5 name={order.status==='Approved'?'check-circle':'clock'} size={10} color={order.status==='Approved'?Colors.success:Colors.warning} />
          <Text style={[s.badgeTxt, {color: order.status==='Approved'?Colors.success:Colors.warning}]}>{order.status}</Text>
        </View>
        <Text style={s.buyer}><FontAwesome5 name="user" size={10} color={Colors.textMuted} /> {order.buyerName}</Text>
      </View>

      {/* Info grid */}
      <View style={s.grid}>
        {[['Tender No',order.tenderNo],['Order No',order.orderNo],['Tender Type',order.tenderType],['Product',order.product],['Grade',order.grade],['Season',order.season]].map(([l,v])=>(
          <View key={l} style={s.gi}><Text style={s.gl}>{l}</Text><Text style={s.gv}>{v}</Text></View>
        ))}
      </View>

      {/* Price */}
      <View style={s.priceRow}>
        <View style={s.priceBox}><Text style={s.pL}>Price/QTL</Text><Text style={s.pV}>{fmt(order.pricePerQTL)}</Text></View>
        <View style={[s.priceBox,s.priceHL]}><Text style={s.pLW}>Total Amount</Text><Text style={s.pVW}>{fmt(order.totalAmount)}</Text></View>
      </View>

      {/* Qty */}
      <View style={s.qRow}>
        {[['Total Qty',order.totalQty,'cubes',undefined],['Dispatched',order.dispatchedQty,'truck',Colors.success],['Yet to Load',order.yetToLoadQty,'hourglass-half',Colors.warning],['Available',order.availableQty,'box-open',Colors.info]].map(([l,v,ic,c])=>(
          <View key={l as string} style={s.qItem}>
            <FontAwesome5 name={ic as string} size={12} color={(c as string)||Colors.textMuted} style={{marginBottom:4}} />
            <Text style={s.qV}>{v} QTL</Text><Text style={s.qL}>{l as string}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={s.actRow}>
        <TouchableOpacity style={s.actBtn}><FontAwesome5 name="file-invoice" size={12} color={Colors.primary} /><Text style={s.actTxt}>Billing GSTIN</Text></TouchableOpacity>
        <TouchableOpacity style={s.actBtn}><FontAwesome5 name="shipping-fast" size={12} color={Colors.primary} /><Text style={s.actTxt}>Shipping GSTIN</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={s.tBtn} onPress={()=>router.push({pathname:'/add-vehicle',params:{orderId:order.id}})}>
        <FontAwesome5 name="truck-moving" size={14} color={Colors.white} /><Text style={s.tBtnTxt}>Assign Transporter</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OrdersScreen() {
  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn}><FontAwesome5 name="bars" size={18} color={Colors.white} /></TouchableOpacity>
          <Text style={s.hdrTitle}>Orders</Text>
          <TouchableOpacity style={s.hdrBtn}><FontAwesome5 name="search" size={16} color={Colors.white} /></TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={s.pill}><Text style={s.pillTxt}>{MOCK_ORDERS.length} Orders Found</Text></View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {MOCK_ORDERS.map(o=><OrderCard key={o.id} order={o} />)}
        <View style={{height:20}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  hdrSafe:{backgroundColor:Colors.primary},
  hdr:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,paddingTop:Platform.OS==='android'?40:14,backgroundColor:Colors.primary},
  hdrBtn:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(255,255,255,0.12)',justifyContent:'center',alignItems:'center'},
  hdrTitle:{fontSize:20,fontWeight:'700',color:Colors.white},
  pill:{alignSelf:'center',backgroundColor:Colors.white,paddingHorizontal:16,paddingVertical:8,borderRadius:20,marginTop:12,marginBottom:4,borderWidth:1,borderColor:Colors.cardBorder},
  pillTxt:{fontSize:12,fontWeight:'600',color:Colors.textSecondary},
  scroll:{paddingHorizontal:16,paddingTop:12},
  card:{backgroundColor:Colors.white,borderRadius:16,marginBottom:16,padding:16,borderWidth:1,borderColor:Colors.cardBorder,elevation:3,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.08,shadowRadius:8},
  cardHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},
  cardHeadL:{flexDirection:'row',alignItems:'center',flex:1,gap:10},
  coIcon:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(108,63,197,0.08)',justifyContent:'center',alignItems:'center'},
  coName:{fontSize:15,fontWeight:'700',color:Colors.textPrimary},
  unitName:{fontSize:12,color:Colors.textSecondary,marginTop:1},
  shareBtn:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(108,63,197,0.08)',justifyContent:'center',alignItems:'center'},
  statusRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},
  badge:{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:5,borderRadius:8,gap:5},
  badgeOk:{backgroundColor:'rgba(16,185,129,0.08)'},
  badgeWarn:{backgroundColor:'rgba(245,158,11,0.08)'},
  badgeTxt:{fontSize:12,fontWeight:'600'},
  buyer:{fontSize:12,color:Colors.textMuted},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:2,marginBottom:14},
  gi:{width:'48%',paddingVertical:6},
  gl:{fontSize:10,fontWeight:'600',color:Colors.textMuted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:2},
  gv:{fontSize:13,fontWeight:'600',color:Colors.textPrimary},
  priceRow:{flexDirection:'row',gap:10,marginBottom:14},
  priceBox:{flex:1,backgroundColor:Colors.background,borderRadius:12,padding:12,alignItems:'center'},
  priceHL:{backgroundColor:Colors.primary},
  pL:{fontSize:11,color:Colors.textMuted,fontWeight:'600',marginBottom:4},
  pV:{fontSize:16,fontWeight:'800',color:Colors.textPrimary},
  pLW:{fontSize:11,color:'rgba(255,255,255,0.7)',fontWeight:'600',marginBottom:4},
  pVW:{fontSize:16,fontWeight:'800',color:Colors.white},
  qRow:{flexDirection:'row',gap:8,marginBottom:14},
  qItem:{flex:1,alignItems:'center',backgroundColor:Colors.background,borderRadius:10,paddingVertical:10,paddingHorizontal:4},
  qV:{fontSize:12,fontWeight:'700',color:Colors.textPrimary,marginBottom:2},
  qL:{fontSize:9,color:Colors.textMuted,fontWeight:'600',textAlign:'center'},
  actRow:{flexDirection:'row',gap:8,marginBottom:10},
  actBtn:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:10,borderRadius:10,borderWidth:1.5,borderColor:Colors.primary,backgroundColor:'rgba(108,63,197,0.04)'},
  actTxt:{fontSize:11,fontWeight:'700',color:Colors.primary},
  tBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:12,borderRadius:12,backgroundColor:Colors.primary,elevation:4,shadowColor:Colors.primary,shadowOffset:{width:0,height:3},shadowOpacity:0.25,shadowRadius:8},
  tBtnTxt:{fontSize:14,fontWeight:'700',color:Colors.white},
});
