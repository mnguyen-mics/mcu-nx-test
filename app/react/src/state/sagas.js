import { all } from 'redux-saga/effects';
import { appSagas } from './App/sagas';
import { translationsSagas } from './Translations/sagas';
import { loginSagas } from './Login/sagas';
import { sessionSagas } from './Session/sagas';
import { displayCampaignsSagas } from './Campaigns/Display/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';
import { forgotPasswordSagas } from './ForgotPassword/sagas';
import { automationsSagas } from './Automations/sagas';
import { segmentsSagas } from './Audience/Segments/sagas';
import { partitionsSagas } from './Audience/Partitions/sagas';
import { creativeDisplaySagas } from './Creatives/Display/sagas';
import { creativeEmailsSagas } from './Creatives/Emails/sagas';
import { labelsSagas } from './Labels/sagas';
import { versionSagas } from './Version/sagas';
import { accountSagas } from './Account/sagas';
import { featuresSagas } from './Features/sagas';

export default function* sagas() {
  yield all([
    ...appSagas,
    ...translationsSagas,
    ...sessionSagas,
    ...loginSagas,
    ...forgotPasswordSagas,
    ...displayCampaignsSagas,
    ...goalsSagas,
    ...automationsSagas,
    ...segmentsSagas,
    ...versionSagas,
    ...labelsSagas,
    ...partitionsSagas,
    ...creativeDisplaySagas,
    ...creativeEmailsSagas,
    ...accountSagas,
    ...featuresSagas,
  ]);
}
