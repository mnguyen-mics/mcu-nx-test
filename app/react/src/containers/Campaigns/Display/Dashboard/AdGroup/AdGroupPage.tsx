import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Button } from 'antd';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import AdGroup from './AdGroup';
import ReportService from '../../../../../services/ReportService';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { makeCancelable } from '../../../../../utils/ApiHelper';
import log from '../../../../../utils/Logger';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  DateSearchSettings,
} from '../../../../../utils/LocationSearchHelper';
import * as NotificationActions from '../../../../../redux/Notifications/actions';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  initialAdGroupPageState,
  AdGroupPageState,
} from '../ProgrammaticCampaign/domain';
import { ReportView } from '../../../../../models/ReportView';
import { CancelablePromise } from '../../../../../services/ApiService';
import {
  AdGroupResource,
  AdResource,
} from '../../../../../models/campaign/display';
import { UpdateMessage } from '../ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{
    organisationId: string;
    campaignId: string;
    adGroupId: string;
  }>;

class AdGroupPage extends React.Component<Props, AdGroupPageState> {
  cancelablePromises: Array<CancelablePromise<any>> = [];

  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: Props) {
    super(props);
    this.updateAdGroup = this.updateAdGroup.bind(this);
    this.updateAd = this.updateAd.bind(this);
    this.state = initialAdGroupPageState;
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId, campaignId, adGroupId },
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
      this.fetchAllData(organisationId, campaignId, adGroupId, filter);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
      match: {
        params: { organisationId, campaignId, adGroupId },
      },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: {
          campaignId: previousCampaignId,
          organisationId: previousOrganisationId,
          adGroupId: previousAdGroupId,
        },
      },
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      campaignId !== previousCampaignId ||
      adGroupId !== previousAdGroupId ||
      organisationId !== previousOrganisationId
    ) {
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
        this.fetchAllData(
          organisationId,
          campaignId,
          adGroupId,
          filter,
        );
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

  fetchAllData(
    organisationId: string,
    campaignId: string,
    adGroupId: string,
    filter: DateSearchSettings,
  ) {
    const lookbackWindow =
      filter.to.toMoment().unix() - filter.from.toMoment().unix();
    const dimensions = lookbackWindow > 172800 ? ['day'] : ['day,hour_of_day'];
    const getCampaignAdGroupAndAd = () =>
      this._displayCampaignService.getCampaignDisplayViewDeep(campaignId, {
        view: 'deep',
      });
    const getAdGroupPerf = makeCancelable(
      ReportService.getAdGroupDeliveryReport(
        organisationId,
        'ad_group_id',
        adGroupId,
        filter.from,
        filter.to,
        dimensions,
      ),
    );
    const getAdPerf = makeCancelable(
      ReportService.getAdDeliveryReport(
        organisationId,
        'ad_group_id',
        adGroupId,
        filter.from,
        filter.to,
        undefined,
      ),
    );
    const getMediaPerf = makeCancelable(
      ReportService.getMediaDeliveryReport(
        organisationId,
        'ad_group_id',
        adGroupId,
        filter.from,
        filter.to,
        undefined,
        undefined,
        { sort: 'clicks', limit: 30 },
      ),
    );
    const getOverallAdGroupPerf = makeCancelable(
      ReportService.getAdGroupDeliveryReport(
        organisationId,
        'ad_group_id',
        adGroupId,
        filter.from,
        filter.to,
        undefined,
        ['cpa', 'cpm', 'ctr', 'cpc', 'impressions_cost'],
      ),
    );

    this.cancelablePromises.push(
      getAdGroupPerf,
      getAdPerf,
      getMediaPerf,
      getOverallAdGroupPerf,
    );

    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.campaign.data.isLoading = true;
      nextState.adGroups.data.isLoading = true;
      nextState.ads.data.isLoading = true;
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
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.campaign.data.isLoading = false;
        nextState.adGroups.data.isLoading = false;
        nextState.ads.data.isLoading = false;
        nextState.campaign.data.items = [campaign];
        nextState.adGroups.data.items = [adGroup];
        nextState.ads.data.items = normalizeArrayOfObject(ads, 'id');
        return nextState;
      });
    });

    getOverallAdGroupPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'adGroups',
          'overallPerformance',
          'items',
          normalizeReportView(response.data.report_view),
        );
      })
      .catch(err =>
        this.catchCancellablePromises(err, 'adGroups', 'overallPerformance'),
      );

    getAdGroupPerf.promise
      .then(response => {
        this.updateStateOnPerf(
          'adGroups',
          'performance',
          'items',
          normalizeReportView(response.data.report_view),
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
        const formattedResponse = {
          ...response.data.report_view,
        };
        formattedResponse.rows = formattedResponse.rows.splice(0, 30);
        this.updateStateOnPerf(
          'adGroups',
          'mediaPerformance',
          'items',
          normalizeReportView(formattedResponse),
        );
      })
      .catch(err =>
        this.catchCancellablePromises(err, 'adGroups', 'mediaPerformance'),
      );
  }

  // Ugly AF
  updateStateOnPerf(
    firstLevelKey: keyof AdGroupPageState,
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
    firstLevelKey: keyof AdGroupPageState,
    secondLevelKey: string,
  ) => {
    if (!err.isCanceled) {
      log.error(err);
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        (nextState[firstLevelKey] as any)[secondLevelKey].isLoading = false;
        (nextState[firstLevelKey] as any)[secondLevelKey].error = true;
        (nextState[firstLevelKey] as any)[secondLevelKey].hasFetched = true;

        return nextState;
      });
    }
  };

  updateAdGroup(adGroupId: string, body: Partial<AdGroupResource>) {
    const {
      campaign: {
        data: { items },
      },
    } = this.state;
    const campaignId = items && items[0] ? items[0].id : undefined;
    if (campaignId) {
      return this._displayCampaignService
        .updateAdGroup(campaignId, adGroupId, body)
        .then(response => {
          this.setState(prevState => {
            const nextState = {
              ...prevState,
            };
            nextState.adGroups.data.items = [response.data];
            return nextState;
          });
        })
        .catch(error => {
          this.props.notifyError(error);
        });
    }
    return Promise.resolve();
  }

  updateAd(
    adId: string,
    body: Partial<AdResource>,
    undoBody?: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
  ) {
    const {
      intl: { formatMessage },
      notifySuccess,
      notifyError,
      removeNotification,
    } = this.props;
    const { campaign, adGroups } = this.state;
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      if (body.status) nextState.ads.data.items[adId].status = body.status;
      return nextState;
    });
    if (
      campaign.data.items[0].id &&
      adGroups.data.items &&
      adGroups.data.items[0].id
    ) {
      return this._displayCampaignService
        .updateAd(
          adId,
          campaign.data.items[0].id,
          adGroups.data.items[0].id,
          body,
        )
        .then(response => {
          this.setState(prevState => {
            const nextState = {
              ...prevState,
            };
            nextState.ads.data.items[adId].status = response.data.status;
            return nextState;
          });
          if (successMessage && errorMessage && undoBody) {
            const uid = Math.random();
            const undo = () => {
              this.updateAd(adId, undoBody).then(() => {
                removeNotification(uid.toString());
              });
            };

            notifySuccess({
              uid,
              message: successMessage.title,
              description: successMessage.body,
              btn: (
                <Button type="primary" size="small" onClick={undo}>
                  <span>{formatMessage(messages.undo)}</span>
                </Button>
              ),
            });
          }
          return null;
        })
        .catch(error => {
          notifyError(error, {
            message: messages.notificationError,
            description: messages.notificationErrorGeneric,
          });
          this.setState(prevState => {
            const nextState = {
              ...prevState,
            };
            if (undoBody && undoBody.status)
              nextState.ads.data.items[adId].status = undoBody.status;
            return nextState;
          });
        });
    }
    return Promise.resolve();
  }

  render() {
    const { campaign, adGroups, ads } = this.state;

    const dashboardPerformance = {
      media: adGroups.mediaPerformance,
      adGroups: adGroups.performance,
      overallPerformance: adGroups.overallPerformance,
    };

    return (
      <AdGroup
        updateAd={this.updateAd}
        updateAdGroup={this.updateAdGroup}
        campaign={campaign}
        adGroups={adGroups}
        ads={ads}
        dashboardPerformance={dashboardPerformance}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(undefined, {
    notifyError: NotificationActions.notifyError,
    notifySuccess: NotificationActions.notifySuccess,
    removeNotification: NotificationActions.removeNotification,
  }),
)(AdGroupPage);
