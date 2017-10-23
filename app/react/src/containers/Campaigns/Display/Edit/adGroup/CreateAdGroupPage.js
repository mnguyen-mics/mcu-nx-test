import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';

import AdGroupContent from './AdGroupContent';
import withDrawer from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import { saveAdGroup } from '../AdGroupServiceWrapper';

function CreateAdGroupPage({ closeNextDrawer, openNextDrawer, match, location, history }) {

  const onClose = () => (location.state && location.state.from
    ? history.push(location.state.from)
    : history.push(`/v2/o/${match.params.organisationId}/campaigns/display/${match.params.campaignId}`)
  );

  const createNewAdgroup = (object) => {
    saveAdGroup(match.params.campaignId, object, {}, false).then(() => {
      history.push(`/v2/o/${match.params.organisationId}/campaigns/display/${match.params.campaignId}`);
    });

  };

  return (

    <AdGroupContent
      closeNextDrawer={closeNextDrawer}
      openNextDrawer={openNextDrawer}
      close={onClose}
      save={createNewAdgroup}
    />
  );
}

CreateAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired
};

export default compose(
  withMcsRouter,
  withDrawer,
)(CreateAdGroupPage);
