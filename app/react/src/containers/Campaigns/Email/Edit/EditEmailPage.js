import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';
import { pick } from 'lodash';

import { withMcsRouter } from '../../../Helpers';
import withDrawer from '../../../../components/Drawer';
import EmailEditor from './EmailEditor';
import messages from './messages';
import EmailCampaignService from '../../../../services/EmailCampaignService';
import * as actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';
import { isFakeId } from '../../../../utils/FakeIdHelper';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';

class EditEmailPage extends Component {
  constructor(props) {
    super(props);
    this.editEmailCampaign = this.editEmailCampaign.bind(this);
    this.loadEmailCampaign = this.loadEmailCampaign.bind(this);
    this.redirect = this.redirect.bind(this);

    this.state = {
      loadedEmailCampaign: {
        routers: [],
        blasts: []
      }
    };
  }

  componentDidMount() {
    const {
      match: { params: { campaignId } }
    } = this.props;

    this.loadEmailCampaign(campaignId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: { params: { campaignId } }
    } = this.props;

    const {
      match: { params: { campaignId: nextCampaignId } }
    } = nextProps;

    if (nextCampaignId !== campaignId) {
      this.loadEmailCampaign(nextCampaignId);
    }
  }

  loadEmailCampaign(campaignId) {
    const { notifyError } = this.props;

    EmailCampaignService.getEmailCampaign(campaignId)
      .then(emailCampaign => {
        return Promise.all([
          EmailCampaignService.getRouters(campaignId).then(res => res.data),
          EmailCampaignService.getBlasts(campaignId).then(res => res.data).then(blasts => {
            return Promise.all(blasts.map(blast => {
              return Promise.all([
                EmailCampaignService.getEmailTemplates(campaignId, blast.id).then(res => res.data),
                EmailCampaignService.getConsents(campaignId, blast.id).then(res => res.data),
                EmailCampaignService.getSegments(campaignId, blast.id).then(res => res.data)
              ]).then(results => {
                const [templates, consents, segments] = results;
                return {
                  ...blast,
                  send_date: moment(blast.send_date),
                  templates,
                  consents,
                  segments
                };
              });
            }));
          })
        ]).then(results => {
          const [routers, blasts] = results;
          return {
            ...emailCampaign,
            routers,
            blasts
          };
        });
      })
      .then(loadedEmailCampaign => {
        this.setState({
          loadedEmailCampaign
        });
      })
      .catch(error => {
        log.error(error);
        notifyError(error);
      });
  }

  editEmailCampaign(updatedEmailCampaign) {
    const {
      notifyError,
      intl: { formatMessage },
      match: { params: { campaignId } }
    } = this.props;

    const { loadedEmailCampaign } = this.state;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0
    );

    const campaingResource = {
      ...pick(updatedEmailCampaign, ['name', 'technical_name', 'type'])
    };

    EmailCampaignService.updateEmailCampaign(
      campaignId,
      campaingResource
    ).then(() => {

      const newBlasts = updatedEmailCampaign.blasts.filter(b => isFakeId(b.id));
      const deletedBlasts = updatedEmailCampaign.blasts.filter(b => b.isDeleted);
      const editedBlasts = updatedEmailCampaign.blasts.filter(b => b.isEdited);

      return Promise.all([
        ...loadedEmailCampaign.routers.map(router => {
          return EmailCampaignService.removeRouter(campaignId, router.id);
        }),
        ...updatedEmailCampaign.routers.map(router => {
          const routerResource = pick(router, ['email_router_id']);
          return EmailCampaignService.addRouter(campaignId, routerResource);
        }),
        ...deletedBlasts.map(deletedBlast => {
          return EmailCampaignService.deleteBlast(campaignId, deletedBlast.id);
        }),
        ...newBlasts.map(newBlast => {
          const blastResource = {
            ...pick(newBlast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
            send_date: parseInt(newBlast.send_date.format('x'), 0)
          };
          return EmailCampaignService.createBlast(campaignId, blastResource).then(createdBlast => {
            const blastId = createdBlast.id;
            return Promise.all([
              ...newBlast.templates.map(template => {
                const templateResource = pick(template, ['email_template_id']);
                return EmailCampaignService.addEmailTemplate(campaignId, blastId, templateResource);
              }),
              ...newBlast.consents.map(consent => {
                const consentResource = pick(consent, ['consent_id']);
                return EmailCampaignService.addConsent(campaignId, blastId, consentResource);
              }),
              ...newBlast.segments.map(segment => {
                const segmentResource = pick(segment, ['audience_segment_id']);
                return EmailCampaignService.addSegment(campaignId, blastId, segmentResource);
              })
            ]);
          });
        }),
        ...editedBlasts.map(editedBlast => {
          const loadedBlast = loadedEmailCampaign.blasts.find(b => b.id === editedBlast.id);
          const blastResource = {
            ...pick(editedBlast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
            send_date: parseInt(editedBlast.send_date.format('x'), 0)
          };
          return EmailCampaignService.updateBlast(campaignId, editedBlast.id, blastResource).then(() => {
            return Promise.all([
              ...editedBlast.templates.map(template => {
                const templateResource = pick(template, ['email_template_id']);
                return EmailCampaignService.addEmailTemplate(campaignId, editedBlast.id, templateResource);
              }),
              ...loadedBlast.templates.map(template => {
                return EmailCampaignService.removeEmailTemplate(campaignId, editedBlast.id, template.id);
              }),
              ...editedBlast.consents.map(consent => {
                const consentResource = pick(consent, ['consent_id']);
                return EmailCampaignService.addConsent(campaignId, editedBlast.id, consentResource);
              }),
              ...loadedBlast.consents.map(consent => {
                return EmailCampaignService.removeConsent(campaignId, editedBlast.id, consent.id);
              }),
              ...editedBlast.segments.map(segment => {
                const segmentResource = pick(segment, ['audience_segment_id']);
                return EmailCampaignService.addSegment(campaignId, editedBlast.id, segmentResource);
              }),
              ...loadedBlast.segments.map(segment => {
                return EmailCampaignService.removeSegment(campaignId, editedBlast.id, segment.id);
              })
            ]);
          });
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

  redirect() {
    const { history, organisationId } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email`;

    history.push(emailCampaignListUrl);
  }

  render() {

    const {
      loadedEmailCampaign: {
        blasts,
        ...other
      }
    } = this.state;

    const initialValues = { campaign: other };
    const campaignName = other.name;

    return (
      <EmailEditor
        initialValues={initialValues}
        campaignName={campaignName}
        blasts={blasts}
        save={this.editEmailCampaign}
        close={this.redirect}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
      />
    );
  }
}

EditEmailPage.propTypes = {
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
  withDrawer
)(EditEmailPage);
