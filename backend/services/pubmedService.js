const axios = require('axios');
const xml2js = require('xml2js');

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Fetch publications from PubMed
 * @param {string} query - search query
 * @param {number} maxResults - max results to fetch (broad pool)
 */
async function fetchPubMed(query, maxResults = 80) {
  try {
    // Step 1: Search for IDs
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=pub+date&retmode=json`;
    const searchRes = await axios.get(searchUrl, { timeout: 15000 });
    
    const ids = searchRes.data?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    // Fetch in batches of 20 to avoid URL limits
    const batchSize = 20;
    const batches = [];
    for (let i = 0; i < Math.min(ids.length, maxResults); i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }

    const allArticles = [];
    for (const batch of batches) {
      try {
        const fetchUrl = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${batch.join(',')}&retmode=xml`;
        const fetchRes = await axios.get(fetchUrl, { timeout: 15000 });
        const parsed = await xml2js.parseStringPromise(fetchRes.data, { explicitArray: false });
        
        const articles = parsed?.PubmedArticleSet?.PubmedArticle;
        if (!articles) continue;
        
        const articleArr = Array.isArray(articles) ? articles : [articles];
        
        for (const article of articleArr) {
          try {
            const medline = article?.MedlineCitation;
            const articleData = medline?.Article;
            
            const title = articleData?.ArticleTitle;
            const abstract = articleData?.Abstract?.AbstractText;
            const journal = articleData?.Journal?.Title;
            const year = medline?.DateRevised?.Year || 
                         articleData?.Journal?.JournalIssue?.PubDate?.Year || 
                         'Unknown';
            
            // Extract authors
            const authorList = articleData?.AuthorList?.Author;
            let authors = [];
            if (authorList) {
              const authArr = Array.isArray(authorList) ? authorList : [authorList];
              authors = authArr.slice(0, 5).map(a => {
                const last = a.LastName || '';
                const fore = a.ForeName || a.Initials || '';
                return `${last} ${fore}`.trim();
              }).filter(Boolean);
            }

            const pmid = medline?.PMID?._ || medline?.PMID;
            
            if (title && abstract) {
              allArticles.push({
                id: `pubmed-${pmid}`,
                title: typeof title === 'object' ? (title._ || JSON.stringify(title)) : title,
                abstract: typeof abstract === 'object' ? (abstract._ || JSON.stringify(abstract)) : abstract,
                authors,
                year: String(year),
                journal: journal || 'PubMed Journal',
                source: 'PubMed',
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
                pmid: String(pmid)
              });
            }
          } catch (e) { /* skip malformed */ }
        }
      } catch (e) {
        console.error('PubMed batch fetch error:', e.message);
      }
    }

    return allArticles;
  } catch (err) {
    console.error('PubMed fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchPubMed };
