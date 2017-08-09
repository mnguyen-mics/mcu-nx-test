import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';
import modalMessages from '../../../../../common/messages/modalMessages';
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
      intl: { formatMessage },
      location: { search },
      campaignStats,
      mediasStats,
      adGroupsStats,
      adsStats
    } = this.props;

    const filter = parseSearch(search, null);
    ExportService.exportDisplayCampaignDashboard(organisationId, campaignStats, mediasStats, adGroupsStats, adsStats, filter, formatMessage);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
          campaignId
        },
      },
      intl: { formatMessage },
      campaign,
      isFetchingStats
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: formatMessage(messages.display), url: `/v2/o/${organisationId}/campaigns/display` },
      { name: campaign.name }
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        { actionElement }
        <Button onClick={this.handleRunExport}>
          { !isFetchingStats && <McsIcons type="download" /> }<FormattedMessage id="EXPORT" />
        </Button>
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
      campaign,
      archiveCampaign,
      intl: { formatMessage }
    } = this.props;

    const handleArchiveGoal = displayCampaignId => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
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
  intl: intlShape.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  campaign: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  updateCampaign: PropTypes.func.isRequired,
  archiveCampaign: PropTypes.func.isRequired,
  isFetchingStats: PropTypes.bool.isRequired,
  campaignStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  mediasStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  adGroupsStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  adsStats: PropTypes.arrayOf(PropTypes.object).isRequired
};

DisplayCampaignActionbar = compose(
  withRouter,
  injectIntl
)(DisplayCampaignActionbar);

export default DisplayCampaignActionbar;
