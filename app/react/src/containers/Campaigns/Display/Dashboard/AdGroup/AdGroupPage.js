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

import ReportService from '../../../../../services/ReportService';
import CampaignService from '../../../../../services/CampaignService';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import {
  normalizeReportView,
} from '../../../../../utils/MetricHelper';


import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs,
} from '../../../../../utils/LocationSearchHelper';

import * as NotificationActions from '../../../../../state/Notifications/actions';

class AdGroupPage extends Component {

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
          hasFetched: false
        }
      },
      adGroups: {
        items: {
          itemById: {},
          isLoading: false,
          isUpdating: false,
          isArchiving: false,
          hasItems: true,
          hasFetched: false
        },
        performance: {
          performance: [],
          isLoading: false,
          hasFetched: false
        },
        mediaPerformance: {
          performance: [],
          isLoading: false,
          hasFetched: false
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
          hasFetched: false
        },
        performance: {
          performanceById: {},
          isLoading: false,
          hasFetched: false
        }
      }
    };
  }

  formatReportView(reportView, key) {
    const format = normalizeReportView(reportView);
    return normalizeArrayOfObject(format, key);
  }

  fetchAllData(organisationId, campaignId, adGroupId, filter) {
    const dimensions = filter.lookbackWindow.asSeconds() > 172800 ? 'day' : 'day,hour_of_day';
    const getCampaignAdGoupAndAd = () => CampaignService.getCampaignDisplay(campaignId);
    const getAdGroupPerf = () => ReportService.getAdGroupDeliveryReport(organisationId, 'ad_group_id', adGroupId, filter.from, filter.to, dimensions);
    const getAdPerf = () => ReportService.getAdDeliveryReport(organisationId, 'ad_group_id', adGroupId, filter.from, filter.to, '');
    const getMediaPerf = () => ReportService.getMediaDeliveryReport(organisationId, 'ad_group_id', adGroupId, filter.from, filter.to, '', '', { sort: '-clicks', limit: 30 });

    this.setState((prevState) => {
      const nextState = {
        ...prevState
      };
      nextState.campaign.items.isLoading = true;
      nextState.adGroups.items.isLoading = true;
      nextState.ads.items.isLoading = true;
      nextState.adGroups.mediaPerformance.isLoading = true;
      nextState.adGroups.performance.isLoading = true;
      nextState.ads.performance.isLoading = true;
      return nextState;
    });

    getCampaignAdGoupAndAd().then(reponse => {
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
          ...prevState
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
    getAdGroupPerf().then(response => {
      this.setState((prevState) => {
        const nextState = {
          ...prevState
        };
        nextState.adGroups.performance.isLoading = false;
        nextState.adGroups.performance.hasFetched = true;
        nextState.adGroups.performance.performance = normalizeReportView(response.data.report_view);
        return nextState;
      });
    });
    getAdPerf().then(response => {
      this.setState((prevState) => {
        const nextState = {
          ...prevState
        };
        nextState.ads.performance.isLoading = false;
        nextState.ads.performance.hasFetched = true;
        nextState.ads.performance.performanceById = this.formatReportView(response.data.report_view, 'ad_id');
        return nextState;
      });
    });
    getMediaPerf().then(response => {
      this.setState((prevState) => {
        const nextState = {
          ...prevState
        };
        nextState.adGroups.mediaPerformance.isLoading = false;
        nextState.adGroups.mediaPerformance.hasFetched = true;
        nextState.adGroups.mediaPerformance.performance = normalizeReportView(response.data.report_view, 'media_id');
        return nextState;
      });
    });
  }

  updateAdGroup(adGroupId, body) {
    const {
      notifyError
    } = this.props;
    CampaignService.updateAdGroup(this.state.campaign.items.itemById.id, adGroupId, body).then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState
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
      removeNotification
    } = this.props;
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.ads.items.itemById[adId].status = body.status;
    });
    return CampaignService.updateAd(adId, this.state.campaign.items.itemById.id, this.state.adGroups.items.itemById.id, body).then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState
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
          </Button>)
        });

      }
      return null;
    }).catch(error => {
      notifyError(error, {
        message: messages.notificationError,
        description: messages.notificationErrorGeneric
      });
      this.setState(prevState => {
        const nextState = {
          ...prevState
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
        pathname
      },
      match: {
        params: {
          organisationId,
          campaignId,
          adGroupId
        }
      },
    } = this.props;
    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)
      });
    } else {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      this.fetchAllData(organisationId, campaignId, adGroupId, filter);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          organisationId,
          campaignId,
          adGroupId
        }
      },
      history,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch
      },
      match: {
        params: {
          campaignId: nextCampaignId,
          organisationId: nextOrganisationId,
          adGroupId: nextAdGroupId
        }
      }
    } = nextProps;

    if (!compareSearchs(search, nextSearch) || campaignId !== nextCampaignId || adGroupId !== nextAdGroupId || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
        this.fetchAllData(nextOrganisationId, nextCampaignId, nextAdGroupId, filter);
      }
    }
  }

  formatListview(a, b) {
    if (a) {
      return Object.keys(a).map((c) => {
        return {
          ...b[c],
          ...a[c]
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
        items: this.state.adGroups.mediaPerformance.performance
      },
      adGroups: {
        isLoading: this.state.adGroups.performance.isLoading,
        hasFetched: this.state.adGroups.performance.hasFetched,
        items: this.state.adGroups.performance.performance
      }
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
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
      removeNotification: NotificationActions.removeNotification
    }
  ),
)(AdGroupPage);

export default AdGroupPage;
