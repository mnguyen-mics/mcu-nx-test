import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Button } from 'antd';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import AdGroup from './AdGroup';

import ReportService from '../../../../../services/ReportService.ts';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService.ts';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer.ts';
import { makeCancelable } from '../../../../../utils/ApiHelper.ts';
import {
  normalizeReportView,
} from '../../../../../utils/MetricHelper.ts';


import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';

import * as NotificationActions from '../../../../../state/Notifications/actions';

class AdGroupPage extends Component {

  cancelablePromises = [];

  constructor(props) {
    super(props);
    this.fetchAllData = this.fetchAllData.bind(this);
    this.updateAd = this.updateAd.bind(this);
    this.updateAdGroup = this.updateAdGroup.bind(this);
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
      },
      adGroups: {
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
        },
        performance: {
          performance: [],
          isLoading: false,
          hasFetched: false,
        },
        mediaPerformance: {
          performance: [],
          isLoading: false,
          hasFetched: false,
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
        },
      },
    };
  }

  formatReportView(reportView, key) {
    const format = normalizeReportView(reportView);
    return normalizeArrayOfObject(format, key);
  }

  fetchAllData(organisationId, campaignId, adGroupId, filter) {
    const lookbackWindow = filter.to.toMoment().unix() - filter.from.toMoment().unix();
    const dimensions = lookbackWindow.asSeconds() > 172800 ? 'day' : 'day,hour_of_day';
    const getCampaignAdGroupAndAd = () => DisplayCampaignService.getCampaignDisplayViewDeep(campaignId, { view: 'deep' });
    const getAdGroupPerf = makeCancelable(ReportService.getAdGroupDeliveryReport(organisationId, 'ad_group_id', adGroupId, filter.from, filter.to, dimensions));
    const getAdPerf = makeCancelable(ReportService.getAdDeliveryReport(organisationId, 'ad_group_id', adGroupId, filter.from, filter.to, ''));
    const getMediaPerf = makeCancelable(ReportService.getMediaDeliveryReport(organisationId, 'ad_group_id', adGroupId, filter.from, filter.to, '', '', { sort: '-clicks', limit: 30 }));
    const getOverallAdGroupPerf = makeCancelable(ReportService.getAdGroupDeliveryReport(
      organisationId,
      'ad_group_id',
      adGroupId,
      filter.from,
      filter.to,
      '',
      ['cpa', 'cpm', 'ctr', 'cpc', 'impressions_cost'],
    ));

    this.cancelablePromises.push(getAdGroupPerf, getAdPerf, getMediaPerf, getOverallAdGroupPerf);

    this.setState((prevState) => {
      const nextState = {
        ...prevState,
      };
      nextState.campaign.items.isLoading = true;
      nextState.adGroups.items.isLoading = true;
      nextState.ads.items.isLoading = true;
      nextState.adGroups.mediaPerformance.isLoading = true;
      nextState.adGroups.performance.isLoading = true;
      nextState.adGroups.overallPerformance.isLoading = true;
      nextState.ads.performance.isLoading = true;
      return nextState;
    });

    getCampaignAdGroupAndAd().then(reponse => {
      const data = reponse.data;
      const campaign = {
        ...data,
      };
      delete campaign.ad_groups;
      const adGroups = [...data.ad_groups];
      const adGroup = adGroups.filter(item => {
        return item.id === adGroupId;
      })[0];
      const ads = [...adGroup.ads];
      delete adGroup.ads;
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
        nextState.adGroups.items.itemById = adGroup;
        nextState.ads.items.itemById = normalizeArrayOfObject(ads, 'id');
        return nextState;
      });
    });

    getOverallAdGroupPerf.promise.then(response => {
      this.updateStateOnPerf('adGroups', 'overallPerformance', normalizeReportView(response.data.report_view));
    }).catch(this.catchCancellablePromises);

    getAdGroupPerf.promise.then(response => {
      this.updateStateOnPerf('adGroups', 'performance', normalizeReportView(response.data.report_view));
    }).catch(this.catchCancellablePromises);

    getAdPerf.promise.then(response => {
      this.updateStateOnPerf('ads', 'performance', this.formatReportView(response.data.report_view, 'ad_id'));
    }).catch(this.catchCancellablePromises);
    getMediaPerf.promise.then(response => {
      this.updateStateOnPerf('adGroups', 'mediaPerformance', normalizeReportView(response.data.report_view, 'media_id'));
    }).catch(this.catchCancellablePromises);
  }

  updateStateOnPerf(firstLevelKey, secondLevelKey, performanceReport) {
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
      };
      nextState[firstLevelKey][secondLevelKey].isLoading = false;
      nextState[firstLevelKey][secondLevelKey].hasFetched = true;
      nextState[firstLevelKey][secondLevelKey].performance = performanceReport;

      return nextState;
    });
  }

  catchCancellablePromises = (err) => {
    const {
      notifyError
    } = this.props;
    if (!err.isCanceled) {
      notifyError(err);
    }
  }

  updateAdGroup(adGroupId, body) {
    const {
      notifyError,
    } = this.props;
    DisplayCampaignService.updateAdGroup(this.state.campaign.items.itemById.id, adGroupId, body).then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.adGroups.items.itemById = response.data;
      });
    }).catch(error => {
      notifyError(error);
    });
  }

  updateAd(adId, body, successMessage, errorMessage, undoBody) {
    const {
      intl: { formatMessage },
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
    return DisplayCampaignService.updateAd(adId, this.state.campaign.items.itemById.id, this.state.adGroups.items.itemById.id, body).then(response => {
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
          btn: (<Button type="primary" size="small" onClick={undo} >
            <span>{formatMessage(messages.undo)}</span>
          </Button>),
        });

      }
      return null;
    }).catch(error => {
      notifyError(error, {
        message: messages.notificationError,
        description: messages.notificationErrorGeneric,
      });
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.ads.items.itemById[adId].status = undoBody.status;
      });
    });
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
          adGroupId,
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
      this.fetchAllData(organisationId, campaignId, adGroupId, filter);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
          campaignId,
          adGroupId,
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
          adGroupId: nextAdGroupId,
        },
      },
    } = nextProps;

    if (!compareSearches(search, nextSearch) || campaignId !== nextCampaignId || adGroupId !== nextAdGroupId || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
        this.fetchAllData(nextOrganisationId, nextCampaignId, nextAdGroupId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.cancelablePromises.forEach(promise => promise.cancel());
  }


  formatListview(a, b) {
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

  render() {

    const campaign = {
      isLoadingList: this.state.campaign.items.isLoading,
      items: this.state.campaign.items.itemById,
    };

    const adGroups = {
      isLoadingList: this.state.adGroups.items.isLoading,
      isLoadingPerf: this.state.adGroups.performance.isLoading,
      items: this.state.adGroups.items.itemById,
    };

    const ads = {
      isLoadingList: this.state.ads.items.isLoading,
      isLoadingPerf: this.state.ads.performance.isLoading,
      items: this.formatListview(this.state.ads.items.itemById, this.state.ads.performance.performanceById),
    };

    const dashboardPerformance = {
      media: {
        isLoading: this.state.adGroups.mediaPerformance.isLoading,
        hasFetched: this.state.adGroups.mediaPerformance.hasFetched,
        items: this.state.adGroups.mediaPerformance.performance,
      },
      adGroups: {
        isLoading: this.state.adGroups.performance.isLoading,
        hasFetched: this.state.adGroups.performance.hasFetched,
        items: this.state.adGroups.performance.performance,
      },
      overallPerformance: {
        isLoading: this.state.adGroups.overallPerformance.isLoading,
        hasFetched: this.state.adGroups.overallPerformance.hasFetched,
        items: this.state.adGroups.overallPerformance.performance,
      },
    };

    return (<AdGroup
      updateAd={this.updateAd}
      updateAdGroup={this.updateAdGroup}
      campaign={campaign}
      adGroups={adGroups}
      ads={ads}
      dashboardPerformance={dashboardPerformance}
    />);
  }
}

AdGroupPage.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  intl: intlShape.isRequired,
  notifyError: PropTypes.func.isRequired,
  notifySuccess: PropTypes.func.isRequired,
  removeNotification: PropTypes.func.isRequired,
};

AdGroupPage = compose(
  injectIntl,
  withRouter,
  connect(
    undefined,
    {
      notifyError: NotificationActions.notifyError,
      notifySuccess: NotificationActions.notifySuccess,
      removeNotification: NotificationActions.removeNotification,
    },
  ),
)(AdGroupPage);

export default AdGroupPage;
