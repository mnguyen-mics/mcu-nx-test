import { campaignsDisplaySagas } from './Campaigns/Display/sagas';
import { campaignsEmailSagas } from './Campaigns/Email/sagas';
import { goalsSagas } from './Campaigns/Goal/sagas';

export default function* sagas() {
  yield [
    ...campaignsDisplaySagas,
    ...campaignsEmailSagas,
    ...goalsSagas
  ];
}
