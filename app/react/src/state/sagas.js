import { campaignsDisplaySagas } from './Campaigns/Display/sagas';
import { campaignsEmailSagas } from './Campaigns/Email/sagas';
import { campaignEmailSagas } from './Campaign/Email/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';
import { automationsSagas } from './Automations/sagas';
import { segmentsSagas } from './Audience/Segments/sagas';
import { partitionsSagas } from './Audience/Partitions/sagas';
import { placementListsSagas } from './Library/PlacementLists/sagas';
import { keywordListsSagas } from './Library/KeywordLists/sagas';
import { assetsFilesSagas } from './Library/AssetsFiles/sagas';
import { creativeDisplaySagas } from './Creatives/Display/sagas';
import { creativeEmailsSagas } from './Creatives/Emails/sagas';
import { navigatorSagas } from './Navigator/sagas';
import { labelsSagas } from './Labels/sagas';

export default function* sagas() {
  yield [
    ...campaignsDisplaySagas,
    ...campaignsEmailSagas,
    ...campaignEmailSagas,
    ...goalsSagas,
    ...automationsSagas,
    ...segmentsSagas,
    ...navigatorSagas,
    ...labelsSagas,
    ...partitionsSagas,
    ...placementListsSagas,
    ...keywordListsSagas,
    ...assetsFilesSagas,
    ...creativeDisplaySagas,
    ...creativeEmailsSagas
  ];
}
