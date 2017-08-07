import { appSagas } from './App/sagas';
import { translationsSagas } from './Translations/sagas';
import { loginSagas } from './Login/sagas';
import { sessionSagas } from './Session/sagas';
import { campaignsDisplaySagas } from './Campaigns/Display/sagas';
import { campaignEmailSagas } from './Campaign/Email/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';
import { forgotPasswordSagas } from './ForgotPassword/sagas';
import { automationsSagas } from './Automations/sagas';
import { segmentsSagas } from './Audience/Segments/sagas';
import { partitionsSagas } from './Audience/Partitions/sagas';
import { placementListsSagas } from './Library/PlacementLists/sagas';
import { keywordListsSagas } from './Library/KeywordLists/sagas';
import { assetsFilesSagas } from './Library/AssetsFiles/sagas';
import { creativeDisplaySagas } from './Creatives/Display/sagas';
import { creativeEmailsSagas } from './Creatives/Emails/sagas';
import { labelsSagas } from './Labels/sagas';
import { versionSagas } from './Version/sagas';
import { accountSagas } from './Account/sagas';

export default function* sagas() {
  yield [
    ...appSagas,
    ...translationsSagas,
    ...sessionSagas,
    ...loginSagas,
    ...forgotPasswordSagas,
    ...campaignsDisplaySagas,
    ...campaignEmailSagas,
    ...goalsSagas,
    ...automationsSagas,
    ...segmentsSagas,
    ...versionSagas,
    ...labelsSagas,
    ...partitionsSagas,
    ...placementListsSagas,
    ...keywordListsSagas,
    ...assetsFilesSagas,
    ...creativeDisplaySagas,
    ...creativeEmailsSagas,
    ...accountSagas
  ];
}
