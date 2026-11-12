import { dbManager } from '../database/connection.js';

export class JourneyService {
  /**
   * Unified lookup handling both Application Number and Mobile Number searches.
   */
  async lookupCustomerOrJourney(queryStr, requestedType) {
    const openCol = dbManager.getCollection('openmarketjourneys');
    const jourCol = dbManager.getCollection('journeys');

    const rawQuery = String(queryStr || '').trim();
    const queryLower = rawQuery.toLowerCase();
    const queryDigits = rawQuery.replace(/\D/g, '');

    // Auto-detect search type if not explicit
    let searchType = requestedType;
    if (!searchType || searchType === 'auto') {
      if (queryLower.includes('app') || rawQuery.includes('-')) {
        searchType = 'application_number';
      } else if (queryDigits.length >= 10) {
        searchType = 'mobile_number';
      } else {
        searchType = 'auto';
      }
    }

    const openDocs = await openCol.find().toArray();
    const jourDocs = await jourCol.find().toArray();

    let matchingJourneys = [];
    let customerProfile = null;

    if (searchType === 'application_number') {
      // Find matching journey record
      matchingJourneys = jourDocs.filter(j => {
        const appNo = String(j['Application Number'] || j.application_number || '').toLowerCase();
        return appNo === queryLower || appNo.includes(queryLower);
      });

      // Find matching customer profile via journey's phone number
      if (matchingJourneys.length > 0) {
        const jPhone = String(matchingJourneys[0]['Phone No'] || matchingJourneys[0].mobile_number || '').replace(/\D/g, '');
        if (jPhone) {
          customerProfile = openDocs.find(o => {
            const oPhone = String(o['Phone No'] || o.mobile_number || '').replace(/\D/g, '');
            return oPhone === jPhone || (jPhone.length >= 5 && oPhone.includes(jPhone));
          }) || null;
        }
      }
    } else if (searchType === 'mobile_number') {
      // Match customer profile by mobile number
      customerProfile = openDocs.find(o => {
        const oPhone = String(o['Phone No'] || o.mobile_number || '').replace(/\D/g, '');
        return queryDigits && (oPhone === queryDigits || oPhone.includes(queryDigits));
      }) || null;

      // Find journey records for this mobile number
      const targetPhone = customerProfile
        ? String(customerProfile['Phone No'] || customerProfile.mobile_number || '').replace(/\D/g, '')
        : queryDigits;

      matchingJourneys = jourDocs.filter(j => {
        const jPhone = String(j['Phone No'] || j.mobile_number || '').replace(/\D/g, '');
        return targetPhone && (jPhone === targetPhone || jPhone.includes(targetPhone));
      });
    } else {
      // Fallback auto search
      customerProfile = openDocs.find(o => {
        const oPhone = String(o['Phone No'] || o.mobile_number || '').replace(/\D/g, '');
        const uId = String(o.UserId || '').toLowerCase();
        const name = String(o.Name || '').toLowerCase();
        return (queryDigits && oPhone === queryDigits) || (queryLower && (uId === queryLower || name.includes(queryLower)));
      }) || null;

      matchingJourneys = jourDocs.filter(j => {
        const appNo = String(j['Application Number'] || j.application_number || '').toLowerCase();
        const jPhone = String(j['Phone No'] || j.mobile_number || '').replace(/\D/g, '');
        const jName = String(j['Customer Name'] || '').toLowerCase();
        return (queryLower && appNo.includes(queryLower)) ||
               (queryDigits && jPhone === queryDigits) ||
               (queryLower && jName.includes(queryLower));
      });
    }

    const offersGenerated = customerProfile?.products_generated || [];
    const ineligibleOffers = customerProfile?.ineligible_offers || [];

    return {
      query: rawQuery,
      searchType,
      primaryJourney: matchingJourneys.length > 0 ? matchingJourneys[0] : null,
      journeys: matchingJourneys,
      customerProfile,
      offersGenerated,
      ineligibleOffers
    };
  }
}

export const journeyService = new JourneyService();

