import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal, message } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import messages from '../messages';
import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons';
import ExportService from '../../../../../services/ExportService';

import { parseSearch } from '../../../../../utils/LocationSearchHelper';

class DisplayCampaignActionbar extends Component {

  handleRunExport = () => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      translations,
      campaignStats,
      adGroupsStats,
      adsStats
    } = this.props;

    const filter = parseSearch(this.props.location.search);
    ExportService.exportDisplayCampaignDashboard(organisationId, campaignStats, adGroupsStats, adsStats, filter, translations);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
          campaignId
        },
      },
      campaign,
      translations,
      isFetchingStats
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: translations.DISPLAY_CAMPAIGNS, url: `/v2/o/${organisationId}/campaigns/display` },
      { name: campaign.name },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        { actionElement }
        <Button onClick={this.handleRunExport
        }>
          { !isFetchingStats && <McsIcons type="download"/> }<FormattedMessage id="EXPORT"/>
        </Button>
        <Link to={`/${organisationId}/campaigns/display/expert/edit/${campaignId}`}>
          <Button>
            <McsIcons type="pen"/>
            <FormattedMessage {...messages.editCampaign} />
          </Button>
        </Link>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis"/>
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }

  buildActionElement = () => {
    const {
      campaign,
      updateCampaign
    } = this.props;

    const onClickElement = status => updateCampaign(campaign.id, {
      status,
      type: 'EMAIL',
    });

    const activeCampaignElement = (
      <Button
        className="mcs-primary"
        type="primary"
        onClick={() => onClickElement('ACTIVE')}
      >
        <McsIcons type="play"/>
        <FormattedMessage {...messages.activateCampaign} />
      </Button>
    );
    const pauseCampaignElement = (
      <Button
        className="mcs-primary"
        type="primary"
        onClick={() => onClickElement('PAUSED')}
      >
        <McsIcons type="pause"/>
        <FormattedMessage {...messages.pauseCampaign} />
      </Button>
    );

    if (!campaign.id) {
      return null;
    }

    return ((campaign.status === 'PAUSED' || campaign.status === 'PENDING')
        ? activeCampaignElement
        : pauseCampaignElement
    );
  }

  buildMenu = () => {
    const {
      translations,
      campaign,
      archiveCampaign
    } = this.props;

    const handleArchiveGoal = displayCampaignId => {
      Modal.confirm({
        title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
        content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
        iconType: 'exclamation-circle',
        okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
        cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
        onOk() {
          return archiveCampaign(displayCampaignId);
        },
        onCancel() { },
      });
    };

    const onClick = event => {
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(campaign.id);
        default:
          return () => {};
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.archiveCampaign} />
        </Menu.Item>
      </Menu>
    );
  }
}

DisplayCampaignActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  campaign: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  updateCampaign: PropTypes.func.isRequired,
  archiveCampaign: PropTypes.func.isRequired,
  isFetchingStats: PropTypes.bool.isRequired,
  campaignStats: PropTypes.array.isRequired,
  adGroupsStats: PropTypes.array.isRequired,
  adsStats: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  translations: state.translations,
});

const mapDispatchToProps = {};

DisplayCampaignActionbar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DisplayCampaignActionbar);

DisplayCampaignActionbar = compose(
  withRouter,
  injectIntl
)(DisplayCampaignActionbar);

export default DisplayCampaignActionbar;
