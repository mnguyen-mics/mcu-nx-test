import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import * as actions from '../../../../../state/Notifications/actions';

import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import EditDisplayCreativeContent from './EditDisplayCreativeContent';
import withDrawer from '../../../../../components/Drawer';

class EditDisplayCreativePage extends Component {

  onClose = () => {
    const {
      history,
      match: {
        params: {
          organisationId,
        }
      }
    } = this.props;
    history.push(`/v2/o/${organisationId}/creatives/display`);
  }


  render() {

    const {
      openNextDrawer,
      closeNextDrawer,
      match,
    } = this.props;

    return (
      <EditDisplayCreativeContent
        closeNextDrawer={closeNextDrawer}
        onClose={this.onClose}
        openNextDrawer={openNextDrawer}
        creativeId={match.params.creativeId}
      />
    );
  }
}

EditDisplayCreativePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      organisationId: PropTypes.string.isRequired,
      creativeId: PropTypes.string.isRequired,
    })
  }).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
  withDrawer,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(EditDisplayCreativePage);
