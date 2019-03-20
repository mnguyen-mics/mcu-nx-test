import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { CounterDashboard } from '../../../../components/Counter/index';
import { CounterProps } from '../../../../components/Counter/Counter';
import ReportService, { Filter } from '../../../../services/ReportService';
import { withRouter, RouteComponentProps } from 'react-router';
import { EditAudienceSegmentParam } from '../Edit/domain';
import { compareSearches } from '../../../../utils/LocationSearchHelper';
import { AudienceReport } from './constants';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import {
  DatamartResource,
  AudienceSegmentMetricResource,
} from '../../../../models/datamart/DatamartResource';
import { McsIconType } from '../../../../components/McsIcon';

export interface AudienceCountersProps {
  datamart?: DatamartResource;
  audienceSegmentMetrics: AudienceSegmentMetricResource[];
}

interface State {
  counter: {
    report: AudienceReport;
    isLoading: boolean;
  };
}

type Props = AudienceCountersProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class AudienceCounters extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      counter: {
        isLoading: true,
        report: [],
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { segmentId, organisationId },
      },
    } = this.props;

    if (segmentId) {
      this.fetchCounterView(organisationId, [
        {
          name: 'audience_segment_id',
          value: segmentId,
        },
      ]);
    }
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
    } = nextProps;

    if (!compareSearches(search, nextSearch) || segmentId !== nextSegmentId) {
      this.fetchCounterView(nextOrganisationId, [
        {
          name: 'audience_segment_id',
          value: nextSegmentId,
        },
      ]);
    }
  }

  fetchCounterView = (organisationId: string, filters: Filter[]) => {
    this.setState({ counter: { ...this.state.counter, isLoading: true } });
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['day'],
      ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids'],
      filters,
    ).then(res =>
      this.setState({
        counter: {
          isLoading: false,
          report: normalizeReportView(res.data.report_view),
        },
      }),
    );
  };

  getCounters = () => {
    const { counter } = this.state;
    const { datamart, audienceSegmentMetrics } = this.props;
    const counters: CounterProps[] = [];
    const getLoadingValue = (
      key:
        | 'user_points'
        | 'user_accounts'
        | 'emails'
        | 'desktop_cookie_ids'
        | 'mobile_ad_ids'
        | 'mobile_cookie_ids'
        | 'user_point_additions'
        | 'user_point_deletions',
    ) => {
      const value =
        !counter.isLoading && counter.report && counter.report[0]
          ? counter.report[0][key]
          : undefined;
      return {
        value,
        loading: counter.isLoading,
      };
    };
    counters.push({
      iconType: 'full-users' as McsIconType,
      title: (
        <FormattedMessage
          id="audience-segment-dashboard-counters-user-points"
          defaultMessage="User Points"
        />
      ),
      ...getLoadingValue('user_points'),
    });

    if (datamart && datamart.storage_model_version === 'v201506') {
      const otherMetrics = [
        {
          iconType: 'users' as McsIconType,
          title: (
            <FormattedMessage
              id="audience-segment-dashboard-counters-user-accounts"
              defaultMessage="User Accounts"
            />
          ),
          ...getLoadingValue('user_accounts'),
        },
        {
          iconType: 'display' as McsIconType,
          title: (
            <FormattedMessage
              id="audience-segment-dashboard-counters-display-cookies"
              defaultMessage="Display Cookies"
            />
          ),
          ...getLoadingValue('desktop_cookie_ids'),
        },
        {
          iconType: 'email-inverted' as McsIconType,
          title: (
            <FormattedMessage
              id="audience-segment-dashboard-counters-emails"
              defaultMessage="Email"
            />
          ),
          ...getLoadingValue('emails'),
        },
      ];
      return counters.concat(otherMetrics);
    } else {
      if (audienceSegmentMetrics) {
        const otherMetrics = audienceSegmentMetrics.map(el => {
          return {
            iconType: el.icon as McsIconType,
            title: el.display_name,
            ...getLoadingValue(el.technical_name),
          };
        });
        return counters.concat(otherMetrics);
      }
      return counters;
    }
  };

  render() {
    const { datamart } = this.props;

    if (!datamart) {
      return (
        <div className="audience-statistic">
          <CounterDashboard
            counters={[
              {
                iconType: 'question',
                title: (
                  <FormattedMessage
                    id="audience-segment-dashboard-counters-loading"
                    defaultMessage="Loading"
                  />
                ),
                value: undefined,
                loading: true,
              },
            ]}
            invertedColor={true}
          />
        </div>
      );
    }

    return (
      <div className="audience-statistic">
        <CounterDashboard counters={this.getCounters()} invertedColor={true} />
      </div>
    );
  }
}

export default withRouter(AudienceCounters);
