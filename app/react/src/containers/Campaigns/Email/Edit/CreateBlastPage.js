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
import EmailCampaignService from '../../../../services/EmailCampaignService';
import * as actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';


class CreateBlastPage extends Component {
  state = {
    emailCampaign: ''
  }

  componentDidMount() {
    const {
      match: { params: { campaignId } }
    } = this.props;

    this.loadCampaign(campaignId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: { params: { campaignId } }
    } = this.props;

    const {
      match: { params: { campaignId: nextCampaignId } }
    } = nextProps;

    if (campaignId !== nextCampaignId) {
      this.loadCampaign(nextCampaignId);
    }
  }

  loadCampaign = campaignId => {
    EmailCampaignService.getEmailCampaign(campaignId).then(result => {
      this.setState({ emailCampaign: result });
    });

  }

  createBlast = (blast) => {
    const {
      match: { params: { campaignId } },
      notifyError,
      intl: { formatMessage }
    } = this.props;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0
    );

    const blastResource = {
      ...pick(blast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
      send_date: parseInt(blast.send_date.format('x'), 0)
    };

    EmailCampaignService.createBlast(campaignId, blastResource).then(createdBlast => {
      const blastId = createdBlast.id;
      return Promise.all([
        ...blast.templates.map(template => {
          const templateResource = pick(template, ['email_template_id']);
          return EmailCampaignService.addEmailTemplate(campaignId, blastId, templateResource);
        }),
        ...blast.consents.map(consent => {
          const consentResource = pick(consent, ['consent_id']);
          return EmailCampaignService.addConsent(campaignId, blastId, consentResource);
        }),
        ...blast.segments.map(segment => {
          const segmentResource = pick(segment, ['audience_segment_id']);
          return EmailCampaignService.addSegment(campaignId, blastId, segmentResource);
        })
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

  redirect = () => {
    const {
      organisationId,
      match: { params: { campaignId } },
      history,
    } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email/${campaignId}`;

    history.push(emailCampaignListUrl);
  }

  render() {
    const {
      organisationId,
      intl: { formatMessage },
      match: { params: { campaignId } }
    } = this.props;

    const { emailCampaign } = this.state;

    const breadcrumbPaths = [
      {
        name: emailCampaign.name,
        url: `/v2/o/${organisationId}/campaigns/email/${campaignId}`
      },
      { name: formatMessage(messages.emailBlastEditorBreadcrumbTitleNewBlast) }
    ];

    return (
      <EmailBlastEditor
        save={this.createBlast}
        close={this.redirect}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
        breadcrumbPaths={breadcrumbPaths}
      />
    );
  }
}

CreateBlastPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError }
  ),
  withDrawer,
)(CreateBlastPage);
