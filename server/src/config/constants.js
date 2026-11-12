/**
 * System constants, production status definitions, and product catalog metadata.
 */

export const PROD_STATUSES = Object.freeze([
  'USER_DROPPED',
  'JOURNEY_ACTIVE',
  'OFFER_EXPIRED',
  'JORUNEY_COMPLETE',
  'APP_SUBMITTED'
]);

export const PRODUCT_CATALOG = Object.freeze({
  C2PL: { name: 'Click 2 Protect Life', category: 'Term Life' },
  C2PSN: { name: 'Click 2 Protect Super Now', category: 'Term Life' },
  GPP: { name: 'Guaranteed Pension Plan', category: 'Annuity' },
  SPP: { name: 'Saral Pension Plan', category: 'Annuity' },
  PGNP: { name: 'Personal Growth Non-Par', category: 'Savings' },
  SanchayPar: { name: 'Sanchay Participating Plan', category: 'Savings' },
  SanchayPlus: { name: 'Sanchay Plus Guaranteed', category: 'Savings' },
  C2A: { name: 'Click 2 Achieve', category: 'Savings' },
  GWP: { name: 'Guaranteed Wealth Plan', category: 'Wealth' },
  ESJ: { name: 'Easy Saral Jeevan', category: 'Protection' },
  SaralJeevan: { name: 'Saral Jeevan Bima', category: 'Protection' },
  SANLP: { name: 'Sanchay Long Term Par', category: 'Savings' },
  C2APAR: { name: 'Click 2 Achieve Par', category: 'Savings' },
  ULSPRO: { name: 'ULIP Smart Pro', category: 'ULIP' }
});

export const STATUS_META = Object.freeze({
  APP_SUBMITTED: { label: 'Application Submitted', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  JOURNEY_ACTIVE: { label: 'Journey Active', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  JORUNEY_COMPLETE: { label: 'Journey Complete', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  OFFER_EXPIRED: { label: 'Offer Expired', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  USER_DROPPED: { label: 'User Dropped', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' }
});

