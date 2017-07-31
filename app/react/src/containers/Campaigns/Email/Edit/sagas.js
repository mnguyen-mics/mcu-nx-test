// import { takeEvery } from 'redux-saga';
// import { call, fork, put, all, select } from 'redux-saga/effects';

// import log from '../../../../utils/Logger';

// import { notifyError } from '../../../../state/Notifications/actions';
// import { fetchCampaignEmail } from '../../../../state/Campaign/Email/actions';
// import CampaignService from '../../../../services/CampaignService';
// import EmailRouterService from '../../../../services/EmailRouterService';

// import { CAMPAIGN_EMAIL_CREATE, CAMPAIGN_EMAIL_FETCH } from '../../../../state/action-types';


// function* createEmailRouters(campaignId, routers) {
//   return yield all(routers.map(router => call(CampaignService.createEmailRouter, campaignId, router.email_router_id)));
// }

// function* createEmailBlasts(campaignId, blasts) {
//   return yield all(blasts.map(blast => call(CampaignService.createEmailblast, campaignId, blast)));
// }

// function* createEmailTemplates(campaignId, blastId, emailTemplates) {
//   return yield call(CampaignService.createEmailBlastTemplate, campaignId, blastId, emailTemplates);
// }

// function* createEmailConsents(campaignId, blastId, emailConsents) {
//   return yield call(CampaignService.createEmailBlastConsent, campaignId, blastId, emailConsents);
// }

// function* createEmailCampaign({ payload }) {
//   try {

//     const {
//       organisationId,
//       emailCampaign: {
//         resource,
//         routers,
//         blasts
//       }
//     } = payload;

//     const createdEmailCampaignResource = yield call(CampaignService.createEmailCampaign, organisationId, resource);

//     const { createdRouters, createdBlasts } = yield all([
//       call(createEmailRouters, createdEmailCampaignResource.id, routers),
//       call(createEmailBlasts, createdEmailCampaignResource.id, blasts)
//     ]);

//     yield put({ type: CAMPAIGN_EMAIL_CREATE.SUCCESS });
//   } catch (error) {
//     log.error(error);
//     yield put({ type: CAMPAIGN_EMAIL_CREATE.FAILURE });
//     yield put(notifyError(error));
//   }
// }

// // function* loadEmailBlasts(campaignId) {
// //   const blasts = yield call(CampaignService.getEmailBlasts, campaignId);

// //   const result = blasts.map(blast => {
// //     const { emailTemplates, emailConsents } = yield all([
// //       call(CampaignService.getEmailBlastTemplates, campaignId, blast.id),
// //       call(CampaignService.getEmailBlastConsents, campaignId, blast.id)
// //     ])
// //   })

// // }

// function* loadEmailCampaign({ payload }) {
//   try {
//     const { campaignId } = payload;
//     const emailCampaign = yield call(CampaignService.getEmailCampaign, campaignId);

//     yield call(fetchCampaignEmail.success(emailCampaign));

//     const { emailRouterSelections, emailBlasts } = yield all([
//       call(CampaignService.getEmailRouterSelections, emailCampaign.id),
//       call(CampaignService.getEmailBlasts, emailCampaign.id)
//     ]);

//     // call(EmailRouterService.getRouters, organisationId)

//     // emailBlasts.forEach(blast => {
//     //   const { templateSelections, ConsentSelection, AudienceSegmentSelections } = yield all([
//     //     call(CampaignService.getEmailBlastTemplateSelections, campaignId, blast.id),
//     //     call(CampaignService.getEmailBlastConsentSelections, campaignId, blast.id),
//     //     call(CampaignService.getEmailBlastAudienceSegmentSelections, campaignId, blast.id)
//     //   ]);
//     // });

//   } catch (error) {
//     log.error(error);
//     yield put({ type: CAMPAIGN_EMAIL_CREATE.FAILURE });
//     yield put(notifyError(error));
//   }
// }

// function* watchfetchCreativeEmails() {
//   yield* takeEvery(CAMPAIGN_EMAIL_CREATE.REQUEST, createEmailCampaign);
// }

// export const editEmailSagas = [
//   fork(watchfetchCreativeEmails)
// ];
