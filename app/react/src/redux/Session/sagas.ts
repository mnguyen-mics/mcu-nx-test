import { call, put, fork, takeEvery, getContext } from 'redux-saga/effects';
import { addNotification } from '../Notifications/actions';
import log from '../../utils/Logger';
import { WORKSPACE, GET_LOGO, PUT_LOGO, CONNECTED_USER } from '../action-types';
import { getWorkspace, getCookies, putLogo, getLogo } from './actions';
import { fetchAllLabels } from '../Labels/actions';
import { Payload } from '../../utils/ReduxHelper';

function* fetchOrganisationWorkspace({ payload }: Payload) {
  const _organisationService = yield getContext('organisationService');
  try {
    const organisationId = payload;
    const response = yield call(_organisationService.getWorkspace, organisationId);
    yield put(getWorkspace.success(response.data));
    yield put(fetchAllLabels.request(organisationId));
  } catch (e) {
    log.error(e);
    yield put(getWorkspace.failure(e));
  }
}

function* fetchUserCookies() {
  const _organisationService = yield getContext('organisationService');
  try {
    const response = yield call(_organisationService.getCookies);
    yield put(getCookies.success(response.data));
  } catch (e) {
    log.error(e);
    yield put(getCookies.failure(e));
  }
}

function* downloadLogo({ payload }: Payload) {
  const _organisationService = yield getContext('organisationService');
  try {
    const { organisationId } = payload;
    const response = yield call(_organisationService.getLogo, organisationId);
    const logoUrl = URL.createObjectURL(response); /* global URL */
    yield put(getLogo.success({ logoUrl }));
  } catch (e) {
    log.error('Cannot get specific logo: ', e);
    try {
      const response = yield call(_organisationService.getStandardLogo);
      const logoUrl = URL.createObjectURL(response); /* global URL */
      yield put(getLogo.success({ logoUrl }));
    } catch (er) {
      log.error('Error while getting org logo: ', e);
      yield put(getLogo.failure(er));
    }
  }
}

function* uploadLogo({ payload }: Payload) {
  try {
    const { organisationId, file } = payload;
    const _organisationService = yield getContext('organisationService');
    const formData = new FormData(); /* global FormData */
    formData.append('file', file);
    yield call(_organisationService.putLogo, organisationId, formData);
    yield put(putLogo.success());
    yield put(getLogo.request({ organisationId }));
  } catch (e) {
    log.error('Error while putting logo: ', e);
    yield put(putLogo.failure(e));
    yield put(
      addNotification({
        type: 'error',
        messageKey: 'NOTIFICATION_ERROR_TITLE',
        descriptionKey: 'NOTIFICATION_ERROR_DESCRIPTION',
      }),
    );
  }
}

function* watchWorkspaceRequest() {
  yield takeEvery(WORKSPACE.REQUEST, fetchOrganisationWorkspace);
}

function* watchConnectedUserRequest() {
  yield takeEvery(CONNECTED_USER.SUCCESS, fetchUserCookies);
}

function* watchLogoDownloadRequest() {
  yield takeEvery(GET_LOGO.REQUEST, downloadLogo);
}

function* watchLogoUploadRequest() {
  yield takeEvery(PUT_LOGO.REQUEST, uploadLogo);
}

export const sessionSagas = [
  fork(watchWorkspaceRequest),
  fork(watchLogoDownloadRequest),
  fork(watchLogoUploadRequest),
  fork(watchConnectedUserRequest),
];
