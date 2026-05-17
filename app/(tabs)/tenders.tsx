import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function TendersScreen() {
  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn}><FontAwesome5 name="bars" size={18} color={Colors.white} /></TouchableOpacity>
          <Text style={s.hdrTitle}>Tenders</Text>
          <TouchableOpacity style={s.hdrBtn}><FontAwesome5 name="bell" size={16} color={Colors.white} /></TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filter chips */}
      <View style={s.chipRow}>
        {['All','Open','Limited','Closed'].map((c,i)=>(
          <TouchableOpacity key={c} style={[s.chip, i===0&&s.chipActive]}>
            <Text style={[s.chipTxt, i===0&&s.chipTxtActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sample tender cards */}
      {[
        {id:'TND-2026-00142',type:'Open Tender',product:'Sugar S-30',qty:'500 QTL',date:'15 May 2026',status:'Active'},
        {id:'TND-2026-00189',type:'Limited Tender',product:'Sugar M-30',qty:'700 QTL',date:'14 May 2026',status:'Active'},
        {id:'TND-2026-00205',type:'Open Tender',product:'Sugar S-30',qty:'300 QTL',date:'13 May 2026',status:'Closed'},
      ].map(t=>(
        <View key={t.id} style={s.card}>
          <View style={s.cardTop}>
            <View>
              <Text style={s.tId}>{t.id}</Text>
              <Text style={s.tType}>{t.type}</Text>
            </View>
            <View style={[s.sBadge, t.status==='Active'?s.sBadgeOk:s.sBadgeGray]}>
              <Text style={[s.sBadgeTxt, t.status==='Active'?{color:Colors.success}:{color:Colors.textMuted}]}>{t.status}</Text>
            </View>
          </View>
          <View style={s.cardBot}>
            <View style={s.cbi}><FontAwesome5 name="box" size={11} color={Colors.textMuted} /><Text style={s.cbTxt}>{t.product}</Text></View>
            <View style={s.cbi}><FontAwesome5 name="weight" size={11} color={Colors.textMuted} /><Text style={s.cbTxt}>{t.qty}</Text></View>
            <View style={s.cbi}><FontAwesome5 name="calendar-alt" size={11} color={Colors.textMuted} /><Text style={s.cbTxt}>{t.date}</Text></View>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  hdrSafe:{backgroundColor:Colors.primary},
  hdr:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,paddingTop:Platform.OS==='android'?40:14,backgroundColor:Colors.primary},
  hdrBtn:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(255,255,255,0.12)',justifyContent:'center',alignItems:'center'},
  hdrTitle:{fontSize:20,fontWeight:'700',color:Colors.white},
  chipRow:{flexDirection:'row',paddingHorizontal:16,paddingVertical:12,gap:8,backgroundColor:Colors.white,borderBottomWidth:1,borderBottomColor:Colors.cardBorder},
  chip:{paddingHorizontal:18,paddingVertical:10,borderRadius:24,backgroundColor:Colors.background,borderWidth:1,borderColor:Colors.cardBorder},
  chipActive:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  chipTxt:{fontSize:13,fontWeight:'600',color:Colors.textSecondary},
  chipTxtActive:{color:Colors.white},
  card:{backgroundColor:Colors.white,marginHorizontal:16,marginTop:12,borderRadius:14,padding:16,borderWidth:1,borderColor:Colors.cardBorder,elevation:2,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6},
  cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12},
  tId:{fontSize:15,fontWeight:'700',color:Colors.textPrimary},
  tType:{fontSize:12,color:Colors.textSecondary,marginTop:2},
  sBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:8},
  sBadgeOk:{backgroundColor:'rgba(16,185,129,0.08)'},
  sBadgeGray:{backgroundColor:Colors.background},
  sBadgeTxt:{fontSize:11,fontWeight:'600'},
  cardBot:{flexDirection:'row',gap:16},
  cbi:{flexDirection:'row',alignItems:'center',gap:5},
  cbTxt:{fontSize:12,color:Colors.textSecondary,fontWeight:'500'},
});
