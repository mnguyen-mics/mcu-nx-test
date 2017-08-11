import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import DisplayCampaign from './DisplayCampaign';

import ReportService from '../../../../../services/ReportService';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
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

    if (!compareSearchs(search, nextSearch) || campaignId !== nextCampaignId) {
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

  fetchAllData = (organisationId, campaignId, filter) => {
    const dimensions = filter.lookbackWindow.asSeconds() > 172800 ? 'day' : 'day,hour_of_day';
    const getCampaignAdGroupAndAd = () => DisplayCampaignService.getCampaign(campaignId);
    const getCampaignPerf = () => ReportService.getSingleDisplayDeliveryReport(
      organisationId,
      campaignId,
      filter.from,
      filter.to,
      dimensions,
    );
    const getAdGroupPerf = () => ReportService.getAdGroupDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
    );
    const getAdPerf = () => ReportService.getAdDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
    );
    const getMediaPerf = () => ReportService.getMediaDeliveryReport(
      organisationId,
      'campaign_id',
      campaignId,
      filter.from,
      filter.to,
      '',
      '',
      { sort: '-clicks', limit: 30 },
    );

    this.setState((prevState) => {
      const nextState = {
        ...prevState,
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

    getCampaignPerf().then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };

        nextState.campaign.performance.isLoading = false;
        nextState.campaign.performance.hasFetched = true;
        nextState.campaign.performance.performance = normalizeReportView(response.data.report_view);

        return nextState;
      });
    });

    getAdGroupPerf().then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };

        nextState.adGroups.performance.isLoading = false;
        nextState.adGroups.performance.hasFetched = true;
        nextState.adGroups.performance.performanceById = CampaignPage.formatReportView(
          response.data.report_view,
          'ad_group_id',
        );
        return nextState;
      });
    });

    getAdPerf().then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };

        nextState.ads.performance.isLoading = false;
        nextState.ads.performance.hasFetched = true;
        nextState.ads.performance.performanceById = CampaignPage.formatReportView(
          response.data.report_view,
          'ad_id',
        );
        return nextState;
      });
    });

    getMediaPerf().then(response => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };

        nextState.campaign.mediaPerformance.isLoading = false;
        nextState.campaign.mediaPerformance.hasFetched = true;
        nextState.campaign.mediaPerformance.performance = normalizeReportView(
          response.data.report_view
        );

        return nextState;
      });
    });
  };

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

    const dashboardPerformance = {
      media: {
        isLoading: this.state.campaign.mediaPerformance.isLoading,
        hasFetched: this.state.campaign.mediaPerformance.hasFetched,
        items: this.state.campaign.mediaPerformance.performance
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
      />
    );
  }
}

CampaignPage.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  notifySuccess: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  removeNotification: PropTypes.func.isRequired,
};

CampaignPage = compose(
  withRouter,
  connect(
    undefined,
    {
      notifyError: NotificationActions.notifyError,
      notifySuccess: NotificationActions.notifySuccess,
      removeNotification: NotificationActions.removeNotification,
    }),
)(CampaignPage);

export default CampaignPage;
