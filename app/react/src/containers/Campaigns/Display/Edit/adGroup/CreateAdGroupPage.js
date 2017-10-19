import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import AdGroupContent from './AdGroupContent';
import withDrawer from '../../../../../components/Drawer';

function CreateAdGroupPage({ closeNextDrawer, openNextDrawer }) {
  return (
    <AdGroupContent
      closeNextDrawer={closeNextDrawer}
      openNextDrawer={openNextDrawer}
    />
  );
}

CreateAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};

export default compose(
  withDrawer,
)(CreateAdGroupPage);
