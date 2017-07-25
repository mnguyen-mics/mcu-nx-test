import ApiService from './ApiService';

const getCampaignEmail = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint);
};

const getCampaignDisplay = (campaignId) => {
  const endpoint = `display_campaigns/${campaignId}?view=deep`;
  return ApiService.getRequest(endpoint);
};

const getAdGroup = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.getRequest(endpoint);
};

const getAds = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
};

// const getEmailBlast = (campaignId) => {
//   const endpoint = `email_campaigns/${campaignId}`;
//   return ApiService.getRequest(endpoint);
// };

const updateCampaignEmail = (campaignId, body) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

const updateCampaignDisplay = (campaignId, body) => {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

const updateAdGroup = (campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.putRequest(endpoint, body);
};

const updateAd = (adId, campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
  return ApiService.putRequest(endpoint, body);
};

const getAllEmailBlast = () => {
  const emailBlast = {
    status: 'ok',
    data: [{
      id: 1,
      blastName: 'test',
      subjectLine: 'this is a subject',
      fromEmail: 'esanchez@mics.com',
      fromName: 'Em Sanchez',
      replyTo: 'esanchez@mics.com',
      sendDate: '2017-08-12'
    }, {
      id: 2,
      blastName: 'test',
      subjectLine: 'this is a subject',
      fromEmail: 'esanchez@mics.com',
      fromName: 'Em Sanchez',
      replyTo: 'esanchez@mics.com',
      sendDate: '2017-08-12'
    }, {
      id: 3,
      blastName: 'test',
      subjectLine: 'this is a subject',
      fromEmail: 'esanchez@mics.com',
      fromName: 'Em Sanchez',
      replyTo: 'esanchez@mics.com',
      sendDate: '2017-08-12'
    }]
  };
  return emailBlast;
};

const getCampaigns = (organisationId, campaignType, options = {}) => {
  const endpoint = 'campaigns';

  const params = {
    organisation_id: organisationId,
    campaign_type: campaignType,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getCampaignEmail,
  updateCampaignEmail,
  getCampaigns,
  getAllEmailBlast,
  getCampaignDisplay,
  updateCampaignDisplay,
  getAdGroup,
  updateAdGroup,
  getAds,
  updateAd
};
