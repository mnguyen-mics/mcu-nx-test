import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { pick } from 'lodash';

import { withMcsRouter } from '../../../Helpers';
import withDrawer from '../../../../components/Drawer';
import EmailEditor from './EmailEditor';
import messages from './messages';
import EmailCampaignService from '../../../../services/EmailCampaignService';
import * as actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';


class CreateEmailPage extends Component {

  createEmailCampaign = campaign => {
    const {
      organisationId,
      notifyError,
      intl: { formatMessage }
    } = this.props;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0
    );

    const campaingResource = {
      ...pick(campaign, ['name', 'technical_name'])
    };

    EmailCampaignService.createEmailCampaign(
      organisationId,
      campaingResource
    ).then(createdCampaign => {
      const campaignId = createdCampaign.id;

      return Promise.all([
        ...campaign.routers.map(router => {
          const routerResource = pick(router, ['email_router_id']);
          return EmailCampaignService.addRouter(campaignId, routerResource);
        }),
        ...campaign.blasts.map(blast => {
          const blastResource = {
            ...pick(blast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
            send_date: parseInt(blast.send_date.format('x'), 0)
          };
          return EmailCampaignService.createBlast(campaignId, blastResource).then(createdBlast => {
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
          });
        })
      ]).then(() => campaignId);
    }).then(campaignId => {
      hideSaveInProgress();
      this.redirect(campaignId);
    }).catch(error => {
      log.error('Error while creating email campagain', error);
      hideSaveInProgress();
      notifyError(error);
    });
  }

  redirect = campaignId => {
    const { history, organisationId } = this.props;
    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email/${campaignId}`;
    history.push(emailCampaignListUrl);
  }

  render() {

    const {
      organisationId,
      intl: { formatMessage }
    } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.emailEditorBreadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/email`
      },
      { name: formatMessage(messages.emailEditorBreadcrumbNewCampaignTitle) }
    ];

    return (
      <EmailEditor
        save={this.createEmailCampaign}
        close={this.redirect}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
        breadcrumbPaths={breadcrumbPaths}
      />
    );
  }
}

CreateEmailPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
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
)(CreateEmailPage);
