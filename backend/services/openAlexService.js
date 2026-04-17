const axios = require('axios');

const OPENALEX_BASE = 'https://api.openalex.org/works';

/**
 * Fetch research publications from OpenAlex
 * @param {string} query
 * @param {number} maxResults - broad candidate pool
 */
async function fetchOpenAlex(query, maxResults = 80) {
  try {
    const perPage = Math.min(maxResults, 50); // OpenAlex max per page
    const pages = Math.ceil(maxResults / perPage);
    
    const allResults = [];
    
    for (let page = 1; page <= Math.min(pages, 3); page++) {
      try {
        const url = `${OPENALEX_BASE}?search=${encodeURIComponent(query)}&per-page=${perPage}&page=${page}&sort=relevance_score:desc`;
        const res = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'CuralinkResearch/1.0 (mailto:research@curalink.app)' }
        });

        const works = res.data?.results || [];
        
        for (const work of works) {
          try {
            const title = work.title;
            if (!title) continue;

            // Abstract from inverted index
            let abstract = '';
            if (work.abstract_inverted_index) {
              abstract = reconstructAbstract(work.abstract_inverted_index);
            }
            if (!abstract && work.abstract) abstract = work.abstract;

            const authors = (work.authorships || [])
              .slice(0, 5)
              .map(a => a?.author?.display_name)
              .filter(Boolean);

            const year = work.publication_year || 'Unknown';
            const journal = work.primary_location?.source?.display_name || 
                           work.host_venue?.display_name || 
                           'OpenAlex Source';
            
            const url_link = work.primary_location?.landing_page_url || 
                            work.doi ? `https://doi.org/${work.doi}` : 
                            `https://openalex.org/${work.id}`;

            allResults.push({
              id: `openalex-${work.id?.replace('https://openalex.org/', '')}`,
              title,
              abstract: abstract || 'Abstract not available',
              authors,
              year: String(year),
              journal,
              source: 'OpenAlex',
              url: url_link,
              citedBy: work.cited_by_count || 0,
              openAlexId: work.id
            });
          } catch (e) { /* skip */ }
        }
      } catch (e) {
        console.error(`OpenAlex page ${page} error:`, e.message);
      }
    }

    return allResults;
  } catch (err) {
    console.error('OpenAlex fetch error:', err.message);
    return [];
  }
}

/**
 * Reconstruct abstract from OpenAlex inverted index format
 */
function reconstructAbstract(invertedIndex) {
  try {
    const wordPositions = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        wordPositions.push({ word, pos });
      }
    }
    wordPositions.sort((a, b) => a.pos - b.pos);
    return wordPositions.map(wp => wp.word).join(' ');
  } catch {
    return '';
  }
}

module.exports = { fetchOpenAlex };
