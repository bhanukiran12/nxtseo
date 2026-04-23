require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { google } = require('googleapis');
const { oauth2Client, setCredentials } = require('./gmailService');

const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'www.ccbp.in';

async function getSearchConsoleData(tokens, days = 28) {
  setCredentials(tokens);
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (d) => d.toISOString().split('T')[0];

  // Overall performance
  const perfResponse = await searchconsole.searchanalytics.query({
    siteUrl: `sc-domain:ccbp.in`,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['date'],
      rowLimit: 50
    }
  });

  // Top keywords
  const keywordsResponse = await searchconsole.searchanalytics.query({
    siteUrl: `sc-domain:ccbp.in`,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['query'],
      rowLimit: 20,
      dimensionFilterGroups: [{
        filters: [{
          dimension: 'page',
          operator: 'contains',
          expression: 'intensive'
        }]
      }]
    }
  });

  // Top pages
  const pagesResponse = await searchconsole.searchanalytics.query({
    siteUrl: `sc-domain:ccbp.in`,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['page'],
      rowLimit: 10
    }
  });

  const perfRows = perfResponse.data.rows || [];
  const totalClicks = perfRows.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalImpressions = perfRows.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const avgCTR = perfRows.length > 0 ? perfRows.reduce((sum, r) => sum + (r.ctr || 0), 0) / perfRows.length : 0;
  const avgPosition = perfRows.length > 0 ? perfRows.reduce((sum, r) => sum + (r.position || 0), 0) / perfRows.length : 0;

  return {
    summary: {
      totalClicks,
      totalImpressions,
      avgCTR: (avgCTR * 100).toFixed(2),
      avgPosition: avgPosition.toFixed(1)
    },
    dateData: perfRows.map(r => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: (r.ctr * 100).toFixed(2),
      position: r.position?.toFixed(1)
    })),
    keywords: (keywordsResponse.data.rows || []).map(r => ({
      keyword: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: (r.ctr * 100).toFixed(2),
      position: r.position?.toFixed(1)
    })),
    topPages: (pagesResponse.data.rows || []).map(r => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.position?.toFixed(1)
    }))
  };
}

async function getSiteList(tokens) {
  setCredentials(tokens);
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
  const res = await searchconsole.sites.list();
  return res.data.siteEntry || [];
}

module.exports = { getSearchConsoleData, getSiteList };
