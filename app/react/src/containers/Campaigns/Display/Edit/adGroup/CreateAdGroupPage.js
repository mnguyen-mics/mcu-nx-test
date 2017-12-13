import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';

import AdGroupContent from './AdGroupContent';
import withDrawer from '../../../../../components/Drawer/index.tsx';
import { withMcsRouter } from '../../../../Helpers';
import { saveAdGroup } from '../AdGroupServiceWrapper';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../../../state/Features/selectors';
import log from '../../../../../utils/Logger';

function CreateAdGroupPage(props) {

  const {
    hasFeature,
    notifyError,
    history,
    location,
    closeNextDrawer,
    openNextDrawer,
    match: {
      params: { campaignId, organisationId }
    }
  } = props;

  const onSave = (object) => {
    const saveOptions = {
      editionMode: false,
      catalogMode: hasFeature('campaigns.display.edition.audience_catalog')
    };
    saveAdGroup(campaignId, object, {}, saveOptions)
      .then((adGroupId) => {
        history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`);
      })
      .catch(err => {
        log.error(err);
        notifyError(err);
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
      save={onSave}
    />
  );
}

CreateAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired,
  hasFeature: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  withDrawer,
  connect(
    state => ({ hasFeature: FeatureSelectors.hasFeature(state) }),
    { notifyError: NotificationActions.notifyError }
  )
)(CreateAdGroupPage);
