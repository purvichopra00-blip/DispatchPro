import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function PaymentsScreen() {
  const payments = [
    {id:'PAY-001',order:'ORD-2026-05-0021',amount:862500,date:'12 May 2026',status:'Completed',company:'Balrampur Chini Mills'},
    {id:'PAY-002',order:'ORD-2026-05-0034',amount:1232000,date:'10 May 2026',status:'Processing',company:'Dhampur Sugar Mills'},
    {id:'PAY-003',order:'ORD-2026-05-0058',amount:2094000,date:'08 May 2026',status:'Completed',company:'Bajaj Hindusthan Sugar'},
  ];

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn}><FontAwesome5 name="bars" size={18} color={Colors.white} /></TouchableOpacity>
          <Text style={s.hdrTitle}>Payments</Text>
          <TouchableOpacity style={s.hdrBtn}><FontAwesome5 name="download" size={16} color={Colors.white} /></TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Summary cards */}
      <View style={s.sumRow}>
        <View style={[s.sumCard,{backgroundColor:Colors.primary}]}>
          <Text style={s.sumLabel}>Total Received</Text>
          <Text style={s.sumVal}>₹29,56,500</Text>
        </View>
        <View style={s.sumCard}>
          <Text style={[s.sumLabel,{color:Colors.textMuted}]}>Pending</Text>
          <Text style={[s.sumVal,{color:Colors.warning}]}>₹12,32,000</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:20}}>
        {payments.map(p=>(
          <View key={p.id} style={s.card}>
            <View style={s.cardTop}>
              <View style={s.payIcon}><FontAwesome5 name="receipt" size={14} color={Colors.primary} /></View>
              <View style={{flex:1}}>
                <Text style={s.payId}>{p.id}</Text>
                <Text style={s.payCo}>{p.company}</Text>
              </View>
              <View style={[s.sBadge, p.status==='Completed'?s.sOk:s.sWarn]}>
                <Text style={[s.sBTxt,{color:p.status==='Completed'?Colors.success:Colors.warning}]}>{p.status}</Text>
              </View>
            </View>
            <View style={s.cardBot}>
              <View style={s.cbItem}><Text style={s.cbL}>Order</Text><Text style={s.cbV}>{p.order}</Text></View>
              <View style={s.cbItem}><Text style={s.cbL}>Amount</Text><Text style={[s.cbV,{color:Colors.primary,fontWeight:'800'}]}>{fmt(p.amount)}</Text></View>
              <View style={s.cbItem}><Text style={s.cbL}>Date</Text><Text style={s.cbV}>{p.date}</Text></View>
            </View>
          </View>
        ))}
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
  sumRow:{flexDirection:'row',paddingHorizontal:16,paddingTop:16,gap:12},
  sumCard:{flex:1,borderRadius:14,padding:16,backgroundColor:Colors.white,borderWidth:1,borderColor:Colors.cardBorder,elevation:2,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6},
  sumLabel:{fontSize:11,fontWeight:'600',color:'rgba(255,255,255,0.7)',marginBottom:6},
  sumVal:{fontSize:18,fontWeight:'800',color:Colors.white},
  card:{backgroundColor:Colors.white,marginHorizontal:16,marginTop:12,borderRadius:14,padding:16,borderWidth:1,borderColor:Colors.cardBorder,elevation:2,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6},
  cardTop:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},
  payIcon:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(108,63,197,0.08)',justifyContent:'center',alignItems:'center'},
  payId:{fontSize:14,fontWeight:'700',color:Colors.textPrimary},
  payCo:{fontSize:12,color:Colors.textSecondary,marginTop:1},
  sBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:8},
  sOk:{backgroundColor:'rgba(16,185,129,0.08)'},
  sWarn:{backgroundColor:'rgba(245,158,11,0.08)'},
  sBTxt:{fontSize:11,fontWeight:'600'},
  cardBot:{flexDirection:'row',justifyContent:'space-between'},
  cbItem:{},
  cbL:{fontSize:10,fontWeight:'600',color:Colors.textMuted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:2},
  cbV:{fontSize:13,fontWeight:'600',color:Colors.textPrimary},
});
