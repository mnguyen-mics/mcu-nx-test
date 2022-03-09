import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Card, McsTabs, Loading } from '@mediarithmics-private/mcs-components-library';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { EditAudienceSegmentParam, isUserQuerySegment } from '../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import UserListImportCard from './UserListImportCard';
import { InjectedIntlProps, injectIntl, defineMessages, InjectedIntl } from 'react-intl';
import AudienceCounters from './AudienceCounters';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import ReportService, { Filter } from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import {
  parseSearch,
  compareSearches,
  isSearchValid,
  SearchSetting,
  buildDefaultSearch,
} from '../../../../utils/LocationSearchHelper';
import { SEGMENT_QUERY_SETTINGS, AudienceReport, AudienceReportData } from './constants';
import FeedCardList from './Feeds/FeedCardList';
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';
import AudienceSegmentExportsCard from './AudienceSegmentExportsCard';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IDashboardService } from '../../../../services/DashboardServices';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import DatamartUsersAnalyticsWrapper from '../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import {
  ecommerceEngagementConfig,
  averageSessionDurationConfig,
} from '../../DatamartUsersAnalytics/config/AnalyticsConfigJson';
import { Alert } from 'antd';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { DashboardPageWrapper, ITagService } from '@mediarithmics-private/advanced-components';
import DashboardWrapper from '../../Dashboard/DashboardWrapper';
import {
  DashboardPageContent,
  DataFileDashboardResource,
  DatamartUsersAnalyticsWrapperProps,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/old-dashboards-model';
import ContextualTargetingTab from './ContextualTargeting/ContextualTargetingTab';

interface State {
  loading: boolean;
  dashboard: {
    reports: AudienceReport;
    isLoading: boolean;
  };
  charts?: DataFileDashboardResource[];
  datamartAnalyticsDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
  apiDashboards: DashboardPageContent[];
}
export interface AudienceSegmentDashboardProps {
  segment?: AudienceSegmentShape;
  isLoading: boolean;
  datamarts: DatamartWithMetricResource[];
}

type Props = AudienceSegmentDashboardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedFeaturesProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class AudienceSegmentDashboard extends React.Component<Props, State> {
  @lazyInject(TYPES.IDashboardService)
  private _dashboardService: IDashboardService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      dashboard: {
        isLoading: true,
        reports: [],
      },
      apiDashboards: [],
      datamartAnalyticsDashboardConfig: [],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { segmentId, organisationId },
      },
      location: { search, pathname },
      segment,
      datamarts,
      history,
      hasFeature,
    } = this.props;
    if (
      !isSearchValid(search, this.getSearchSetting()) &&
      !hasFeature('audience-dashboards-datamart_users_analytics')
    ) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, this.getSearchSetting()),
      });
    }
    this.fetchDashboardView(search, organisationId, segmentId, datamarts, segment);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { segmentId, organisationId },
      },
      location: { search },
      datamarts,
      segment,
      intl,
    } = this.props;

    const {
      match: {
        params: { segmentId: previousSegmentId },
      },
      segment: prevSegment,
      location: { search: previousSearch },
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      segmentId !== previousSegmentId ||
      segment !== prevSegment
    ) {
      this.fetchDashboardView(search, organisationId, segmentId, datamarts, segment);
      if (segment && segment.datamart_id) {
        this.setState({
          datamartAnalyticsDashboardConfig: this.getDatamartAnaylicsDashboardConfig(
            organisationId,
            segment.datamart_id,
            intl,
          ),
        });
      }
    }
  }

  getSearchSetting(): SearchSetting[] {
    return [...SEGMENT_QUERY_SETTINGS];
  }

  fetchDashboardView = (
    search: string,
    organisationId: string,
    segmentId: string,
    datamarts: DatamartWithMetricResource[],
    segment?: AudienceSegmentShape,
  ) => {
    const nextFilters = parseSearch(search, SEGMENT_QUERY_SETTINGS);
    const metrics: string[] = ['user_points', 'user_point_additions', 'user_point_deletions'];
    let additionalMetrics;

    if (datamarts && segment) {
      const datamart = datamarts.find(dm => dm.id === segment.datamart_id);
      this.fetchDashboardChartView(organisationId, segment.datamart_id, segment.id);

      additionalMetrics =
        datamart && datamart.audience_segment_metrics
          ? datamart.audience_segment_metrics.map(el => el.technical_name)
          : undefined;
    }

    this.fetchAudienceSegmentReport(
      organisationId,
      nextFilters.from,
      nextFilters.to,
      [
        {
          name: 'audience_segment_id',
          value: segmentId,
        },
      ],
      additionalMetrics ? metrics.concat(additionalMetrics) : metrics,
    );
  };

  fetchDashboardChartView = (
    organisationId: string,
    selectedDatamartId: string,
    segmentId: string,
  ) => {
    this._dashboardService
      .getDataFileSegmentDashboards(organisationId, selectedDatamartId, segmentId)
      .then(d => {
        this.setState({ charts: d.data });
      })
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  fetchAudienceSegmentReport = (
    organisationId: string,
    from: McsMoment,
    to: McsMoment,
    filters: Filter[],
    metrics: string[],
  ) => {
    this.setState({ dashboard: { ...this.state.dashboard, isLoading: true } });

    return ReportService.getAudienceSegmentReport(
      organisationId,
      from,
      to,
      ['day'],
      metrics,
      filters,
    ).then(res =>
      this.setState({
        dashboard: {
          isLoading: false,
          reports: normalizeReportView<AudienceReportData>(res.data.report_view).filter(
            r => r.user_points !== undefined || r.user_points !== null,
          ),
        },
      }),
    );
  };

  isDatamartPionus = () => {
    const { datamarts, segment } = this.props;
    const datamartId = segment && segment.datamart_id;
    const datamart = datamartId && datamarts.find(d => d.id === datamartId);
    return datamart && datamart.storage_model_version !== 'v201506';
  };

  buildItems = () => {
    const { intl, segment, datamarts } = this.props;
    const { dashboard } = this.state;

    const items = [
      {
        title: intl.formatMessage(messages.overview),
        display: (
          <Overview
            isFetching={dashboard.isLoading}
            dataSource={dashboard.reports}
            datamarts={datamarts}
            datamartId={segment ? segment.datamart_id : undefined}
          />
        ),
      },
    ];
    if (!this.isDatamartPionus()) {
      items.push({
        title: intl.formatMessage(messages.additionDeletion),
        display: (
          <AdditionDeletion isFetching={dashboard.isLoading} dataSource={dashboard.reports} />
        ),
      });
    }
    if (segment) {
      items.push({
        title: intl.formatMessage(messages.overlap),
        display: <Overlap datamartId={segment.datamart_id} segment={segment} />,
      });
      if (segment.type === 'USER_LIST') {
        items.push({
          title: intl.formatMessage(messages.imports),
          display: <UserListImportCard datamartId={segment.datamart_id} segmentId={segment.id} />,
        });
      }
      if (
        segment.persisted &&
        this.isDatamartPionus() &&
        this.props.hasFeature('audience-segment_exports')
      ) {
        items.push({
          title: intl.formatMessage(messages.exports),
          display: (
            <AudienceSegmentExportsCard datamartId={segment.datamart_id} segmentId={segment.id} />
          ),
        });
      }
    }
    return items;
  };

  getDatamartAnaylicsDashboardConfig = (
    organisationId: string,
    datamartId: string,
    intl: InjectedIntl,
  ): DatamartUsersAnalyticsWrapperProps[] => {
    const config = [
      {
        title: 'Channel engagement',
        datamartId: datamartId,
        organisationId: organisationId,
        config: averageSessionDurationConfig,
        allUserFilter: false,
        showFilter: true,
      },
      {
        title: 'E-commerce engagement',
        datamartId: datamartId,
        organisationId: organisationId,
        config: ecommerceEngagementConfig,
      },
    ];

    return config;
  };

  render() {
    const {
      match: {
        params: { segmentId, organisationId },
      },
      intl,
      segment,
      datamarts,
      hasFeature,
    } = this.props;
    const { charts, datamartAnalyticsDashboardConfig } = this.state;

    if (!charts) return <Loading className='m-t-20' isFullScreen={true} />;

    const currentSegment = segment
      ? {
          key: segment.id.toString(),
          label: segment.name,
          value: segment.name,
        }
      : undefined;

    const datamart = segment && datamarts.find(d => d.id === segment.datamart_id);

    const fetchDataFileDashboards = () => {
      return new Promise<DataListResponse<DataFileDashboardResource>>((resolve, _) => {
        return resolve({
          status: 'ok',
          data: charts,
          count: charts.length,
        });
      });
    };

    const fetchApiDashboards = () => {
      return this._dashboardService.getDashboardsPageContents(
        organisationId,
        { archived: false },
        'segments',
        segmentId,
      );
    };

    const shouldDisplayAnalyticsFeature =
      charts.length === 0 &&
      hasFeature('audience-dashboards-datamart_users_analytics') &&
      datamart &&
      segment &&
      isUserQuerySegment(segment) &&
      segment.subtype !== 'AB_TESTING_EXPERIMENT';

    const handleOnShowDashboard = (dashboard: DashboardPageContent) => {
      if (dashboard.dashboardRegistrationId) {
        const stats = this._dashboardService.countDashboardsStats(dashboard);
        this._tagService.pushDashboardView(
          'home',
          dashboard.dashboardRegistrationId,
          dashboard.title,
          stats.numberCharts,
          stats.otqlQueries,
          stats.activitiesAnalyticsQueries,
          stats.collectionVolumesQueries,
          stats.datafileQueries,
        );
      }
    };

    return (
      <div>
        {segment && segment.paused && (
          <Alert
            className='m-b-20'
            message={intl.formatMessage(messages.pausedSegment)}
            type='warning'
          />
        )}
        {segment && <AudienceCounters datamarts={datamarts} segment={segment} />}
        {segment && (
          <DashboardPageWrapper
            fetchApiDashboards={fetchApiDashboards}
            fetchDataFileDashboards={fetchDataFileDashboards}
            datamartId={segment?.datamart_id}
            organisationId={organisationId}
            datamartAnalyticsConfig={
              shouldDisplayAnalyticsFeature ? datamartAnalyticsDashboardConfig : []
            }
            source={segment}
            defaultSegment={currentSegment}
            tabsClassname='m-t-30'
            isFullScreenLoading={false}
            disableAllUserFilter={true}
            segmentDashboardTechnicalInformation={
              <div>
                <Card className='mcs-audienceSegmentDashboard_technical_information'>
                  <McsTabs items={this.buildItems()} />
                </Card>
                <FeedCardList />
              </div>
            }
            DatamartUsersAnalyticsWrapper={DatamartUsersAnalyticsWrapper}
            DashboardWrapper={DashboardWrapper}
            contextualTargetingTab={
              hasFeature('segments-contextual-targeting') ? (
                <ContextualTargetingTab datamartId={segment.datamart_id} segmentId={segment.id} />
              ) : undefined
            }
            onShowDashboard={handleOnShowDashboard}
          />
        )}
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
)(AudienceSegmentDashboard);

const messages = defineMessages({
  overview: {
    id: 'audience.segment.dashboard.tab-title.overview',
    defaultMessage: 'Overview',
  },
  additionDeletion: {
    id: 'audience.segment.dashboard.tab-title.addition-deletion',
    defaultMessage: 'Addition Deletion',
  },
  overlap: {
    id: 'audience.segment.dashboard.tab-title.overlap',
    defaultMessage: 'Overlap',
  },
  imports: {
    id: 'audience.segment.dashboard.tab-title.user-list-imports',
    defaultMessage: 'Imports Status',
  },
  exports: {
    id: 'audience.segment.dashboard.tab-title.exports',
    defaultMessage: 'Exports',
  },
  contextualTargeting: {
    id: 'audience.segment.dashboard.tab-title.contextualTargeting',
    defaultMessage: 'Contextual Targeting',
  },
  pausedSegment: {
    id: 'audience.segment.dashboard.warning-paused-segment',
    defaultMessage:
      "Warning: This segment has been paused and is no longer refreshed (statistics, user insertions and deletions won't be computed).",
  },
});
