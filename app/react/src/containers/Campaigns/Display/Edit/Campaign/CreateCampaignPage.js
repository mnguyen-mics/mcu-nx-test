import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import CampaignContent from './CampaignContent';
import withDrawer from '../../../../../components/Drawer';


function CreateCampaignPage({
  closeNextDrawer,
  openNextDrawer }) {

  const initialValues = {
    model_version: 'V2017_09',
    max_budget_period: 'DAY',
    adGroupsTable: []
  };

  return (
    <CampaignContent
      closeNextDrawer={closeNextDrawer}
      openNextDrawer={openNextDrawer}
      initialValues={initialValues}
    />
  );

}

CreateCampaignPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};


export default compose(
  withDrawer,
)(CreateCampaignPage);
