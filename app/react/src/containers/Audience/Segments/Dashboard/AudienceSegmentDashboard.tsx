import * as React from 'react';
import { compose } from 'recompose';
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
import { AudienceSegmentResource } from '../../../../models/audiencesegment/AudienceSegmentResource';
import ReportService, { Filter } from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import {
  parseSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { SEGMENT_QUERY_SETTINGS, AudienceReport } from './constants';
import FeedCardList from './Feeds/FeedCardList';
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';
import { connect } from 'react-redux';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import * as SessionHelper from '../../../../state/Session/selectors';

interface State {
  loading: boolean;
  dashboard: {
    report: AudienceReport;
    isLoading: boolean;
  };
  datamarts: DatamartWithMetricResource[];
}

interface MapStateToProps {
  workspaces: {
    [key: string]: UserWorkspaceResource;
  };
}

export interface AudienceSegmentDashboardProps {
  segment?: AudienceSegmentResource;
  isLoading: boolean;
}

type Props = AudienceSegmentDashboardProps &
  InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class AudienceSegmentDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      dashboard: {
        isLoading: true,
        report: [],
      },
      datamarts: [],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      workspaces,
    } = this.props;
    const workspace = workspaces[organisationId];
    this.setState({
      datamarts: workspace ? workspace.datamarts : [],
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { segmentId },
      },
      location: { search },
    } = this.props;
    const {
      match: {
        params: {
          segmentId: nextSegmentId,
          organisationId: nextOrganisationId,
        },
      },
      location: { search: nextSearch },
      segment: nextSegment,
      workspaces: nextWorkspaces,
    } = nextProps;

    if (
      (!compareSearches(search, nextSearch) ||
        segmentId !== nextSegmentId ||
        nextWorkspaces) &&
      nextSegment
    ) {
      const nextFilters = parseSearch(nextSearch, SEGMENT_QUERY_SETTINGS);
      const metrics: string[] = ['user_points'];
      let additionalMetrics;
      if (nextWorkspaces) {
        const datamart = this.state.datamarts.find(
          dm => dm.id === nextSegment.datamart_id,
        );

        additionalMetrics = datamart && datamart.audience_segment_metrics
          ? datamart.audience_segment_metrics
              .filter(metric => metric.status === 'LIVE')
              .map(el => el.technical_name)
          : undefined;
      }
      this.fetchDashboardView(
        nextOrganisationId,
        nextFilters.from,
        nextFilters.to,
        [
          {
            name: 'audience_segment_id',
            value: nextSegmentId,
          },
        ],
        additionalMetrics ? metrics.concat(additionalMetrics) : metrics,
      );
    }
  }

  fetchDashboardView = (
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
          report: normalizeReportView(res.data.report_view),
        },
      }),
    );
  };

  buildItems = () => {
    const { intl, segment } = this.props;
    const { dashboard } = this.state;
    const items = [
      {
        title: intl.formatMessage(messages.overview),
        display: (
          <Overview
            isFetching={dashboard.isLoading}
            dataSource={dashboard.report}
          />
        ),
      },
      {
        title: intl.formatMessage(messages.additionDeletion),
        display: (
          <AdditionDeletion
            isFetching={dashboard.isLoading}
            dataSource={dashboard.report}
          />
        ),
      },
    ];
    if (segment) {
      items.push({
        title: intl.formatMessage(messages.overlap),
        display: <Overlap datamartId={segment.datamart_id} />,
      });
      if (segment.type === 'USER_LIST') {
        items.push({
          title: intl.formatMessage(messages.imports),
          display: <UserListImportCard datamartId={segment.datamart_id} />,
        });
      }
    }
    return items;
  };

  render() {
    const { datamarts } = this.state;
    const { segment } = this.props;
    return (
      <div>
        <AudienceCounters
          datamarts={datamarts}
          datamartId={segment ? segment.datamart_id : undefined}
        />
        <Card>
          <McsTabs items={this.buildItems()} />
        </Card>
        <FeedCardList />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspaces: SessionHelper.getWorkspaces(state),
});

export default compose<Props, AudienceSegmentDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
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
});
