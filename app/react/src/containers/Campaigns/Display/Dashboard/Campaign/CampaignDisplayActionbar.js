import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons';
import messages from '../messages';

class CampaignDisplayActionbar extends Component {

  buildActionElement = () => {
    const {
      campaignDisplay,
      updateCampaignDisplay,
    } = this.props;

    const onClickElement = status => updateCampaignDisplay(campaignDisplay.id, {
      status,
      type: 'EMAIL',
    });

    const activeCampaignElement = (
      <Button
        className="mcs-primary"
        type="primary"
        onClick={() => onClickElement('ACTIVE')}
      >
        <McsIcons type="play" />
        <FormattedMessage {...messages.activateCampaign} />
      </Button>
    );
    const pauseCampaignElement = (
      <Button
        className="mcs-primary"
        type="primary"
        onClick={() => onClickElement('PAUSED')}
      >
        <McsIcons type="pause" />
        <FormattedMessage {...messages.pauseCampaign} />
      </Button>
    );

    if (!campaignDisplay.id) {
      return null;
    }

    return ((campaignDisplay.status === 'PAUSED' || campaignDisplay.status === 'PENDING')
      ? activeCampaignElement
      : pauseCampaignElement
    );
  }

  buildMenu = () => {
    const {
      translations,
      campaignDisplay,
      archiveCampaignDisplay,
    } = this.props;

    const handleArchiveGoal = campaignDisplayId => {
      Modal.confirm({
        title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
        content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
        iconType: 'exclamation-circle',
        okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
        cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
        onOk() {
          return archiveCampaignDisplay(campaignDisplayId);
        },
        onCancel() { },
      });
    };

    const onClick = event => {
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(campaignDisplay.id);
        default:
          return () => {};
      }
    };

    const addMenu = (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.archiveCampaign} />
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
      campaignDisplay,
      translations,
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      {
        name: translations.DISPLAY_CAMPAIGNS,
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
      { name: campaignDisplay.name },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        { actionElement }
        <Link to={`/${organisationId}/campaigns/display/expert/edit/${campaignId}`}>
          <Button>
            <McsIcons type="pen" />
            <FormattedMessage {...messages.editCampaign} />
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

CampaignDisplayActionbar.propTypes = {
  translations: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
  campaignDisplay: PropTypes.shape().isRequired,
  updateCampaignDisplay: PropTypes.func.isRequired,
  archiveCampaignDisplay: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

const mapDispatchToProps = {
};

CampaignDisplayActionbar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CampaignDisplayActionbar);


CampaignDisplayActionbar = compose(
  injectIntl,
  withRouter,
)(CampaignDisplayActionbar);

export default CampaignDisplayActionbar;
