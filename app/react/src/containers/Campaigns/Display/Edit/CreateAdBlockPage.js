import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { pick } from 'lodash';

// import { withMcsRouter } from '../../../Helpers';
// import withDrawer from '../../../../components/Drawer';
// import EmailEditor from '../../Email/Edit/EmailEditor';
// import messages from '../../Email/Edit/messages';
// import CampaignService from '../../../../services/CampaignService';
// import * as actions from '../../../../state/Notifications/actions';
// import log from '../../../../utils/Logger';
// import { ReactRouterPropTypes } from '../../../../validators/proptypes';


class CreateAdBlockPage extends Component {
  // constructor(props) {
  //   super(props);
  //   this.createEmailCampaign = this.createEmailCampaign.bind(this);
  //   this.redirect = this.redirect.bind(this);
  // }

  render() {
    return (
      <div>wdfghj</div>
    );
  }
}

CreateAdBlockPage.propTypes = {
  // organisationId: PropTypes.string.isRequired,
  // // history: ReactRouterPropTypes.history.isRequired,
  // openNextDrawer: PropTypes.func.isRequired,
  // closeNextDrawer: PropTypes.func.isRequired,
  // notifyError: PropTypes.func.isRequired,
  // intl: intlShape.isRequired,
};
export default CreateAdBlockPage;
// export default compose(
//   injectIntl,
//   withMcsRouter,
//   connect(
//     undefined,
//     { notifyError: actions.notifyError },
//   ),
//   withDrawer,
// )(CreateAdBlockPage);
