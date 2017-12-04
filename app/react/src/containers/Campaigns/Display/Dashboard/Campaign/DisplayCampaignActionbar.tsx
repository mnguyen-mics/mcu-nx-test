import * as React from 'react';
import moment from 'moment';
import { Button, Dropdown, Icon, Menu, Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router';

import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import withTranslations, { TranslationProps } from '../../../../Helpers/withTranslations';
import messages from '../messages';
import { CampaignResource, CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import modalMessages from '../../../../../common/messages/modalMessages';
import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons';
import ExportService from '../../../../../services/ExportService';
import ReportService from '../../../../../services/ReportService';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import log from '../../../../../utils/Logger';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { ReportView } from '../../../../../models/ReportView';

interface DisplayCampaignActionBarProps {
  campaign: CampaignResource;
  updateCampaign: (campaignId: string, object: {
    status: string,
  }) => void;
  isFetchingStats?: boolean;
  archiveCampaign?: any;
}

interface DisplayCampaignActionBarState {
  exportIsRunning: boolean;
}

type JoinedProps =
  DisplayCampaignActionBarProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps &
  TranslationProps;

// type ReportViewReponse = CancelablePromise<ReportView>;

const formatReportView = (reportView: ReportView, key: string) => {
  const format = normalizeReportView(reportView);
  return normalizeArrayOfObject(format, key);
};

const fetchAllExportData = (organisationId: string, campaignId: string, filter: {
  rangeType: string;
  lookbackWindow: any;
  from: moment.Moment;
  to: moment.Moment;
}) => {

  const dimensions: string[] = filter.lookbackWindow.asSeconds() > 172800 ? ['day'] : ['day,hour_of_day'];
  const defaultMetrics: string[] = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];

  const apiResults = Promise.all([
    ReportService.getMediaDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      undefined,
      defaultMetrics,
      { sort: '-clicks' },
    ),
    ReportService.getAdDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      undefined,
      defaultMetrics,
    ),
    ReportService.getAdGroupDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      undefined,
      defaultMetrics,
    ),
    ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      dimensions,
      defaultMetrics,
    ),
    DisplayCampaignService.getCampaignDisplayViewDeep(
      campaignId,
      { view: 'deep' },
    ),
  ]);

  return apiResults.then((response: any) => {
    const mediaData = normalizeReportView(response[0].data.report_view);
    const adPerformanceById = formatReportView(response[1].data.report_view, 'ad_id');
    const adGroupPerformanceById = formatReportView(response[2].data.report_view, 'ad_group_id');
    const overallDisplayData = normalizeReportView(response[3].data.report_view);
    const data = response[4].data;
    const campaign = {
      ...data,
    };
    delete campaign.ad_groups;

    const adGroups = [...data.ad_groups];
    const formattedAdGroups = adGroups.map(item => {
      const formattedItem = {
        ...item,
      };

      delete formattedItem.ads;

      return formattedItem;
    });

    const ads: object[] = [];
    const adAdGroup: object[] = [];

    data.ad_groups.forEach((adGroup: any) => {
      adGroup.ads.forEach((ad: any) => {
        ads.push(ad);
        adAdGroup.push({
          ad_id: ad.id,
          ad_group_id: adGroup.id,
          campaign_id: campaign.id,
        });
      });
    });

    const formatListView = (a: any, b: any) => {
      if (a) {
        return Object.keys(a).map((c) => {
          return {
            ...b[c],
            ...a[c],
          };
        });
      }
      return [];
    };

    const adGroupItemsById = normalizeArrayOfObject(formattedAdGroups, 'id');
    const adItemsById = normalizeArrayOfObject(ads, 'id');

    return {
      mediaData: mediaData,
      adData: {
        items: formatListView(
          adItemsById,
          adPerformanceById,
        ),
      },
      adGroupData: {
        items: formatListView(
          adGroupItemsById,
          adGroupPerformanceById,
        ),
      },
      overallDisplayData: overallDisplayData,
      displayData: campaign,
    };
  });
};

class DisplayCampaignActionbar extends React.Component<JoinedProps, DisplayCampaignActionBarState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = { exportIsRunning: false };
  }

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

    this.setState({ exportIsRunning: true });

    const filter = parseSearch(this.props.location.search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const hideExportLoadingMsg = message.loading(this.props.translations.EXPORT_IN_PROGRESS, 0);

    fetchAllExportData(organisationId, campaignId, filter).then(exportData => {
      ExportService.exportDisplayCampaignDashboard(
        organisationId,
        exportData.displayData,
        exportData.overallDisplayData,
        exportData.mediaData,
        exportData.adGroupData.items,
        exportData.adData.items,
        filter,
        formatMessage,
      );
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    }).catch((err) => {
      log.error(err);
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    });
  }

  exportIsRunningModal = (e: React.FormEvent<HTMLButtonElement>) => {
    const {
      intl: { formatMessage },
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.exportIsRunningTitle),
      content: formatMessage(modalMessages.exportIsRunningMessage),
      iconType: 'exclamation-circle',
      okText: formatMessage(modalMessages.confirm),
      onOk() {
        // closing modal
      },
      // onCancel() {},
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
    } = this.props;

    const {
      exportIsRunning,
    } = this.state;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: formatMessage(messages.display), url: `/v2/o/${organisationId}/campaigns/display` },
      { name: campaign.items.name },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        {actionElement}
        <Button onClick={exportIsRunning ? this.exportIsRunningModal : this.handleRunExport}>
          <McsIcons type="download" />
          <FormattedMessage id="EXPORT" />
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

    const onClickElement = (status: string) => () => updateCampaign(campaign.items.id, {status: status});

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

    if (campaign.items && !campaign.items.id) {
      return null;
    }

    return ((campaign.items.status === 'PAUSED' || campaign.items.status === 'PENDING')
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
          return handleArchiveGoal(campaign.items.id);
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
