import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity,
  ScrollView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { MOCK_ADDRESSES } from '@/constants/MockData';

export default function SelectAddressScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = MOCK_ADDRESSES.filter(a =>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase()) ||
    a.gstin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={s.container}>
      <SafeAreaView style={s.hdrSafe}>
        <View style={s.hdr}>
          <TouchableOpacity style={s.hdrBtn} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={16} color={Colors.white} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>Select Billing Address</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Add New Address */}
      <TouchableOpacity style={s.addBtn} activeOpacity={0.7}>
        <View style={s.addIcon}><FontAwesome5 name="plus" size={14} color={Colors.primary} /></View>
        <Text style={s.addTxt}>Add New Address</Text>
        <FontAwesome5 name="chevron-right" size={12} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Search */}
      <View style={s.searchWrap}>
        <FontAwesome5 name="search" size={14} color={Colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, city or GSTIN..."
          placeholderTextColor={Colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <FontAwesome5 name="times-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Address List */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <View style={s.emptyCircle}><FontAwesome5 name="map-marker-alt" size={32} color={Colors.primaryLight} /></View>
            <Text style={s.emptyTitle}>No Addresses Found</Text>
            <Text style={s.emptySub}>Try a different search term{'\n'}or add a new address.</Text>
          </View>
        ) : (
          filtered.map(addr => (
            <TouchableOpacity
              key={addr.id}
              style={[s.addrCard, selected === addr.id && s.addrCardActive]}
              onPress={() => setSelected(addr.id)}
              activeOpacity={0.7}
            >
              <View style={s.addrTop}>
                <View style={s.addrLeft}>
                  <View style={[s.checkbox, selected === addr.id && s.checkboxActive]}>
                    {selected === addr.id && <FontAwesome5 name="check" size={10} color={Colors.white} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.addrLabel}>{addr.label}</Text>
                    <View style={s.gstinBadge}><Text style={s.gstinTxt}>GSTIN: {addr.gstin}</Text></View>
                  </View>
                </View>
              </View>
              <View style={s.addrBody}>
                <Text style={s.addrLine}>{addr.line1}</Text>
                <Text style={s.addrLine}>{addr.line2}</Text>
                <Text style={s.addrCity}>{addr.city}, {addr.state} – {addr.pincode}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Submit */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.submitBtn, !selected && s.submitBtnDisabled]}
          onPress={() => selected && router.back()}
          activeOpacity={selected ? 0.85 : 1}
        >
          <Text style={s.submitTxt}>Submit</Text>
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
  hdrTitle:{fontSize:18,fontWeight:'700',color:Colors.white},
  addBtn:{flexDirection:'row',alignItems:'center',backgroundColor:Colors.white,marginHorizontal:16,marginTop:16,padding:16,borderRadius:14,borderWidth:1,borderColor:Colors.cardBorder,elevation:2,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6,gap:12},
  addIcon:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(108,63,197,0.08)',justifyContent:'center',alignItems:'center'},
  addTxt:{flex:1,fontSize:14,fontWeight:'700',color:Colors.primary},
  searchWrap:{flexDirection:'row',alignItems:'center',backgroundColor:Colors.white,marginHorizontal:16,marginTop:12,borderRadius:12,borderWidth:1,borderColor:Colors.cardBorder,paddingHorizontal:16},
  searchIcon:{marginRight:10},
  searchInput:{flex:1,height:48,fontSize:14,color:Colors.textPrimary},
  scroll:{paddingHorizontal:16,paddingTop:12},
  addrCard:{backgroundColor:Colors.white,borderRadius:14,padding:16,marginBottom:12,borderWidth:1.5,borderColor:Colors.cardBorder,elevation:2,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6},
  addrCardActive:{borderColor:Colors.primary,backgroundColor:'rgba(108,63,197,0.02)'},
  addrTop:{flexDirection:'row',justifyContent:'space-between',marginBottom:10},
  addrLeft:{flexDirection:'row',alignItems:'center',gap:12,flex:1},
  checkbox:{width:22,height:22,borderRadius:6,borderWidth:2,borderColor:Colors.cardBorder,justifyContent:'center',alignItems:'center'},
  checkboxActive:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  addrLabel:{fontSize:15,fontWeight:'700',color:Colors.textPrimary,marginBottom:4},
  gstinBadge:{backgroundColor:Colors.background,paddingHorizontal:8,paddingVertical:3,borderRadius:6,alignSelf:'flex-start'},
  gstinTxt:{fontSize:10,fontWeight:'600',color:Colors.textMuted,letterSpacing:0.3},
  addrBody:{marginLeft:34},
  addrLine:{fontSize:13,color:Colors.textSecondary,lineHeight:20},
  addrCity:{fontSize:13,fontWeight:'600',color:Colors.textPrimary,marginTop:2},
  emptyBox:{alignItems:'center',paddingTop:60},
  emptyCircle:{width:80,height:80,borderRadius:40,backgroundColor:'rgba(108,63,197,0.08)',justifyContent:'center',alignItems:'center',marginBottom:16},
  emptyTitle:{fontSize:16,fontWeight:'700',color:Colors.textPrimary,marginBottom:6},
  emptySub:{fontSize:13,color:Colors.textSecondary,textAlign:'center',lineHeight:20},
  bottomBar:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:Colors.white,paddingHorizontal:16,paddingVertical:12,paddingBottom:Platform.OS==='ios'?32:16,borderTopWidth:1,borderTopColor:Colors.cardBorder,elevation:10,shadowColor:Colors.shadowDark,shadowOffset:{width:0,height:-4},shadowOpacity:0.1,shadowRadius:8},
  submitBtn:{height:54,borderRadius:16,backgroundColor:Colors.primary,justifyContent:'center',alignItems:'center',elevation:6,shadowColor:Colors.primary,shadowOffset:{width:0,height:4},shadowOpacity:0.35,shadowRadius:10},
  submitBtnDisabled:{backgroundColor:Colors.placeholder,shadowOpacity:0},
  submitTxt:{fontSize:16,fontWeight:'700',color:Colors.white},
});
