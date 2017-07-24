import { createSelector } from 'reselect';

const isFetchingEmailTemplates = state => state.creatives.emailTemplates.metadata.isFetching;
const hasEmailTemplates = state => state.creatives.emailTemplates.hasItems;
const getEmailTemplatesTotal = state => state.creatives.emailTemplates.metadata.total;

const getEmailTemplates = createSelector(
  state => state.creatives.emailTemplates.allIds,
  state => state.creatives.emailTemplates.byId,
  (allEmailTemplates, emailTemplatesById) => allEmailTemplates.map(id => emailTemplatesById[id])
);

export {
  getEmailTemplates,
  isFetchingEmailTemplates,
  hasEmailTemplates,
  getEmailTemplatesTotal
};
