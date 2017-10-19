import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { pick } from 'lodash';
import moment from 'moment';

import { withMcsRouter } from '../../../Helpers';
import withDrawer from '../../../../components/Drawer';
import EmailBlastContent from './EmailBlastContent';
import messages from './messages';
import EmailCampaignService from '../../../../services/EmailCampaignService';
import * as actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';


class EditBlastPage extends Component {

  state = {
    emailCampaign: {
      name: '',
    },
    loadedBlast: {
      consents: [],
      segments: [],
      templates: [],
    }
  }

  componentDidMount() {
    const {
      match: { params: { campaignId, blastId } },
    } = this.props;

    this.loadBlast(campaignId, blastId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: { params: { campaignId, blastId } },
    } = this.props;

    const {
      match: { params: { campaignId: nextCampaignId, blastId: nextBlastId } },
    } = nextProps;

    if (nextCampaignId !== campaignId || nextBlastId !== blastId) {
      this.loadBlast(nextCampaignId, nextBlastId);
    }
  }

  loadBlast = (campaignId, blastId) => {
    const { notifyError } = this.props;

    Promise.all([
      EmailCampaignService.getEmailCampaign(campaignId),
      EmailCampaignService.getBlast(campaignId, blastId).then(blast => {
        return Promise.all([
          EmailCampaignService.getEmailTemplates(campaignId, blast.id).then(res => res.data),
          EmailCampaignService.getConsents(campaignId, blast.id).then(res => res.data),
          EmailCampaignService.getSegments(campaignId, blast.id).then(res => res.data),
        ]).then(results => {
          const [templates, consents, segments] = results;
          return {
            ...blast,
            send_date: moment(blast.send_date),
            templates,
            consents,
            segments,
          };
        });
      }),
    ]).then(results => {
      const [emailCampaign, loadedBlast] = results;
      this.setState({ emailCampaign, loadedBlast });
    }).catch(error => {
      log.error(error);
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

  updateBlast = (updatedBlast) => {
    const {
      match: { params: { campaignId, blastId } },
      notifyError,
      intl: { formatMessage },
    } = this.props;

    const { loadedBlast } = this.state;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0,
    );

    const blastResource = {
      ...pick(updatedBlast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
      send_date: parseInt(updatedBlast.send_date.format('x'), 0),
    };

    EmailCampaignService.updateBlast(
      campaignId,
      blastId,
      blastResource,
    ).then(() => {
      Promise.all([
        ...updatedBlast.templates.map(template => {
          const templateResource = pick(template, ['email_template_id']);
          return EmailCampaignService.addEmailTemplate(campaignId, blastId, templateResource);
        }),
        ...loadedBlast.templates.map(template => {
          return EmailCampaignService.removeEmailTemplate(campaignId, blastId, template.id);
        }),
        ...updatedBlast.consents.map(consent => {
          const consentResource = pick(consent, ['consent_id']);
          return EmailCampaignService.addConsent(campaignId, blastId, consentResource);
        }),
        ...loadedBlast.consents.map(consent => {
          return EmailCampaignService.removeConsent(campaignId, blastId, consent.id);
        }),
        ...updatedBlast.segments.map(segment => {
          const segmentResource = pick(segment, ['audience_segment_id']);
          return EmailCampaignService.addSegment(campaignId, blastId, segmentResource);
        }),
        ...loadedBlast.segments.map(segment => {
          return EmailCampaignService.removeSegment(campaignId, blastId, segment.id);
        }),
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

  render() {

    const {
      emailCampaign,
      loadedBlast,
    } = this.state;

    const {
      organisationId,
      intl: { formatMessage },
      match: { params: { campaignId } },
    } = this.props;

    const breadcrumbPaths = [
      {
        name: emailCampaign.name,
        url: `/v2/o/${organisationId}/campaigns/email/${campaignId}`,
      },
      {
        name: formatMessage(
          messages.emailBlastEditorBreadcrumbTitleEditBlast,
          { blastName: loadedBlast.blast_name }
        )
      }
    ];

    const handlers = {
      closeNextDrawer: this.props.closeNextDrawer,
      openNextDrawer: this.props.openNextDrawer,
      redirect: this.redirect,
      save: this.updateBlast,
    };

    return (
      <EmailBlastContent
        blast={loadedBlast}
        breadcrumbPaths={breadcrumbPaths}
        handlers={handlers}
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
