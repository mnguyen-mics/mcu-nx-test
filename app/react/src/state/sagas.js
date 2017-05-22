import { campaignsDisplaySagas } from './Campaigns/Display/sagas';
import { campaignsEmailSagas } from './Campaigns/Email/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';
import { automationsSagas } from './Automations/sagas';
import { segmentsSagas } from './Audience/Segments/sagas';

export default function* sagas() {
  yield [
    ...campaignsDisplaySagas,
    ...campaignsEmailSagas,
    ...goalsSagas,
    ...automationsSagas,
    ...segmentsSagas
  ];
}
