import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { Button } from 'antd';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import DisplayCampaign from './DisplayCampaign';

import ReportService from '../../../../../services/ReportService';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import GoalService from '../../../../../services/GoalService';
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

import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { initialPageState, DisplayCampaignPageState, GoalsCampaignRessource } from './domain';
import { CancelablePromise } from '../../../../../services/ApiService';
import { AdInfoResource, AdResource, AdGroupResource } from '../../../../../models/campaign/display';
import { ReportView } from '../../../../../models/ReportView';
import { UpdateMessage } from './DisplayCampaignAdGroupTable';
import { Index } from '../../../../../utils';


type Props = RouteComponentProps<{ organisationId: string, campaignId: string }> & InjectedNotificationProps

class DisplayCampaignPage extends React.Component<Props, DisplayCampaignPageState> {
  cancelablePromises: Array<CancelablePromise<any>> = [];

  constructor(props: Props) {
    super(props);

    this.state = initialPageState;
  }

  formatReportView(reportView: ReportView, key: string) {
    const format = normalizeReportView(reportView);
    return normalizeArrayOfObject(format, key);
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId, campaignId } },
    } = this.props;

    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
      });
    } else {
      const filter = parseSearch<DateSearchSettings>(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

      this.fetchAllData(organisationId, campaignId, filter);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      match: { params: { campaignId } },
      history,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch },
      match: {
        params: {
          campaignId: nextCampaignId,
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    if (!compareSearches(search, nextSearch) || campaignId !== nextCampaignId) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            DISPLAY_DASHBOARD_SEARCH_SETTINGS,
          ),
        });
      } else {
        const filter = parseSearch<DateSearchSettings>(
          nextSearch,
          DISPLAY_DASHBOARD_SEARCH_SETTINGS,
        );

        this.fetchAllData(nextOrganisationId, nextCampaignId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.cancelablePromises.forEach(promise => promise.cancel());
  }

  fetchAllData = (organisationId: string, campaignId: string, filter: DateSearchSettings) => {
    const lookbackWindow =
      filter.to.toMoment().unix() - filter.from.toMoment().unix();
    const dimensions = lookbackWindow > 172800 ? ['day'] : ['day,hour_of_day'];
    const getCampaignAdGroupAndAd = () =>
      DisplayCampaignService.getCampaignDisplayViewDeep(campaignId, {
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

      nextState.campaign.items.isLoading = true;
      nextState.adGroups.items.isLoading = true;
      nextState.ads.items.isLoading = true;
      nextState.campaign.performance.isLoading = true;
      nextState.campaign.mediaPerformance.isLoading = true;
      nextState.campaign.overallPerformance.isLoading = true;
      nextState.adGroups.performance.isLoading = true;
      nextState.ads.performance.isLoading = true;
      nextState.goals.items.isLoading = true;

      return nextState;
    });

    getCampaignAdGroupAndAd().then(response => {
      const data = response.data;
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

      const adGroupCampaign = adGroups.map(item => {
        return {
          ad_group_id: item.id,
          campaign_id: campaign.id,
        };
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

      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };

        nextState.campaign.items.isLoading = false;
        nextState.adGroups.items.isLoading = false;
        nextState.ads.items.isLoading = false;

        nextState.campaign.items.hasFetched = true;
        nextState.adGroups.items.hasFetched = true;
        nextState.ads.items.hasFetched = true;

        nextState.campaign.items.itemById = campaign;
        nextState.adGroups.items.itemById = normalizeArrayOfObject(
          formattedAdGroups,
          'id',
        );
        nextState.adGroups.items.adGroupCampaign = normalizeArrayOfObject(
          adGroupCampaign,
          'ad_group_id',
        );
        nextState.ads.items.itemById = normalizeArrayOfObject(ads, 'id');
        nextState.ads.items.adAdGroup = normalizeArrayOfObject(
          adAdGroup,
          'ad_id',
        );

        return nextState;
      });
    });

    DisplayCampaignService.getGoals(campaignId)
      .then(goals => goals.data)
      .then(goals => {
        const promises = goals.map(goal => {
          return GoalService.getAttributionModels(goal.goal_id).then(
            attribution => {
              const goalCampaign: GoalsCampaignRessource = { ...goal, attribution: attribution.data };
              return goalCampaign;
            },
          );
        });
        return Promise.all(promises);
      })
      .then(goals => {
        this.setState({
          goals: {
            items: {
              itemById: goals,
              isLoading: false,
              hasFetched: true,
              hasItems: true,
            },
          },
        });
      });

    getCampaignPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'campaign',
          'performance',
          'performance',
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
          'performanceById',
          this.formatReportView(
            response.data.report_view,
            'sub_campaign_id',
          ),
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
          'performanceById',
          this.formatReportView(
            response.data.report_view,
            'message_id',
          ),
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
          'performance',
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
          'performance',
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
      (nextState[firstLevelKey] as any)[secondLevelKey][thirdLevel] = performanceReport;

      return nextState;
    });
  }

  catchCancellablePromises = (err: any, firstLevelKey: keyof DisplayCampaignPageState, secondLevelKey: string) => {
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

  formatListView(a: Index<any>, b: Index<any>) {
    if (a) {
      return Object.keys(a).map(c => {
        return {
          ...b[c],
          ...a[c],
        };
      });
    }
    return [];
  }

  updateAd = (adId: string, body: Partial<AdResource>, successMessage?: UpdateMessage, errorMessage?: UpdateMessage, undoBody?: Partial<AdResource>): Promise<any> => {
    const { notifySuccess, notifyError, removeNotification } = this.props;

    return DisplayCampaignService.updateAd(
      adId,
      this.state.ads.items.adAdGroup[adId].campaign_id,
      this.state.ads.items.adAdGroup[adId].ad_group_id,
      body,
    )
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.ads.items.itemById[adId].status = response.data.status;
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
      });
  };

  updateAdGroup = (adGroupId: string, body: Partial<AdGroupResource>, successMessage?: UpdateMessage, errorMessage?: UpdateMessage, undoBody?: Partial<AdGroupResource>): Promise<any> => {
    const { notifySuccess, notifyError, removeNotification } = this.props;

    return DisplayCampaignService.updateAdGroup(
      (this.state.adGroups.items.adGroupCampaign as any)[adGroupId].campaign_id,
      adGroupId,
      body,
    )
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.adGroups.items.itemById[adGroupId] = response.data;
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
      });
  };

  updateCampaign = (campaignId: string, body: object, errorMessage?: UpdateMessage): Promise<any> => {
    const { notifyError } = this.props;

    return DisplayCampaignService.updateCampaign(campaignId, body)
      .then(response => DisplayCampaignService.getCampaignDisplayViewDeep(campaignId))
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.campaign.items.itemById = response.data;
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
    const campaign = {
      isLoadingList: this.state.campaign.items.isLoading,
      isLoadingPerf: this.state.campaign.performance.isLoading,
      items: this.state.campaign.items.itemById,
    };

    const adGroups = {
      isLoadingList: this.state.adGroups.items.isLoading,
      isLoadingPerf: this.state.adGroups.performance.isLoading,
      items: this.formatListView(
        this.state.adGroups.items.itemById,
        this.state.adGroups.performance.performanceById,
      ),
    };

    const ads = {
      isLoadingList: this.state.ads.items.isLoading,
      isLoadingPerf: this.state.ads.performance.isLoading,
      items: this.formatListView(
        this.state.ads.items.itemById,
        this.state.ads.performance.performanceById,
      ),
    };

    const goals = this.state.goals.items.itemById;

    const dashboardPerformance = {
      media: {
        isLoading: this.state.campaign.mediaPerformance.isLoading,
        hasFetched: this.state.campaign.mediaPerformance.hasFetched,
        items: this.state.campaign.mediaPerformance.performance,
      },
      overall: {
        isLoading: this.state.campaign.overallPerformance.isLoading,
        hasFetched: this.state.campaign.overallPerformance.hasFetched,
        items: this.state.campaign.overallPerformance.performance,
      },
      campaign: {
        isLoading: this.state.campaign.performance.isLoading,
        hasFetched: this.state.campaign.performance.hasFetched,
        items: this.state.campaign.performance.performance,
      },
    };
    return (
      <DisplayCampaign
        updateAd={this.updateAd}
        updateAdGroup={this.updateAdGroup}
        updateCampaign={this.updateCampaign}
        campaign={campaign}
        adGroups={adGroups}
        ads={ads}
        dashboardPerformance={dashboardPerformance}
        goals={goals}
      />
    );
  }
}


export default compose(
  withRouter,
  injectNotifications
)(DisplayCampaignPage);
