import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import * as EmailCampaignActions from '../../../../state/Campaign/Email/actions';

class EmailCampaignActionbar extends Component {

  buildActionElement = () => {
    const {
      campaignEmail,
      updateEmailCampaign,
    } = this.props;

    const onClickElement = status => updateEmailCampaign(campaignEmail.id, {
      status,
      type: 'EMAIL',
    });

    const activeCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={() => onClickElement('ACTIVE')}>
        <Icon type="play-circle-o" />
        <FormattedMessage id="ACTIVATE_CAMPAIGN" />
      </Button>
    );
    const pauseCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={() => onClickElement('PAUSED')}>
        <Icon type="pause-circle-o" />
        <FormattedMessage id="PAUSE_CAMPAIGN" />
      </Button>
    );

    if (!campaignEmail.id) {
      return null;
    }

    return (campaignEmail.status === 'PAUSED' || campaignEmail.status === 'PENDING'
      ? activeCampaignElement
      : pauseCampaignElement
    );
  }

  buildMenu = () => {
    const {
      translations,
      campaignEmail,
      archiveEmailCampaign,
    } = this.props;

    const handleArchiveGoal = campaignEmailId => {
      Modal.confirm({
        title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
        content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
        iconType: 'exclamation-circle',
        okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
        cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
        onOk() {
          return archiveEmailCampaign(campaignEmailId);
        },
        onCancel() { },
      });
    };

    const onClick = event => {
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(campaignEmail.id);
        default:
          return () => {};
      }
    };

    const addMenu = (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage id="ARCHIVED" />
        </Menu.Item>
      </Menu>
    );

    return addMenu;
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
      campaignEmail,
      translations,
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: translations.EMAIL_CAMPAIGNS, url: `/v2/o/${organisationId}/campaigns/email` },
      { name: campaignEmail.name },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        { actionElement }
        <Link to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/edit`}>
          <Button>
            <Icon type="edit" />
            <FormattedMessage id="EDIT" />
          </Button>
        </Link>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis" />
          </Button>
        </Dropdown>
      </Actionbar>
    );

  }
}

EmailCampaignActionbar.propTypes = {
  translations: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
  campaignEmail: PropTypes.shape().isRequired,
  updateEmailCampaign: PropTypes.func.isRequired,
  archiveEmailCampaign: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  campaignEmail: state.campaignEmailSingle.campaignEmailApi.campaignEmail,
});

const mapDispatchToProps = {
  updateEmailCampaign: EmailCampaignActions.updateEmailCampaign.request,
  archiveEmailCampaign: EmailCampaignActions.archiveEmailCampaign.request,
};

EmailCampaignActionbar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailCampaignActionbar);

EmailCampaignActionbar = withRouter(EmailCampaignActionbar);

export default EmailCampaignActionbar;
