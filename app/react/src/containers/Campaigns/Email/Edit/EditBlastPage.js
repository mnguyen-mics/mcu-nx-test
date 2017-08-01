import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { pick } from 'lodash';

import { withMcsRouter } from '../../../Helpers';
import withDrawer from '../../../../components/Drawer';
import EmailBlastEditor from './EmailBlastEditor';
import messages from './messages';
import CampaignService from '../../../../services/CampaignService';
import * as actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';


class EditBlastPage extends Component {
  constructor(props) {
    super(props);
    this.createBlast = this.createBlast.bind(this);
    this.redirect = this.redirect.bind(this);
  }

  createBlast(blast) {
    const {
      match: { params: { campaignId } },
      notifyError,
      intl: { formatMessage },
    } = this.props;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0,
    );

    const blastResource = {
      ...pick(blast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
      send_date: parseInt(blast.send_date.format('x'), 0),
    };

    CampaignService.createEmailBlast(
      campaignId,
      blastResource,
    ).then(createdBlast => {
      const blastId = createdBlast.id;
      return Promise.all([
        CampaignService.createEmailBlastTemplate(campaignId, blastId, blast.templates[0]),
        CampaignService.createEmailBlastConsent(campaignId, blastId, blast.consents[0]),
              // CampaignService.createEmailBlastSegment(campaignId, blastId, blast.consents[0])
      ]);
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
    const {
      organisationId,
      match: { params: { campaignId } },
      history,
    } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email/${campaignId}`;

    history.push(emailCampaignListUrl);
  }

  render() {
    return (
      <EmailBlastEditor
        save={this.createBlast}
        close={this.redirect}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
      />
    );
  }
}

EditBlastPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
  withDrawer,
)(EditBlastPage);
