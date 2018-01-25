import * as React from 'react';
import { Button, Dropdown, Icon, Menu, Modal, message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';

import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import withTranslations, { TranslationProps } from '../../../../Helpers/withTranslations';
import messages from '../messages';
import { CampaignResource, CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import { AdInfoResource } from '../../../../../models/campaign/display/DisplayCampaignInfoResource';
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
import McsMoment from '../../../../../utils/McsMoment';

interface DisplayCampaignActionBarProps {
  campaign: CampaignResource;
  updateCampaign: (campaignId: string, object: {
    status: string,
    type: string,
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
  from: McsMoment;
  to: McsMoment;
}) => {

  const lookbackWindow = filter.to.toMoment().unix() - filter.from.toMoment().unix();
  const dimensions = lookbackWindow > 172800 ? ['day'] : ['day,hour_of_day'];
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

  return apiResults.then((responses) => {
    const mediaData = normalizeReportView(responses[0].data.report_view);
    const adPerformanceById = formatReportView(responses[1].data.report_view, 'message_id');
    const adGroupPerformanceById = formatReportView(responses[2].data.report_view, 'sub_campaign_id');
    const overallDisplayData = normalizeReportView(responses[3].data.report_view);
    const data = responses[4].data;
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

    const ads: AdInfoResource[] = [];
    const adAdGroup: Array<{ ad_id: string, ad_group_id: string, campaign_id: string }> = [];

    data.ad_groups.forEach(adGroup => {
      adGroup.ads.forEach(ad => {
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

  editCampaign = () => {
    const {
      location,
      history,
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}/edit`;
    history.push({ pathname: editUrl, state : { from: `${location.pathname}${location.search}` } });
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
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

          <Button onClick={this.editCampaign}>
            <McsIcons type="pen" />
            <FormattedMessage {...messages.editCampaign} />
          </Button>

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

    const onClickElement = (status: string) => () => updateCampaign(campaign.items.id, {
      status,
      type: 'DISPLAY',
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

    if (campaign.items && !campaign.items.id) {
      return null;
    }

    return ((campaign.items.status === 'PAUSED' || campaign.items.status === 'PENDING')
        ? activeCampaignElement
        : pauseCampaignElement
    );
  }

  duplicateCampaign = () => {
    const {
      location,
      history,
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/create`;
    history.push({ pathname: editUrl, state : { from: `${location.pathname}${location.search}`, campaignId: campaignId } });
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
        case 'DUPLICATE':
          return this.duplicateCampaign();
        default:
          return () => {
            log.error('onclick error');
          };
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="DUPLICATE">
          <FormattedMessage {...messages.duplicate} />
        </Menu.Item>
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
