import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import CampaignDisplay from './CampaignDisplay';

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

class CampaignPage extends Component {

  constructor(props) {
    super(props);
    this.fetchAllData = this.fetchAllData.bind(this);
    this.updateAd = this.updateAd.bind(this);
    this.updateAdGroup = this.updateAdGroup.bind(this);
    this.updateCampaign = this.updateCampaign.bind(this);
    this.handleNotification = this.handleNotification.bind(this);
    this.state = {
      campaign: {
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
      adGroups: {
        items: {
          itemById: {},
          adGroupCampaign: {},
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

  fetchAllData(organisationId, campaignId, filter) {

    const dimensions = filter.lookbackWindow.asSeconds() > 172800 ? 'day' : 'day,hour_of_day';
    const getCampaignAdGoupAndAd = () => CampaignService.getCampaignDisplay(campaignId);
    const getCampaignPerf = () => ReportService.getSingleDisplayDeliveryReport(organisationId, campaignId, filter.from, filter.to, dimensions);
    const getAdGroupPerf = () => ReportService.getAdGroupDeliveryReport(organisationId, 'campaign_id', campaignId, filter.from, filter.to, '');
    const getAdPerf = () => ReportService.getAdDeliveryReport(organisationId, 'campaign_id', campaignId, filter.from, filter.to, '');
    const getMediaPerf = () => ReportService.getMediaDeliveryReport(organisationId, 'campaign_id', campaignId, filter.from, filter.to, '', '', { sort: '-clicks', limit: 30 });

    this.setState((prevState) => {
      const nextState = {
        ...prevState
      };
      nextState.campaign.items.isLoading = true;
      nextState.adGroups.items.isLoading = true;
      nextState.ads.items.isLoading = true;
      nextState.campaign.performance.isLoading = true;
      nextState.campaign.mediaPerformance.isLoading = true;
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
      const formattedAdGoups = adGroups.map(item => {
        const formatedItem = {
          ...item
        };
        delete formatedItem.ads;
        return formatedItem;
      });
      const adGroupCampaign = adGroups.map(item => {
        const newitem = {
          ad_group_id: item.id,
          campaign_id: campaign.id
        };
        return newitem;
      });
      const ads = [];
      const adAdGroup = [];
      data.ad_groups.forEach(adGroup => {
        adGroup.ads.forEach(ad => {
          ads.push(ad);
          adAdGroup.push({
            ad_id: ad.id,
            ad_group_id: adGroup.id,
            campaign_id: campaign.id
          });
        });
      });
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
        nextState.adGroups.items.itemById = normalizeArrayOfObject(formattedAdGoups, 'id');
        nextState.adGroups.items.adGroupCampaign = normalizeArrayOfObject(adGroupCampaign, 'ad_group_id');
        nextState.ads.items.itemById = normalizeArrayOfObject(ads, 'id');
        nextState.ads.items.adAdGroup = normalizeArrayOfObject(adAdGroup, 'ad_id');
        return nextState;
      });
    });
    getCampaignPerf().then(response => {
      this.setState((prevState) => {
        const nextState = {
          ...prevState
        };
        nextState.campaign.performance.isLoading = false;
        nextState.campaign.performance.hasFetched = true;
        nextState.campaign.performance.performance = normalizeReportView(response.data.report_view);
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
        nextState.adGroups.performance.performanceById = this.formatReportView(response.data.report_view, 'ad_group_id');
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
        nextState.campaign.mediaPerformance.isLoading = false;
        nextState.campaign.mediaPerformance.hasFetched = true;
        nextState.campaign.mediaPerformance.performance = normalizeReportView(response.data.report_view, 'media_id');
        return nextState;
      });
    });
  }

  handleNotification(type, message, undo = false, undoFunction) {
    const {
      addNotification
    } = this.props;
    if (undo) {
      addNotification({
        type: type,
        messageKey: message.title,
        descriptionKey: message.body,
        btn: (
          <Button type="primary" className="mcs-primary" size="small" onClick={undoFunction ? undoFunction : () => {}}>
            Undo
          </Button>
        )
      });
    } else {
      addNotification({
        type: type,
        messageKey: message.title,
        descriptionKey: message.body,
      });
    }
  }

  updateCampaign(campaignId, body, successMessage, errorMessage) {
    CampaignService.updateCampaignDisplay(campaignId, body).then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState
        };
        nextState.campaign.items.itemById = response.data;
      });
      this.handleNotification('success', successMessage);
    }).catch(() => {
      this.handleNotification('error', errorMessage);
    });
  }

  updateAdGroup(adGroupId, body, successMessage, errorMessage, undoBody) {
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.adGroups.items.itemById[adGroupId].status = body.status;
      return nextState;
    });
    CampaignService.updateAdGroup(this.state.adGroups.items.adGroupCampaign[adGroupId].campaign_id, adGroupId, body).then(response => {

      this.setState(prevState => {
        const nextState = {
          ...prevState
        };
        nextState.adGroups.items.itemById[adGroupId] = response.data;
      });
      if (successMessage || errorMessage) {
        const undo = () => {
          this.updateAdGroup(adGroupId, undoBody);
        };
        this.handleNotification('success', successMessage, true, undo);
      }
    }).catch(() => {
      this.handleNotification('error', errorMessage);
      this.setState(prevState => {
        const nextState = {
          ...prevState
        };
        nextState.adGroups.items.itemById[adGroupId].status = undoBody.status;
        return nextState;
      });
    });
  }

  updateAd(adId, body, successMessage, errorMessage, undoBody) {
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.ads.items.itemById[adId].status = body.status;
    });
    CampaignService.updateAd(adId, this.state.ads.items.adAdGroup[adId].campaign_id, this.state.ads.items.adAdGroup[adId].ad_group_id, body).then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState
        };
        nextState.ads.items.itemById[adId].status = response.data.status;
      });
      if (successMessage || errorMessage) {
        const undo = () => {
          this.updateAd(adId, undoBody);
        };
        this.handleNotification('success', successMessage, true, undo);
      }
    }).catch(() => {
      this.handleNotification('error', errorMessage);
      this.setState(prevState => {
        const nextState = {
          ...prevState
        };
        nextState.ads.items.itemById[adId].status = undoBody.status;
        return nextState;
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
          campaignId
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
      this.fetchAllData(organisationId, campaignId, filter);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          campaignId
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
          organisationId: nextOrganisationId
        }
      }
    } = nextProps;

    if (!compareSearchs(search, nextSearch) || campaignId !== nextCampaignId) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
        this.fetchAllData(nextOrganisationId, nextCampaignId, filter);
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
      isLoadingPerf: this.state.campaign.performance.isLoading,
      items: this.state.campaign.items.itemById,
    };

    const adGroups = {
      isLoadingList: this.state.adGroups.items.isLoading,
      isLoadingPerf: this.state.adGroups.performance.isLoading,
      items: this.formatListview(this.state.adGroups.items.itemById, this.state.adGroups.performance.performanceById),
    };

    const ads = {
      isLoadingList: this.state.ads.items.isLoading,
      isLoadingPerf: this.state.ads.performance.isLoading,
      items: this.formatListview(this.state.ads.items.itemById, this.state.ads.performance.performanceById),
    };

    const dashboardPerformance = {
      media: {
        isLoading: this.state.campaign.mediaPerformance.isLoading,
        hasFetched: this.state.campaign.mediaPerformance.hasFetched,
        items: this.state.campaign.mediaPerformance.performance
      },
      campaign: {
        isLoading: this.state.campaign.performance.isLoading,
        hasFetched: this.state.campaign.performance.hasFetched,
        items: this.state.campaign.performance.performance
      }
    };

    return (<CampaignDisplay
      updateAd={this.updateAd}
      updateAdGroup={this.updateAdGroup}
      updateCampaign={this.updateCampaign}
      campaign={campaign}
      adGroups={adGroups}
      ads={ads}
      dashboardPerformance={dashboardPerformance}
    />);
  }
}

CampaignPage.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  addNotification: PropTypes.func.isRequired,
};

CampaignPage = compose(
  withRouter,
  connect(
    undefined,
    {
      addNotification: NotificationActions.addNotification,
    }),
)(CampaignPage);

export default CampaignPage;
