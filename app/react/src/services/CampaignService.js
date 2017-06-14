import ApiService from './ApiService';

const getCampaignEmail = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint);
};

const getEmailBlast = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint);
};

const updateCampaignEmail = (campaignId, body) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

const getAllEmailBlast = (campaignId, body) => {
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
  getAllEmailBlast
};
