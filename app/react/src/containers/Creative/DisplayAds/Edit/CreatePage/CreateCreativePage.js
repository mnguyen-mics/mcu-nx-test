import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';

import DisplayCreativeContent from './DisplayCreativeContent';
import withDrawer from '../../../../../components/Drawer/index.tsx';
import { withMcsRouter } from '../../../../Helpers';
import { createDisplayCreative } from '../../../../../formServices/CreativeServiceWrapper';

class CreateCreativePage extends Component {

  state = {
    loading: false,
  };

  render() {

    const {
      match: {
        params: { organisationId }
      },
      history,
      location,
      closeNextDrawer,
      openNextDrawer,
    } = this.props;

    const onSave = (creative, properties, rendererData) => {
      this.setState({ loading: true });
      createDisplayCreative(creative, properties, organisationId, rendererData)
        .then(newCreative => {
          this.setState({ loading: false });
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
