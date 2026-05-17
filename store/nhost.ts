import { NhostClient } from '@nhost/nhost-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize the unified Nhost Client with your live project Subdomain
export const nhost = new NhostClient({
  subdomain: 'ocshhfpjyqoczinvpckn',
  region: 'ap-south-1', // Automatically mapped to the ap-south-1 (Mumbai, India) regional node
  clientStorage: AsyncStorage,
  clientStorageType: 'custom' // Unified SDK compatible storage type
});

console.log('[Nhost] Client successfully initialized with Subdomain: ocshhfpjyqoczinvpckn');
