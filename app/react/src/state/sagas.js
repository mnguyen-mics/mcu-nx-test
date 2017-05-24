import { campaignsDisplaySagas } from './Campaigns/Display/sagas';
import { campaignsEmailSagas } from './Campaigns/Email/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';
import { automationsSagas } from './Automations/sagas';
import { segmentsSagas } from './Audience/Segments/sagas';
import { partitionsSagas } from './Audience/Partitions/sagas';
import { navigatorSagas } from './Navigator/sagas';


export default function* sagas() {
  yield [
    ...campaignsDisplaySagas,
    ...campaignsEmailSagas,
    ...goalsSagas,
    ...automationsSagas,
    ...segmentsSagas,
    ...navigatorSagas,
    ...partitionsSagas
  ];
}
