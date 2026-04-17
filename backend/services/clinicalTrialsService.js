const axios = require('axios');

const CLINICAL_TRIALS_BASE = 'https://clinicaltrials.gov/api/v2/studies';

/**
 * Fetch clinical trials from ClinicalTrials.gov
 */
async function fetchClinicalTrials(disease, query = '', location = '', maxResults = 30) {
  try {
    const searchTerm = query ? `${disease} ${query}`.trim() : disease;
    
    const params = {
      'query.cond': disease,
      'query.term': query || undefined,
      'pageSize': maxResults,
      'format': 'json'
    };

    // Add location filter if provided
    if (location) {
      params['query.locn'] = location;
    }

    // Clean undefined params
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

    const res = await axios.get(CLINICAL_TRIALS_BASE, { 
      params,
      timeout: 15000 
    });

    const studies = res.data?.studies || [];
    const results = [];

    for (const study of studies) {
      try {
        const proto = study.protocolSection;
        if (!proto) continue;

        const id = proto.identificationModule?.nctId;
        const title = proto.identificationModule?.briefTitle || proto.identificationModule?.officialTitle;
        const status = proto.statusModule?.overallStatus;
        const phase = proto.designModule?.phases?.join(', ') || 'Not specified';
        
        // Eligibility
        const eligibility = proto.eligibilityModule;
        const criteria = eligibility?.eligibilityCriteria || 'See full details on ClinicalTrials.gov';
        const minAge = eligibility?.minimumAge;
        const maxAge = eligibility?.maximumAge;
        const sex = eligibility?.sex;

        // Conditions
        const conditions = proto.conditionsModule?.conditions || [];

        // Locations
        const locationList = proto.contactsLocationsModule?.locations || [];
        const locationNames = locationList
          .slice(0, 3)
          .map(l => [l.city, l.country].filter(Boolean).join(', '))
          .filter(Boolean);

        // Contacts
        const centralContacts = proto.contactsLocationsModule?.centralContacts || [];
        const contact = centralContacts[0];
        
        // Interventions
        const interventions = proto.armsInterventionsModule?.interventions || [];
        const interventionNames = interventions.slice(0, 3).map(i => i.name).filter(Boolean);

        // Brief summary
        const summary = proto.descriptionModule?.briefSummary || '';
        const startDate = proto.statusModule?.startDateStruct?.date || 'Unknown';

        if (title) {
          results.push({
            id: `trial-${id}`,
            nctId: id,
            title,
            status: status || 'Unknown',
            phase,
            conditions,
            interventions: interventionNames,
            summary: summary.slice(0, 500),
            eligibility: {
              criteria: criteria.slice(0, 800),
              minAge: minAge || 'Not specified',
              maxAge: maxAge || 'Not specified',
              sex: sex || 'All'
            },
            locations: locationNames,
            contact: contact ? {
              name: contact.name || '',
              phone: contact.phone || '',
              email: contact.email || ''
            } : null,
            startDate,
            url: `https://clinicaltrials.gov/study/${id}`
          });
        }
      } catch (e) { /* skip malformed */ }
    }

    return results;
  } catch (err) {
    console.error('ClinicalTrials fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchClinicalTrials };
