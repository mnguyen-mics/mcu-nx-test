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
import CampaignService from '../../../../services/CampaignService';
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
      emailCampaignContainer: {
        blasts: [],
      },
    };
  }

  componentDidMount() {
    const {
      match: { params: { campaignId } },
    } = this.props;

    this.loadEmailCampaign(campaignId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: { params: { campaignId } },
    } = this.props;

    const {
      match: { params: { campaignId: nextCampaignId } },
    } = nextProps;

    if (nextCampaignId !== campaignId) {
      this.loadEmailCampaign(nextCampaignId);
    }
  }

  loadEmailCampaign(campaignId) {
    const { notifyError } = this.props;

    CampaignService.getEmailCampaign(campaignId)
      .then(emailCampaign => {
        return Promise.all([
          CampaignService.getEmailRouters(campaignId).then(res => res.data),
          CampaignService.getEmailBlasts(campaignId).then(res => res.data).then(blasts => {
            return Promise.all(blasts.map(blast => {
              return Promise.all([
                CampaignService.getEmailBlastTemplates(campaignId, blast.id).then(res => res.data),
                CampaignService.getEmailBlastConsents(campaignId, blast.id).then(res => res.data),
                CampaignService.getBlastSegments(campaignId, blast.id).then(res => res.data),
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
            }));
          }),
        ]).then(results => {
          const [routers, blasts] = results;
          return {
            ...emailCampaign,
            routers,
            blasts,
          };
        });
      })
      .then(emailCampaignContainer => {
        this.setState({
          emailCampaignContainer,
        });
      })
      .catch(error => {
        log.error(error);
        notifyError(error, { intlMessage: messages.fetchCampaignError });
      });
  }

  editEmailCampaign(campaign) {
    const {
      notifyError,
      intl: { formatMessage },
    } = this.props;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.emailSavingInProgress),
      0,
    );

    const campaingResource = {
      ...pick(campaign, ['name', 'technical_name', 'type']),
    };

    CampaignService.updateEmailCampaign(
      campaign.id,
      campaingResource,
    ).then(() => {

      const newBlasts = campaign.blasts.filter(b => isFakeId(b.id));
      const deletedBlasts = campaign.blasts.filter(b => b.isDeleted);
      const editedBlasts = campaign.blasts.filter(b => b.isEdited);

      return Promise.all([
        CampaignService.updateEmailRouter(campaign.id, campaign.routers[0].id, campaign.routers[0]),
        ...deletedBlasts.map(deletedBlast => CampaignService.deleteEmailBlast(campaign.id, deletedBlast.id)),
        ...newBlasts.map(newBlast => {
          const blastResource = {
            ...pick(newBlast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
            send_date: parseInt(newBlast.send_date.format('x'), 0),
          };
          return CampaignService.createEmailBlast(campaign.id, blastResource).then(createdBlast => {
            const blastId = createdBlast.id;
            return Promise.all([
              CampaignService.createEmailBlastTemplate(campaign.id, blastId, newBlast.templates[0]),
              CampaignService.createEmailBlastConsent(campaign.id, blastId, newBlast.consents[0]),
              // CampaignService.createEmailBlastSegment(campaignId, blastId, blast.consents[0])
            ]);
          });
        }),
        ...editedBlasts.map(editedBlast => {
          const blastResource = {
            ...pick(editedBlast, ['blast_name', 'subject_line', 'from_email', 'from_name', 'reply_to']),
            send_date: parseInt(editedBlast.send_date.format('x'), 0),
          };
          return CampaignService.updateEmailBlast(campaign.id, editedBlast.id, blastResource).then(() => {
            return Promise.all([
              CampaignService.updateEmailBlastTemplate(campaign.id, editedBlast.id, editedBlast.templates[0].id, editedBlast.templates[0]),
              CampaignService.updateEmailBlastConsent(campaign.id, editedBlast.id, editedBlast.consents[0].id, editedBlast.consents[0]),
              // CampaignService.createEmailBlastSegment(campaignId, blastId, blast.consents[0])
            ]);
          });
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

  redirect() {
    const { history, organisationId } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email`;

    history.push(emailCampaignListUrl);
  }

  render() {

    const {
      emailCampaignContainer: {
        blasts,
        ...other
      },
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
)(EditEmailPage);
