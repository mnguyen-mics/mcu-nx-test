import { campaignsDisplaySagas } from './Campaigns/Display/sagas';
import { campaignsEmailSagas } from './Campaigns/Email/sagas';
import { campaignEmailSagas } from './Campaign/Email/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';
import { automationsSagas } from './Automations/sagas';
import { segmentsSagas } from './Audience/Segments/sagas';
import { navigatorSagas } from './Navigator/sagas';

export default function* sagas() {
  yield [
    ...campaignsDisplaySagas,
    ...campaignsEmailSagas,
    ...campaignEmailSagas,
    ...goalsSagas,
    ...automationsSagas,
    ...segmentsSagas,
    ...navigatorSagas
  ];
}
