import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import DisplayCampaign from './DisplayCampaign.tsx';

import ReportService from '../../../../../services/ReportService.ts';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService.ts';
import GoalService from '../../../../../services/GoalService.ts';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer.ts';
import { normalizeReportView } from '../../../../../utils/MetricHelper.ts';
import { makeCancelable } from '../../../../../utils/ApiHelper.ts';
import log from '../../../../../utils/Logger';

import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';

import * as NotificationActions from '../../../../../state/Notifications/actions';

class DisplayCampaignPage extends Component {

  cancelablePromises = []

  constructor(props) {
    super(props);

    this.state = {
      campaign: {
        items: {
          itemById: {},
          isLoading: false,
          isUpdating: false,
          isArchiving: false,
          hasItems: true,
          hasFetched: false,
        },
        overallPerformance: {
          performance: [],
          isLoading: false,
          hasFetched: false,
          error: false,
        },
        performance: {
          performance: [],
          isLoading: false,
          hasFetched: false,
          error: false,
        },
        mediaPerformance: {
          performance: [],
          isLoading: false,
          hasFetched: false,
          error: false,
        },
      },
      adGroups: {
        items: {
          itemById: {},
          adGroupCampaign: {},
          isLoading: false,
          isUpdating: false,
          isArchiving: false,
          hasItems: true,
          hasFetched: false,
        },
        performance: {
          performanceById: {},
          isLoading: false,
          hasFetched: false,
          error: false,
        },
      },
      ads: {
        items: {
          itemById: {},
          adAdGroup: {},
          isLoading: false,
          isUpdating: false,
          isArchiving: false,
          hasItems: true,
          hasFetched: false,
        },
        performance: {
          performanceById: {},
          isLoading: false,
          hasFetched: false,
          error: false,
        },
      },
      goals: {
        items: {
          itemById: [],
          isLoading: false,
          hasItems: true,
          hasFetched: false,
        },
        performance: {
          performanceById: {},
          isLoading: false,
          hasFetched: false,
          error: false,
        },
      }
    };
  }

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
    } = this.props;

    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
      });
    } else {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

      this.fetchAllData(organisationId, campaignId, filter);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          campaignId,
        },
      },
      history,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
      },
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
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

        this.fetchAllData(nextOrganisationId, nextCampaignId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.cancelablePromises.forEach(promise => promise.cancel());
  }

  fetchAllData = (organisationId, campaignId, filter) => {
    const lookbackWindow = filter.to.toMoment().unix() - filter.from.toMoment().unix();
    const dimensions = lookbackWindow > 172800 ? 'day' : 'day,hour_of_day';
    const getCampaignAdGroupAndAd = () => DisplayCampaignService.getCampaignDisplayViewDeep(campaignId, { view: 'deep' });
    const getCampaignPerf = makeCancelable(ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      dimensions,
    ));
    const getOverallCampaignPerf = makeCancelable(ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      undefined,
      ['cpa', 'cpm', 'ctr', 'cpc', 'impressions_cost'],
    ));
    const getAdGroupPerf = makeCancelable(ReportService.getAdGroupDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      undefined,
    ));
    const getAdPerf = makeCancelable(ReportService.getAdDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      undefined,
    ));
    const getMediaPerf = makeCancelable(ReportService.getMediaDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      undefined,
      undefined,
      { sort: '-clicks', limit: 30 },
    ));

    this.cancelablePromises.push(getCampaignPerf, getMediaPerf, getAdPerf, getAdGroupPerf, getOverallCampaignPerf, getOverallCampaignPerf);

    this.setState((prevState) => {
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

      const ads = [];
      const adAdGroup = [];

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

      this.setState((prevState) => {
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
        nextState.adGroups.items.itemById = normalizeArrayOfObject(formattedAdGroups, 'id');
        nextState.adGroups.items.adGroupCampaign = normalizeArrayOfObject(adGroupCampaign, 'ad_group_id');
        nextState.ads.items.itemById = normalizeArrayOfObject(ads, 'id');
        nextState.ads.items.adAdGroup = normalizeArrayOfObject(adAdGroup, 'ad_id');

        return nextState;
      });
    });

    DisplayCampaignService.getGoal(campaignId).then(goals => goals.data).then(goals => {
      const promises = goals.map(goal => {
        return GoalService.getAttributionModel(goal.goal_id).then(attribution => {
          return { ...goal, attribution: attribution.data };
        });
      });
      return Promise.all(promises);
    }).then(goals => {
      this.setState({
        goals: {
          items: {
            itemById: goals,
            isLoading: false,
            hasFetched: true,
            hasItems: true,
          }
        }
      });
    });

    getCampaignPerf.promise.then(response => {
      this.updateStateOnPerf('campaign', 'performance', 'performance', normalizeReportView(response.data.report_view));
    }).catch(err => this.catchCancellablePromises(err, 'campaign', 'performance'));

    getAdGroupPerf.promise.then(response => {
      this.updateStateOnPerf('adGroups', 'performance', 'performanceById', DisplayCampaignPage.formatReportView(
        response.data.report_view,
        'sub_campaign_id',
      ));
    }).catch(err => this.catchCancellablePromises(err, 'adGroups', 'performance'));

    getAdPerf.promise.then(response => {
      this.updateStateOnPerf('ads', 'performance', 'performanceById', DisplayCampaignPage.formatReportView(
        response.data.report_view,
        'message_id',
      ));
    }).catch(err => this.catchCancellablePromises(err, 'ads', 'performance'));

    getMediaPerf.promise.then(response => {
      const formattedReportView = {
        ...response.data.report_view
      };
      formattedReportView.rows = response.data.report_view.rows.splice(0, 30);
      this.updateStateOnPerf('campaign', 'mediaPerformance', 'performance', normalizeReportView(
        formattedReportView,
        'campaign_id',
      ));
    }).catch(err => this.catchCancellablePromises(err, 'campaign', 'mediaPerformance'));

    getOverallCampaignPerf.promise.then(response => {
      this.updateStateOnPerf('campaign', 'overallPerformance', 'performance', normalizeReportView(
        response.data.report_view,
        'campaign_id',
      ));
    }).catch(err => this.catchCancellablePromises(err, 'campaign', 'overallPerformance'));
  }

  updateStateOnPerf(firstLevelKey, secondLevelKey, thirdLevel, performanceReport) {
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
      };
      nextState[firstLevelKey][secondLevelKey].isLoading = false;
      nextState[firstLevelKey][secondLevelKey].hasFetched = true;
      nextState[firstLevelKey][secondLevelKey][thirdLevel] = performanceReport;

      return nextState;
    });
  }

  catchCancellablePromises = (err, firstLevelKey, secondLevelKey) => {

    if (!err.isCanceled) {
      log.error(err);
      this.setState((prevState) => {
        const nextState = {
          ...prevState,
        };
        nextState[firstLevelKey][secondLevelKey].isLoading = false;
        nextState[firstLevelKey][secondLevelKey].hasFetched = true;
        nextState[firstLevelKey][secondLevelKey].error = true;

        return nextState;
      });
    }
  }

  formatListView(a, b) {
    if (a) {
      return Object.keys(a).map((c) => {
        return {
          ...b[c],
          ...a[c],
        };
      });
    }
    return [];
  }

  static formatReportView(reportView, key) {
    const format = normalizeReportView(reportView);
    return normalizeArrayOfObject(format, key);
  }

  updateAd = (adId, body, successMessage, errorMessage, undoBody) => {
    const {
      notifySuccess,
      notifyError,
      removeNotification,
    } = this.props;

    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.ads.items.itemById[adId].status = body.status;
    });
    return DisplayCampaignService
      .updateAd(
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
        });
        if (successMessage || errorMessage) {
          const uid = Math.random();
          const undo = () => {
            this.updateAd(adId, undoBody).then(() => {
              removeNotification(uid);
            });
          };

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

        return null;
      })
      .catch(error => {
        notifyError(error, {
          message: errorMessage.title,
          description: errorMessage.body,
        });

        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.ads.items.itemById[adId].status = undoBody.status;

          return nextState;
        });
      });
  };

  updateAdGroup = (adGroupId, body, successMessage, errorMessage, undoBody) => {
    const {
      notifySuccess,
      notifyError,
      removeNotification,
    } = this.props;

    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.adGroups.items.itemById[adGroupId].status = body.status;
      return nextState;
    });
    return DisplayCampaignService
      .updateAdGroup(
        this.state.adGroups.items.adGroupCampaign[adGroupId].campaign_id,
        adGroupId,
        body,
      )
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.adGroups.items.itemById[adGroupId] = response.data;
        });

        if (successMessage || errorMessage) {
          const undo = () => {
            this.updateAdGroup(adGroupId, undoBody).then(() => {
              removeNotification(adGroupId);
            });
          };

          notifySuccess({
            uid: parseInt(adGroupId, 0),
            message: successMessage.title,
            description: successMessage.body,
            btn: (<Button type="primary" size="small" onClick={undo}>
              <span>Undo</span>
            </Button>),
          });
        }

        return null;
      })
      .catch(error => {
        notifyError(error, {
          message: errorMessage.title,
          description: errorMessage.body,
        });
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.adGroups.items.itemById[adGroupId].status = undoBody.status;

          return nextState;
        });
      });
  };

  updateCampaign = (campaignId, body, successMessage, errorMessage) => {
    const {
      notifyError,
    } = this.props;

    DisplayCampaignService.updateCampaign(campaignId, body)
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.campaign.items.itemById = response.data;
        });
      })
      .catch(error => {
        notifyError(error, {
          message: errorMessage.title,
          description: errorMessage.body,
        });
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
        items: this.state.campaign.mediaPerformance.performance
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
    return (<DisplayCampaign
      updateAd={this.updateAd}
      updateAdGroup={this.updateAdGroup}
      updateCampaign={this.updateCampaign}
      campaign={campaign}
      adGroups={adGroups}
      ads={ads}
      dashboardPerformance={dashboardPerformance}
      goals={goals}
    />);
  }
}

DisplayCampaignPage.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  notifySuccess: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  removeNotification: PropTypes.func.isRequired,
};

DisplayCampaignPage = compose(
  withRouter,
  connect(
    undefined,
    {
      notifyError: NotificationActions.notifyError,
      notifySuccess: NotificationActions.notifySuccess,
      removeNotification: NotificationActions.removeNotification,
    }),
)(DisplayCampaignPage);

export default DisplayCampaignPage;
