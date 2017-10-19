import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import CampaignContent from './CampaignContent';
import withDrawer from '../../../../../components/Drawer';


class CreateCampaignPage extends Component {
  render() {
    const {
      closeNextDrawer,
      openNextDrawer
    } = this.props;

    return (
      <CampaignContent
        closeNextDrawer={closeNextDrawer}
        openNextDrawer={openNextDrawer}
      />
    );
  }
}

CreateCampaignPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};


export default compose(
  withDrawer,
)(CreateCampaignPage);
