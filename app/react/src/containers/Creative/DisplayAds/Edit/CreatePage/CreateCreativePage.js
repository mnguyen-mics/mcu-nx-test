import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';

import DisplayCreativeContent from './DisplayCreativeContent';
import withDrawer from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import { createDisplayCreative } from '../../../../../formServices/CreativeServiceWrapper';

function CreateCreativePage({ closeNextDrawer, openNextDrawer, location, match, history }) {

  const { organisationId } = match.params;

  const onSave = (creative, properties, rendererData) => {
    createDisplayCreative(creative, properties, organisationId, rendererData)
      .then(newCreative => {
        const newCreativeId = newCreative.id;
        history.push(`/v2/o/${organisationId}/creatives/display/edit/${newCreativeId}`);
      });
  };

  const onClose = () => (
    location.state && location.state.from
    ? history.push(location.state.from)
    : history.push(`/v2/o/${organisationId}/creatives/display`)
  );

  return (
    <DisplayCreativeContent
      closeNextDrawer={closeNextDrawer}
      onClose={onClose}
      openNextDrawer={openNextDrawer}
      save={onSave}
    />
  );
}

CreateCreativePage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
};

export default compose(
  withMcsRouter,
  withDrawer,
)(CreateCreativePage);
