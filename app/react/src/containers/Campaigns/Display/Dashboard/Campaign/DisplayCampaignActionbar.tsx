import * as React from 'react';
import moment from 'moment';
import { Button, Dropdown, Icon, Menu, Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router';

import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import withTranslations, { TranslationProps } from '../../../../Helpers/withTranslations';
import messages from '../messages';
import { CampaignResource } from '../../../../../models/CampaignResource';
import modalMessages from '../../../../../common/messages/modalMessages';
import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons';
import ExportService from '../../../../../services/ExportService';
import ReportService from '../../../../../services/ReportService';
import log from '../../../../../utils/Logger';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
// import { ReportView } from '../../../../../models/ReportView';

interface RouterMatchParams {
  organisationId: string;
  campaignId: string;
  adGroupId?: string;
}

interface DisplayCampaignActionBarProps {
  campaign: CampaignResource;
  updateCampaign: (campaignId: string, object: {
    status: string,
    type: string,
  }) => void;
  isFetchingStats?: boolean;
  archiveCampaign?: any;
}

type JoinedProps =
  DisplayCampaignActionBarProps &
  RouteComponentProps<RouterMatchParams> &
  InjectedIntlProps &
  TranslationProps;

const formatReportView = (reportView: any, key: string) => {
  const format = normalizeReportView(reportView);
  return normalizeArrayOfObject(format, key);
};

const fetchAllExportData = (organisationId: string, campaignId: string, filter: {
  rangeType: string;
  lookbackWindow: any;
  from: moment.Moment;
  to: moment.Moment;
}) => {

  const dimensions = filter.lookbackWindow.asSeconds() > 172800 ? 'day' : 'day,hour_of_day';
  // const getCampaignAdGroupAndAd = () => DisplayCampaignService.getCampaignDisplay(campaignId, { view: 'deep' });
  const defaultMetrics = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];

  const apiResults = Promise.all([
    ReportService.getMediaDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
      defaultMetrics,
      { sort: '-clicks' },
    ).promise,
    ReportService.getAdDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
      defaultMetrics,
    ).promise,
    ReportService.getAdGroupDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
      defaultMetrics,
    ).promise,
    ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      '',
      ['cpa', 'cpm', 'ctr', 'cpc', 'impressions_cost'],
    ).promise,
    ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      dimensions,
      defaultMetrics,
    ).promise,
  ]);

  return apiResults.then(response => {
    const mediaData = normalizeReportView(response[0].data.report_view);
    const adData = formatReportView(response[1].data.report_view, 'ad_id');
    const adGroupData = formatReportView(response[2].data.report_view, 'campaign_id');
    const overallDisplayData = normalizeReportView(response[3].data.report_view);
    const displayData = normalizeReportView(response[4].data.report_view);
    return {
      mediaData: mediaData,
      adData: adData,
      adGroupData: adGroupData,
      overallDisplayData: overallDisplayData,
      displayData: displayData,
    };
  });
};

class DisplayCampaignActionbar extends React.Component<JoinedProps> {

  handleRunExport = () => {

    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
      intl: {
        formatMessage,
      },
    } = this.props;

    const filter = parseSearch(this.props.location.search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const hideExportLoadingMsg = message.loading(this.props.translations.EXPORT_IN_PROGRESS, 0);

    fetchAllExportData(organisationId, campaignId, filter).then(exportData => {
      ExportService.exportDisplayCampaignDashboard(
        organisationId,
        exportData.displayData,
        exportData.overallDisplayData,
        exportData.mediaData,
        exportData.adGroupData,
        exportData.adData,
        filter,
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
      isFetchingStats,
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: formatMessage(messages.display), url: `/v2/o/${organisationId}/campaigns/display` },
      { name: campaign.name },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        {actionElement}
        <Button onClick={this.handleRunExport}>
          {!isFetchingStats && <McsIcons type="download" />}<FormattedMessage id="EXPORT" />
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
      updateCampaign,
    } = this.props;

    const onClickElement = (status: string) => () => updateCampaign(campaign.id, {
      status,
      type: 'EMAIL',
    });

    const activeCampaignElement = (
      <Button
        className="mcs-primary"
        type="primary"
        onClick={onClickElement('ACTIVE')}
      >
        <McsIcons type="play" />
        <FormattedMessage {...messages.activateCampaign} />
      </Button>
    );
    const pauseCampaignElement = (
      <Button
        className="mcs-primary"
        type="primary"
        onClick={onClickElement('PAUSED')}
      >
        <McsIcons type="pause" />
        <FormattedMessage {...messages.pauseCampaign} />
      </Button>
    );

    if (campaign && !campaign.id) {
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
      intl: { formatMessage },
    } = this.props;

    const handleArchiveGoal = (displayCampaignId: number) => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveCampaign(displayCampaignId);
        },
        // onCancel() {},
      });
    };

    const onClick = (event: any) => {
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(campaign.id);
        default:
          return () => {
            log.error('onclick error');
          };
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

export default compose<JoinedProps, DisplayCampaignActionBarProps>(
  withRouter,
  injectIntl,
  withTranslations,
)(DisplayCampaignActionbar);
