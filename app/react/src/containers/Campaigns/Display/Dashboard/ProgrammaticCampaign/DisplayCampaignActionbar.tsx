import * as React from 'react';
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Menu, Modal, message } from 'antd';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import messages from '../messages';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import {
  AdInfoResource,
  DisplayCampaignInfoResource,
  AdGroupInfoResource,
} from '../../../../../models/campaign/display/DisplayCampaignInfoResource';
import modalMessages from '../../../../../common/messages/modalMessages';
import { Actionbar, McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';
import ExportService from '../../../../../services/ExportService';
import ReportService from '../../../../../services/ReportService';
import log from '../../../../../utils/Logger';
import { parseSearch, DateSearchSettings } from '../../../../../utils/LocationSearchHelper';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { ReportView } from '../../../../../models/ReportView';
import { GoalsCampaignRessource } from './domain';
import { Index } from '../../../../../utils';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import { formatDisplayCampaignProperty } from '../../../Display/messages';
import resourceHistoryMessages from '../../../../ResourceHistory/ResourceTimeline/messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';
import { IResourceHistoryService } from '../../../../../services/ResourceHistoryService';
import { IGoalService } from '../../../../../services/GoalService';

const { Dropdown } = PopupContainer;

interface DisplayCampaignActionBarProps {
  campaign: Omit<DisplayCampaignInfoResource, 'ad_groups'>;
  updateCampaign: (
    campaignId: string,
    object: {
      status: string;
      type: string;
    },
  ) => void;
  isFetchingStats?: boolean;
  archiveCampaign?: any;
}

interface DisplayCampaignActionBarState {
  exportIsRunning: boolean;
}

type JoinedProps = DisplayCampaignActionBarProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps &
  InjectedDrawerProps;

// type ReportViewReponse = CancelablePromise<ReportView>;

const formatReportView = (reportView: ReportView, key: string) => {
  const format = normalizeReportView(reportView);
  return normalizeArrayOfObject(format, key);
};

class DisplayCampaignActionbar extends React.Component<JoinedProps, DisplayCampaignActionBarState> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  @lazyInject(TYPES.IResourceHistoryService)
  private _resourceHistoryService: IResourceHistoryService;

  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = { exportIsRunning: false };
  }

  handleRunExport = (e: React.MouseEvent) => {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      intl: { formatMessage },
    } = this.props;

    this.setState({ exportIsRunning: true });

    const filter = parseSearch<DateSearchSettings>(
      this.props.location.search,
      DISPLAY_DASHBOARD_SEARCH_SETTINGS,
    );

    const hideExportLoadingMsg = message.loading(formatMessage(messages.exportInProgress), 0);

    this.fetchAllExportData(organisationId, campaignId, filter)
      .then(exportData => {
        // We don't want to display empty cells in the export
        exportData.mediaData.map(media => {
          media.display_network_name =
            media.display_network_name || formatMessage(messages.displayNetworkNameUncategorized);
          media.cpa = media.cpa || 0;
          media.cpc = media.cpc || 0;
          media.cpm = media.cpm || 0;
          media.ctr = media.ctr || 0;
        });
        ExportService.exportDisplayCampaignDashboard(
          organisationId,
          exportData.displayData,
          exportData.overallDisplayData,
          exportData.mediaData,
          exportData.adGroupData.items,
          exportData.adData.items,
          exportData.goalData,
          filter,
          formatMessage,
        );
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(err => {
        log.error(err);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  exportIsRunningModal = (e: React.MouseEvent) => {
    const {
      intl: { formatMessage },
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.exportIsRunningTitle),
      content: formatMessage(modalMessages.exportIsRunningMessage),
      icon: <ExclamationCircleOutlined />,
      okText: formatMessage(modalMessages.confirm),
      onOk() {
        // closing modal
      },
      // onCancel() {},
    });
  };

  editCampaign = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, campaignId },
      },
      campaign,
      intl,
    } = this.props;

    if (campaign.model_version === 'V2014_06') {
      message.info(intl.formatMessage(messages.editionNotAllowed));
    } else {
      const editUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}/edit`;
      history.push({
        pathname: editUrl,
        state: { from: `${location.pathname}${location.search}` },
      });
    }
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      campaign,
    } = this.props;

    const { exportIsRunning } = this.state;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/display`}>
        {formatMessage(messages.display)}
      </Link>,
      (campaign && campaign.name) || '',
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        {actionElement}
        <Button
          onClick={exportIsRunning ? this.exportIsRunningModal : this.handleRunExport}
          className='mcs-displayCampaign_actionBar_export'
        >
          <McsIcon type='download' />
          <FormattedMessage id='display.campaign.actionbar.exportButton' defaultMessage='Export' />
        </Button>

        {campaign && campaign.model_version !== 'V2014_06' && (
          <Button onClick={this.editCampaign} className='mcs-displayCampaign_actionBar_edit'>
            <McsIcon type='pen' />
            <FormattedMessage {...messages.editCampaign} />
          </Button>
        )}

        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }

  buildActionElement = () => {
    const { campaign, updateCampaign } = this.props;

    const onClickElement = (status: string) => () =>
      campaign
        ? updateCampaign(campaign.id, {
            status,
            type: 'DISPLAY',
          })
        : null;

    const activeCampaignElement = (
      <Button
        className='mcs-primary mcs-displayCampaign_actionBar_activate'
        type='primary'
        onClick={onClickElement('ACTIVE')}
      >
        <McsIcon type='play' />
        <FormattedMessage {...messages.activateCampaign} />
      </Button>
    );
    const pauseCampaignElement = (
      <Button
        className='mcs-primary mcs-displayCampaign_actionBar_pause'
        type='primary'
        onClick={onClickElement('PAUSED')}
      >
        <McsIcon type='pause' />
        <FormattedMessage {...messages.pauseCampaign} />
      </Button>
    );

    if (campaign && !campaign.id) {
      return null;
    }

    return campaign && (campaign.status === 'PAUSED' || campaign.status === 'PENDING')
      ? activeCampaignElement
      : pauseCampaignElement;
  };

  duplicateCampaign = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/create`;
    history.push({
      pathname: editUrl,
      state: {
        from: `${location.pathname}${location.search}`,
        campaignId: campaignId,
      },
    });
  };

  fetchAllExportData = (organisationId: string, campaignId: string, filter: DateSearchSettings) => {
    const lookbackWindow = filter.to.toMoment().unix() - filter.from.toMoment().unix();
    const dimensions = lookbackWindow > 172800 ? ['day'] : ['day,hour_of_day'];
    const defaultMetrics: string[] = [
      'impressions',
      'clicks',
      'cpm',
      'ctr',
      'cpc',
      'impressions_cost',
      'cpa',
    ];

    const getGoalsData = () =>
      this._displayCampaignService
        .getGoals(campaignId)
        .then(res => {
          const promises = res.data.map(goal => {
            return this._goalService.getAttributionModels(goal.goal_id).then(attribution => {
              const goalCampaign: GoalsCampaignRessource = {
                ...goal,
                attribution: attribution.data,
              };
              return goalCampaign;
            });
          });
          return Promise.all(promises);
        })
        .then(res => {
          return Promise.all(
            res.map(goal => {
              const goalAttributionPerformance: Array<Promise<Index<any>>> = [];
              goal.attribution.forEach(attribution => {
                const filters = [
                  `campaign_id==${campaignId}`,
                  `goal_id==${goal.goal_id}`,
                  `attribution_model_id==${attribution.id}`,
                ];
                const myPromise = ReportService.getConversionAttributionPerformance(
                  organisationId,
                  filter.from,
                  filter.to,
                  filters,
                  ['day'],
                  undefined,
                )
                  .then(report => normalizeReportView(report.data.report_view))
                  .then(report => ({ ...attribution, perf: report }));
                goalAttributionPerformance.push(myPromise);
              });
              return Promise.all(goalAttributionPerformance).then(attribution => ({
                ...goal,
                attribution,
              }));
            }),
          );
        });

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
        filter.from,
        filter.to,
        [['campaign_id', campaignId]],
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
      getGoalsData(),
      this._displayCampaignService.getCampaignDisplayViewDeep(campaignId, {
        view: 'deep',
      }),
    ]);

    return apiResults.then(responses => {
      const mediaData = normalizeReportView(responses[0].data.report_view);
      const adPerformanceById = formatReportView(responses[1].data.report_view, 'message_id');
      const adGroupPerformanceById = formatReportView(
        responses[2].data.report_view,
        'sub_campaign_id',
      );
      const overallDisplayData = normalizeReportView(responses[3].data.report_view);
      const goalData = responses[4];
      const data = responses[5].data;
      const { ad_groups: adGroups, ...campaign } = data;

      const formattedAdGroups: Array<Omit<AdGroupInfoResource, 'ads'>> = adGroups.map(adGroup => {
        const { ads: unusedAds, ...adGroupWithoutAds } = adGroup;
        return adGroupWithoutAds;
      });

      const ads: AdInfoResource[] = [];
      const adAdGroup: Array<{
        ad_id: string;
        ad_group_id: string;
        campaign_id: string;
      }> = [];

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
          return Object.keys(a).map(c => {
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
          items: formatListView(adItemsById, adPerformanceById),
        },
        adGroupData: {
          items: formatListView(adGroupItemsById, adGroupPerformanceById),
        },
        overallDisplayData: overallDisplayData,
        displayData: campaign,
        goalData: goalData,
      };
    });
  };

  buildMenu = () => {
    const {
      campaign,
      archiveCampaign,
      intl: { formatMessage },
    } = this.props;

    const handleArchiveGoal = (displayCampaignId: string) => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        icon: <ExclamationCircleOutlined />,
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveCampaign(displayCampaignId);
        },
        // onCancel() {},
      });
    };

    const onClick = (event: any) => {
      const {
        match: {
          params: { organisationId, campaignId },
        },
        history,
      } = this.props;

      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(campaign.id);
        case 'DUPLICATE':
          return this.duplicateCampaign();
        case 'HISTORY':
          return this.props.openNextDrawer<ResourceTimelinePageProps>(ResourceTimelinePage, {
            additionalProps: {
              resourceType: 'CAMPAIGN',
              resourceId: campaignId,
              handleClose: () => this.props.closeNextDrawer(),
              formatProperty: formatDisplayCampaignProperty,
              resourceLinkHelper: {
                AD_GROUP: {
                  direction: 'CHILD',
                  getType: () => {
                    return <FormattedMessage {...resourceHistoryMessages.adGroupResourceType} />;
                  },
                  getName: (id: string) => {
                    return this._displayCampaignService
                      .getAdGroup(campaignId, id)
                      .then(response => {
                        return response.data.name || id;
                      });
                  },
                  goToResource: (id: string) => {
                    history.push(
                      `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${id}`,
                    );
                  },
                },
                GOAL_SELECTION: {
                  direction: 'CHILD',
                  getType: () => {
                    return <FormattedMessage {...resourceHistoryMessages.goalResourceType} />;
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(organisationId, 'GOAL_SELECTION', id, 'GOAL')
                      .then(goalId => {
                        return this._goalService.getGoal(goalId).then(response => {
                          return response.data.name;
                        });
                      });
                  },
                  goToResource: (id: string) => {
                    this._resourceHistoryService
                      .getLinkedResourceIdInSelection(organisationId, 'GOAL_SELECTION', id, 'GOAL')
                      .then(goalId => {
                        history.push(`/v2/o/${organisationId}/campaigns/goals/${goalId}`);
                      });
                  },
                },
              },
            },
            size: 'small',
          });
        default:
          return () => {
            log.error('onclick error');
          };
      }
    };

    return (
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='HISTORY'>
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        {campaign && campaign.model_version === 'V2014_06' ? null : (
          <Menu.Item key='DUPLICATE'>
            <FormattedMessage {...messages.duplicate} />
          </Menu.Item>
        )}
        <Menu.Item key='ARCHIVED'>
          <FormattedMessage {...messages.archiveCampaign} />
        </Menu.Item>
      </Menu>
    );
  };
}

export default compose<JoinedProps, DisplayCampaignActionBarProps>(
  withRouter,
  injectIntl,
  injectDrawer,
)(DisplayCampaignActionbar);
