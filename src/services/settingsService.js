import { supabase } from './supabase';

const toCamel = (s) => {
  return s.replace(/(_\w)/g, (match) => {
    return match[1].toUpperCase();
  });
};

const keysToCamel = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamel(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamel(key);
    acc[camelKey] = keysToCamel(obj[key]);
    return acc;
  }, {});
};

const toSnake = (s) => {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const keysToSnake = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = toSnake(key);
    acc[snakeKey] = keysToSnake(obj[key]);
    return acc;
  }, {});
};

export const getSettings = async () => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
    throw error;
  }
  console.log(data);
  // Return default values if no settings exist
  return data ? keysToCamel(data) : {
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    currency: 'USD',
    enableTaxes: false,
    taxRate: 0,
    freeShippingThreshold: 0,
    standardShippingRate: 0,
    expressShippingRate: 0,
    enableInternationalShipping: false,
    internationalShippingRate: 0,
    enableCreditCard: false,
    enablePaypal: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: ''
  };
};

export const updateSettings = async (settings) => {
  const snakeCaseSettings = keysToSnake(settings);

  const { data, error } = await supabase
    .from('store_settings')
    .upsert(snakeCaseSettings, { onConflict: 'id' })
    .select()
    .single();
  
  if (error) throw error;
  return keysToCamel(data);
  
};