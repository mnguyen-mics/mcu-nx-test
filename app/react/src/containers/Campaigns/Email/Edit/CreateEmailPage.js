import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../../../Helpers';
import withDrawer from '../../../../components/Drawer';
import EmailEditor from './EmailEditor';
import messages from './messages';
import CampaignService from '../../../../services/CampaignService';
import * as actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';


class CreateEmailPage extends Component {
  constructor(props) {
    super(props);
    this.createEmailCampaign = this.createEmailCampaign.bind(this);
    this.redirect = this.redirect.bind(this);
  }

  createEmailCampaign(emailEditorData) {
    const {
      organisationId,
      notifyError,
      intl: { formatMessage }
    } = this.props;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.emailSavingInProgress),
      0
    );

    CampaignService.createEmailCampaign(
      organisationId,
      emailEditorData.campaign.name,
      emailEditorData.campaign.technicalName
    ).then(response => {
      const createdCampaign = response.data;
      return CampaignService.createEmailRouters(createdCampaign.id, emailEditorData.campaign.routers[0].email_router_id);
    }).then(() => {
      hideSaveInProgress();
      this.redirect();
    }).catch(error => {
      log.error('Error while creating email campagain', error);
      hideSaveInProgress();
      notifyError(error);
    });
  }

  redirect() {
    const { history, organisationId } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email`;

    history.push(emailCampaignListUrl);
  }

  render() {
    return (
      <EmailEditor
        save={this.createEmailCampaign}
        close={this.redirect}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
      />
    );
  }
}

CreateEmailPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default compose(
  connect(
    undefined,
    { notifyError: actions.notifyError }
  ),
  withMcsRouter,
  withDrawer,
  injectIntl
)(CreateEmailPage);
