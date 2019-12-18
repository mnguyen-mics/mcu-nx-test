import { all } from 'redux-saga/effects';
import { appSagas } from './App/sagas';
import { loginSagas } from './Login/sagas';
import { sessionSagas } from './Session/sagas';
import { labelsSagas } from './Labels/sagas';
import { versionSagas } from './Version/sagas';
import { featuresSagas } from './Features/sagas';

export default function* sagas() {
  yield all([
    ...appSagas,
    ...sessionSagas,
    ...loginSagas,
    ...versionSagas,
    ...labelsSagas,
    ...featuresSagas,
  ]);
}
