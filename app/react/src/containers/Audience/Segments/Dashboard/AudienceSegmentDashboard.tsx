import * as React from 'react';
import { compose } from 'recompose';
import _ from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router';
import { Card } from '../../../../components/Card';
import McsTabs from '../../../../components/McsTabs';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { EditAudienceSegmentParam } from '../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import UserListImportCard from './UserListImportCard';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import AudienceCounters from './AudienceCounters';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import ReportService, { Filter } from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import {
  parseSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import {
  SEGMENT_QUERY_SETTINGS,
  AudienceReport,
  AudienceReportData,
} from './constants';
import FeedCardList from './Feeds/FeedCardList';
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';
import AudienceSegmentExportsCard from './AudienceSegmentExportsCard';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IDashboardService } from '../../../../services/DashboardServices';
import { DashboardResource } from '../../../../models/dashboards/dashboards';
import DashboardWrapper from '../../Dashboard/DashboardWrapper';
import ContentHeader from '../../../../components/ContentHeader';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';

interface State {
  loading: boolean;
  dashboard: {
    reports: AudienceReport;
    isLoading: boolean;
  };
  charts: DashboardResource[];
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

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      dashboard: {
        isLoading: true,
        reports: [],
      },
      charts: [],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      segment,
      datamarts,
    } = this.props;
    if (segment) {
      this.fetchDashboardView(search, organisationId, segment, datamarts);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      datamarts,
      segment,
    } = this.props;

    const {
      segment: prevSegment,
      location: { search: previousSearch },
    } = previousProps;

    if (
      (!compareSearches(search, previousSearch) ||
        !_.isEqual(segment, prevSegment)) &&
      segment
    ) {
      this.fetchDashboardView(search, organisationId, segment, datamarts);
    }
  }

  fetchDashboardView = (
    search: string,
    organisationId: string,
    segment: AudienceSegmentShape,
    datamarts: DatamartWithMetricResource[],
  ) => {
    const nextFilters = parseSearch(search, SEGMENT_QUERY_SETTINGS);
    const metrics: string[] = [
      'user_points',
      'user_point_additions',
      'user_point_deletions',
    ];
    let additionalMetrics;

    if (datamarts) {
      const datamart = datamarts.find(dm => dm.id === segment.datamart_id);
      this.fetchDashboardChartView(segment.datamart_id);

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
          value: segment.id,
        },
      ],
      additionalMetrics ? metrics.concat(additionalMetrics) : metrics,
    );
  };

  fetchDashboardChartView = (selectedDatamartId: string) => {
    this._dashboardService
      .getDashboards(selectedDatamartId, {
        type: 'SEGMENT',
      })
      .then(d => {
        return d.data;
      })
      .then(d => {
        this.setState({ charts: d });
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
          reports: normalizeReportView<AudienceReportData>(
            res.data.report_view,
          ).filter(r => r.user_points !== undefined || r.user_points !== null),
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
          <AdditionDeletion
            isFetching={dashboard.isLoading}
            dataSource={dashboard.reports}
          />
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
          display: (
            <UserListImportCard
              datamartId={segment.datamart_id}
              segmentId={segment.id}
            />
          ),
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
            <AudienceSegmentExportsCard
              datamartId={segment.datamart_id}
              segmentId={segment.id}
            />
          ),
        });
      }
    }
    return items;
  };

  render() {
    const { segment, datamarts } = this.props;
    const { charts } = this.state;
    return (
      <div>
        {segment && (
          <AudienceCounters datamarts={datamarts} segment={segment} />
        )}
        {charts.map(c => (
          <DashboardWrapper
            key={c.id}
            layout={c.components}
            title={c.name}
            datamartId={c.datamart_id}
            segment={segment}
          />
        ))}
        {charts.length ? (
          <ContentHeader size="medium" title="Technical Informations" />
        ) : null}
        <Card>
          <McsTabs items={this.buildItems()} />
        </Card>
        <FeedCardList />
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
    id: 'audience-segment-dashboard-tab-title-overview',
    defaultMessage: 'Overview',
  },
  additionDeletion: {
    id: 'audience-segment-dashboard-tab-title-addition-deletion',
    defaultMessage: 'Addition Deletion',
  },
  overlap: {
    id: 'audience-segment-dashboard-tab-title-overlap',
    defaultMessage: 'Overlap',
  },
  imports: {
    id: 'audience-segment-dashboard-tab-title-user-list-imports',
    defaultMessage: 'Imports Status',
  },
  exports: {
    id: 'audience-segment-dashboard-tab-title-exports',
    defaultMessage: 'Exports',
  },
});
