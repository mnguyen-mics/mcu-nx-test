import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Menu, Modal, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { withTranslations } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';
import modalMessages from '../../../../../common/messages/modalMessages';
import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons';
import ExportService from '../../../../../services/ExportService';
import ReportService from '../../../../../services/ReportService';
import log from '../../../../../utils/Logger';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { normalizeReportView, formatReportView } from '../../../../../utils/MetricHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

const fetchAllExportData = (organisationId: number, campaignId: number, filter: {
  rangeType: string;
  lookbackWindow: any;
  from: string;
  to: string;
}) => {

  const dimensions = filter.lookbackWindow.asSeconds() > 172800 ? 'day' : 'day,hour_of_day';
  // const getCampaignAdGroupAndAd = () => DisplayCampaignService.getCampaignDisplay(campaignId, { view: 'deep' });

  const apiResults = Promise.all([
    ReportService.getMediaDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
      '',
      { sort: '-clicks' },
    ),
    ReportService.getAdDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
    ),
    ReportService.getAdGroupDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
    ),
    ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      '',
      ['cpa', 'cpm', 'ctr', 'cpc', 'impressions_cost'],
    ),
    ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      dimensions,
    ),
  ]);

  return apiResults.then(response => {
    // const mediaData = normalizeReportView(response[0].data.report_view, 'campaign_id');
    // const adData = formatReportView(response[1].data.report_view, 'ad_id');
    // const adGroupData = formatReportView(response[2].data.report_view, 'ad_group_id');
    // const overallDisplayData = normalizeReportView(response[3].data.report_view);
    // const displayData = normalizeReportView(response[4].data.report_view, 'campaign_id');
    // return {
    //   mediaData: mediaData,
    //   adData: adData,
    //   adGroupData: adGroupData,
    //   overallDisplayData: overallDisplayData,
    //   displayData: displayData,
    // };
  });
};

interface DisplayCampaignActionBarProps {
  match: {
    params: {
      organisationId: number;
      campaignId: number;
    };
  };
  intl: {
    formatMessage: string;
   };
  location: {
    search: string;
  };
  translations: any;
}

class DisplayCampaignActionbar extends React.Component<DisplayCampaignActionBarProps> {

  handleRunExport = () => {

    const filter = parseSearch(location.search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchAllExportData(organisationId, campaignId, filter).then(exportData => {
      ExportService.exportDisplayCampaignDashboard(
        organisationId,
        exportData.displayData,
        exportData.overallDisplayData,
        exportData.mediaData,
        exportData.adGroupData,
        exportData.adData, filter,
        formatMessage);
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    }).catch((err) => {
      log.error(err);
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    });
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
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
        <Link to={`/v2/o/${organisationId}/campaigns/display/${campaignId}/edit`}>
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
  };

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

// DisplayCampaignActionbar.propTypes = {
//   intl: intlShape.isRequired,
//   location: ReactRouterPropTypes.location.isRequired,
//   match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
//   campaign: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
//   updateCampaign: PropTypes.func.isRequired,
//   archiveCampaign: PropTypes.func.isRequired,
//   isFetchingStats: PropTypes.bool.isRequired,
//   translations: PropTypes.objectOf(PropTypes.string).isRequired,
// };

DisplayCampaignActionbar = compose(
  withRouter,
  injectIntl,
  withTranslations,
)(DisplayCampaignActionbar);

export default DisplayCampaignActionbar;
