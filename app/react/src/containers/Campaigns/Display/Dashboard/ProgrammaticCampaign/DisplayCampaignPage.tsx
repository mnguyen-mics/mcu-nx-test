import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { Button } from 'antd';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import DisplayCampaign from './DisplayCampaign';
import ReportService from '../../../../../services/ReportService';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { makeCancelable } from '../../../../../utils/ApiHelper';
import log from '../../../../../utils/Logger';
import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  DateSearchSettings,
} from '../../../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  initialPageState,
  DisplayCampaignPageState,
  GoalsCampaignRessource,
} from './domain';
import { CancelablePromise } from '../../../../../services/ApiService';
import {
  AdInfoResource,
  AdResource,
  AdGroupResource,
  AdGroupInfoResource,
} from '../../../../../models/campaign/display';
import { ReportView } from '../../../../../models/ReportView';
import { UpdateMessage } from './DisplayCampaignAdGroupTable';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';
import { IGoalService } from '../../../../../services/GoalService';

type Props = RouteComponentProps<{
  organisationId: string;
  campaignId: string;
}> &
  InjectedNotificationProps;

class DisplayCampaignPage extends React.Component<
  Props,
  DisplayCampaignPageState
> {
  cancelablePromises: Array<CancelablePromise<any>> = [];

  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  constructor(props: Props) {
    super(props);

    this.state = initialPageState;
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;

    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
      });
    } else {
      const filter = parseSearch<DateSearchSettings>(
        search,
        DISPLAY_DASHBOARD_SEARCH_SETTINGS,
      );

      this.fetchAllData(organisationId, campaignId, filter);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
      match: {
        params: { campaignId, organisationId },
      },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: {
          campaignId: previousCampaignId,
        },
      },
    } = previousProps;

    if (!compareSearches(search, previousSearch) || campaignId !== previousCampaignId) {
      if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(
            search,
            DISPLAY_DASHBOARD_SEARCH_SETTINGS,
          ),
        });
      } else {
        const filter = parseSearch<DateSearchSettings>(
          search,
          DISPLAY_DASHBOARD_SEARCH_SETTINGS,
        );

        this.fetchAllData(organisationId, campaignId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.cancelablePromises.forEach(promise => promise.cancel());
  }

  formatReportView(reportView: ReportView, key: string) {
    const format = normalizeReportView(reportView);
    return normalizeArrayOfObject(format, key);
  }

  fetchAllData = (
    organisationId: string,
    campaignId: string,
    filter: DateSearchSettings,
  ) => {
    const lookbackWindow =
      filter.to.toMoment().unix() - filter.from.toMoment().unix();
    const dimensions = lookbackWindow > 172800 ? ['day'] : ['day,hour_of_day'];
    const getCampaignAdGroupAndAd = () =>
      this._displayCampaignService.getCampaignDisplayViewDeep(campaignId, {
        view: 'deep',
      });
    const getCampaignPerf = makeCancelable(
      ReportService.getSingleDisplayDeliveryReport(
        organisationId,
        campaignId,
        filter.from,
        filter.to,
        dimensions,
      ),
    );
    const getOverallCampaignPerf = makeCancelable(
      ReportService.getSingleDisplayDeliveryReport(
        organisationId,
        campaignId,
        filter.from,
        filter.to,
        undefined,
        ['cpa', 'cpm', 'ctr', 'cpc', 'impressions_cost'],
      ),
    );
    const getAdGroupPerf = makeCancelable(
      ReportService.getAdGroupDeliveryReport(
        organisationId,
        'campaign_id',
        campaignId,
        filter.from,
        filter.to,
        undefined,
      ),
    );
    const getAdPerf = makeCancelable(
      ReportService.getAdDeliveryReport(
        organisationId,
        'campaign_id',
        campaignId,
        filter.from,
        filter.to,
        undefined,
      ),
    );
    const getMediaPerf = makeCancelable(
      ReportService.getMediaDeliveryReport(
        organisationId,
        'campaign_id',
        campaignId,
        filter.from,
        filter.to,
        undefined,
        undefined,
        { sort: '-clicks', limit: 30 },
      ),
    );

    this.cancelablePromises.push(
      getCampaignPerf,
      getMediaPerf,
      getAdPerf,
      getAdGroupPerf,
      getOverallCampaignPerf,
      getOverallCampaignPerf,
    );

    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };

      nextState.campaign.data.isLoading = true;
      nextState.adGroups.data.isLoading = true;
      nextState.ads.data.isLoading = true;
      nextState.campaign.performance.isLoading = true;
      nextState.campaign.mediaPerformance.isLoading = true;
      nextState.campaign.overallPerformance.isLoading = true;
      nextState.adGroups.performance.isLoading = true;
      nextState.ads.performance.isLoading = true;
      nextState.goals.isLoading = true;

      return nextState;
    });

    getCampaignAdGroupAndAd().then(({ data: displayCampaignInfoResource }) => {
      const { ad_groups: adGroups, ...campaign } = displayCampaignInfoResource;

      const formattedAdGroups: Array<Omit<AdGroupInfoResource, 'ads'>> = adGroups.map(adGroup => {
        const { ads: unusedAds, ...adGroupWithoutAds } = adGroup;
        return adGroupWithoutAds;
      })
      
      const adGroupCampaign = adGroups.map(item => {
        return {
          ad_group_id: item.id,
          campaign_id: campaign.id,
        };
      });

      const ads: AdInfoResource[] = [];
      const adAdGroup: Array<{
        ad_id: string;
        ad_group_id: string;
        campaign_id: string;
      }> = [];

      adGroups.forEach(adGroup => {
        adGroup.ads.forEach(ad => {
          ads.push(ad);
          adAdGroup.push({
            ad_id: ad.id,
            ad_group_id: adGroup.id,
            campaign_id: campaign.id,
          });
        });
      });

      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };

        nextState.campaign.data.isLoading = false;
        nextState.adGroups.data.isLoading = false;
        nextState.ads.data.isLoading = false;
        nextState.campaign.data.items = [campaign];
        nextState.adGroups.data.items = normalizeArrayOfObject(
          formattedAdGroups,
          'id',
        );
        nextState.adGroups.data.adGroupCampaign = normalizeArrayOfObject(
          adGroupCampaign,
          'ad_group_id',
        );
        nextState.ads.data.items = normalizeArrayOfObject(ads, 'id');
        nextState.ads.data.adAdGroup = normalizeArrayOfObject(
          adAdGroup,
          'ad_id',
        );

        return nextState;
      });
    });

    this._displayCampaignService
      .getGoals(campaignId)
      .then(goals => goals.data)
      .then(goals => {
        const promises = goals.map(goal => {
          return this._goalService.getAttributionModels(goal.goal_id).then(
            attribution => {
              const goalCampaign: GoalsCampaignRessource = {
                ...goal,
                attribution: attribution.data,
              };
              return goalCampaign;
            },
          );
        });
        return Promise.all(promises);
      })
      .then(goals => {
        this.setState({
          goals: {
            items: goals,
            isLoading: false,
            isArchiving: false,
            isUpdating: false,
          },
        });
      });

    getCampaignPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'campaign',
          'performance',
          'items',
          normalizeReportView(response.data.report_view),
        );
      })
      .catch(err =>
        this.catchCancellablePromises(err, 'campaign', 'performance'),
      );

    getAdGroupPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'adGroups',
          'performance',
          'items',
          this.formatReportView(response.data.report_view, 'sub_campaign_id'),
        );
      })
      .catch(err =>
        this.catchCancellablePromises(err, 'adGroups', 'performance'),
      );

    getAdPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'ads',
          'performance',
          'items',
          this.formatReportView(response.data.report_view, 'message_id'),
        );
      })
      .catch(err => this.catchCancellablePromises(err, 'ads', 'performance'));

    getMediaPerf.promise
      .then(response => {
        const formattedReportView = {
          ...response.data.report_view,
        };
        formattedReportView.rows = response.data.report_view.rows.splice(0, 30);
        this.updateStateOnPerf(
          'campaign',
          'mediaPerformance',
          'items',
          normalizeReportView(formattedReportView),
        );
      })
      .catch(err =>
        this.catchCancellablePromises(err, 'campaign', 'mediaPerformance'),
      );

    getOverallCampaignPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'campaign',
          'overallPerformance',
          'items',
          normalizeReportView(response.data.report_view),
        );
      })
      .catch(err =>
        this.catchCancellablePromises(err, 'campaign', 'overallPerformance'),
      );
  };

  updateStateOnPerf(
    firstLevelKey: keyof DisplayCampaignPageState,
    secondLevelKey: string,
    thirdLevel: string,
    performanceReport: object,
  ) {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      (nextState[firstLevelKey] as any)[secondLevelKey].isLoading = false;
      (nextState[firstLevelKey] as any)[secondLevelKey].hasFetched = true;
      (nextState[firstLevelKey] as any)[secondLevelKey][
        thirdLevel
      ] = performanceReport;

      return nextState;
    });
  }

  catchCancellablePromises = (
    err: any,
    firstLevelKey: keyof DisplayCampaignPageState,
    secondLevelKey: string,
  ) => {
    if (!err.isCanceled) {
      log.error(err);
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        (nextState[firstLevelKey] as any)[secondLevelKey].isLoading = false;
        (nextState[firstLevelKey] as any)[secondLevelKey].hasFetched = true;
        (nextState[firstLevelKey] as any)[secondLevelKey].error = true;

        return nextState;
      });
    }
  };

  updateAd = (
    adId: string,
    body: Partial<AdResource>,
    undoBody?: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
  ): Promise<any> => {
    const { notifySuccess, notifyError, removeNotification } = this.props;

    const adAdGroup =
      this.state.ads.data.adAdGroup && this.state.ads.data.adAdGroup[adId];
    const campaignId = adAdGroup ? adAdGroup.campaign_id : undefined;
    const adGroupId = adAdGroup ? adAdGroup.ad_group_id : undefined;

    return campaignId && adGroupId
      ? this._displayCampaignService
          .updateAd(adId, campaignId, adGroupId, body)
          .then(response => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.ads.data.items[adId].status = response.data.status;
              return nextState;
            });
            if ((successMessage || errorMessage) && undoBody) {
              const uid = Math.random().toString();
              const undo = () => {
                this.updateAd(adId, undoBody).then(() => {
                  removeNotification(uid);
                });
              };

              if (successMessage) {
                notifySuccess({
                  uid,
                  message: successMessage.title,
                  description: successMessage.body,
                  btn: (
                    <Button type="primary" size="small" onClick={undo}>
                      <span>Undo</span>
                    </Button>
                  ),
                });
              }
            }

            return null;
          })
          .catch(error => {
            const errorMsg = errorMessage
              ? {
                  message: errorMessage.title,
                  description: errorMessage.body,
                }
              : undefined;
            notifyError(error, errorMsg);
            throw error;
          })
      : Promise.resolve();
  };

  updateAdGroup = (
    adGroupId: string,
    body: Partial<AdGroupResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdGroupResource>,
  ): Promise<any> => {
    const { notifySuccess, notifyError, removeNotification } = this.props;
    const {
      adGroups: {
        data: { adGroupCampaign },
      },
    } = this.state;
    const campaignId =
      adGroupCampaign && adGroupCampaign[adGroupId]
        ? adGroupCampaign[adGroupId].campaign_id
        : undefined;
    return campaignId
      ? this._displayCampaignService
          .updateAdGroup(campaignId, adGroupId, body)
          .then(response => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.adGroups.data.items[adGroupId] = response.data;
              return nextState;
            });

            if ((successMessage || errorMessage) && undoBody) {
              const undo = () => {
                this.updateAdGroup(adGroupId, undoBody).then(() => {
                  removeNotification(adGroupId);
                });
              };

              if (successMessage) {
                notifySuccess({
                  uid: parseInt(adGroupId, 0),
                  message: successMessage.title,
                  description: successMessage.body,
                  btn: (
                    <Button type="primary" size="small" onClick={undo}>
                      <span>Undo</span>
                    </Button>
                  ),
                });
              }
            }

            return null;
          })
          .catch(error => {
            const notifyErrorParams = errorMessage
              ? {
                  message: errorMessage.title,
                  description: errorMessage.body,
                }
              : undefined;
            notifyError(error, notifyErrorParams);
            throw error;
          })
      : Promise.resolve();
  };

  updateCampaign = (
    campaignId: string,
    body: object,
    errorMessage?: UpdateMessage,
  ): Promise<any> => {
    const { notifyError } = this.props;

    return this._displayCampaignService
      .updateCampaign(campaignId, body)
      .then(() =>
        this._displayCampaignService.getCampaignDisplayViewDeep(campaignId),
      )
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.campaign.data.items = [response.data];
          return nextState;
        });
      })
      .catch(error => {
        const notifyErrorParams = errorMessage
          ? {
              message: errorMessage.title,
              description: errorMessage.body,
            }
          : undefined;
        notifyError(error, notifyErrorParams);
      });
  };

  render() {
    const { campaign, adGroups, ads, goals } = this.state;

    const dashboardPerformance = {
      media: {
        items: campaign.mediaPerformance.items,
        isLoading: campaign.mediaPerformance.isLoading,
        isUpdating: false,
        isArchiving: false,
      },
      overall: {
        items: campaign.overallPerformance.items,
        isLoading: campaign.overallPerformance.isLoading,
        isUpdating: false,
        isArchiving: false,
      },
      campaign: {
        items: campaign.performance.items,
        isLoading: campaign.performance.isLoading,
        isUpdating: false,
        isArchiving: false,
      },
    };
    return (
      <DisplayCampaign
        updateAd={this.updateAd}
        updateAdGroup={this.updateAdGroup}
        updateCampaign={this.updateCampaign}
        campaign={campaign.data.items[0]}
        adGroups={adGroups}
        ads={ads}
        dashboardPerformance={dashboardPerformance}
        goals={goals.items}
      />
    );
  }
}

export default compose(
  withRouter,
  injectNotifications,
)(DisplayCampaignPage);
