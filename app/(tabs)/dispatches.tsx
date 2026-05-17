import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { DISPATCH_STATUSES, DispatchStatus } from '@/constants/MockData';

export default function DispatchesScreen() {
  const [activeStatus, setActiveStatus] = useState<DispatchStatus>('Arriving');

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <FontAwesome5 name="bars" size={18} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dispatches</Text>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <FontAwesome5 name="filter" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Status Tabs */}
      <View style={styles.statusTabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusTabScroll}
        >
          {DISPATCH_STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusTab,
                activeStatus === status && styles.statusTabActive,
              ]}
              onPress={() => setActiveStatus(status)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusTabText,
                  activeStatus === status && styles.statusTabTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <FontAwesome5
            name="truck-loading"
            size={40}
            color={Colors.primaryLight}
          />
        </View>
        <Text style={styles.emptyTitle}>No Dispatch Available</Text>
        <Text style={styles.emptySubtitle}>
          No Dispatch Available In This Status.{'\n'}Check Other Status.
        </Text>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabSecondary} activeOpacity={0.8}>
          <FontAwesome5 name="info" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary} activeOpacity={0.8}>
          <FontAwesome5 name="search" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafe: {
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? 40 : 14,
    backgroundColor: Colors.primary,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
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
    borderRadius: 24,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(108, 63, 197, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    gap: 12,
  },
  fabSecondary: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  fabPrimary: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
