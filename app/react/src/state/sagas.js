import { all } from 'redux-saga/effects';
import { appSagas } from './App/sagas';
import { loginSagas } from './Login/sagas';
import { sessionSagas } from './Session/sagas';
import { displayCampaignsSagas } from './Campaigns/Display/sagas';
import { creativeDisplaySagas } from './Creatives/Display/sagas';
import { creativeEmailsSagas } from './Creatives/Emails/sagas';
import { nativeCreativesSagas } from './Creatives/Native/sagas';
import { labelsSagas } from './Labels/sagas';
import { versionSagas } from './Version/sagas.ts';
import { accountSagas } from './Account/sagas';
import { featuresSagas } from './Features/sagas';

export default function* sagas() {
  yield all([
    ...appSagas,
    ...sessionSagas,
    ...loginSagas,
    ...displayCampaignsSagas,
    ...versionSagas,
    ...labelsSagas,
    ...creativeDisplaySagas,
    ...creativeEmailsSagas,
    ...nativeCreativesSagas,
    ...versionSagas,
    ...accountSagas,
    ...featuresSagas,
  ]);
}
