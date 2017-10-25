import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';

import AdGroupContent from './AdGroupContent';
import withDrawer from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import { saveAdGroup } from '../AdGroupServiceWrapper';

function CreateAdGroupPage({ closeNextDrawer, openNextDrawer, location, match, history }) {

  const { campaignId, organisationId } = match.params;

  const createNewAdgroup = (object) => {
    saveAdGroup(campaignId, object, {}, false)
      .then((adGroupId) => {
        history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`);
      });
  };

  const onClose = () => (location.state && location.state.from
    ? history.push(location.state.from)
    : history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`)
  );

  return (
    <AdGroupContent
      closeNextDrawer={closeNextDrawer}
      onClose={onClose}
      openNextDrawer={openNextDrawer}
      save={createNewAdgroup}
    />
  );
}

CreateAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired
};

export default compose(
  withMcsRouter,
  withDrawer,
)(CreateAdGroupPage);
