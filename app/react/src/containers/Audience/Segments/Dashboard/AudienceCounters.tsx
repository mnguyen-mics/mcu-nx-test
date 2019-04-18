import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { CounterDashboard } from '../../../../components/Counter/index';
import { CounterProps } from '../../../../components/Counter/Counter';
import ReportService, { Filter } from '../../../../services/ReportService';
import { withRouter, RouteComponentProps } from 'react-router';
import { EditAudienceSegmentParam } from '../Edit/domain';
import { compareSearches } from '../../../../utils/LocationSearchHelper';
import { AudienceReport } from './constants';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';
import { McsIconType } from '../../../../components/McsIcon';
import messages from './messages';

export interface AudienceCountersProps {
  datamarts: DatamartWithMetricResource[];
  datamartId?: string;
}

interface State {
  counter: {
    report: AudienceReport;
    isLoading: boolean;
  };
}

type Props = AudienceCountersProps &
  InjectedIntlProps &
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
      [
        'user_points',
        'user_accounts',
        'emails',
        'desktop_cookie_ids',
        'mobile_ad_ids',
        'mobile_cookie_ids',
      ],
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

  getLoadingValue = (
    key:
      | 'user_points'
      | 'user_accounts'
      | 'emails'
      | 'desktop_cookie_ids'
      | 'mobile_ad_ids'
      | 'mobile_cookie_ids',
  ) => {
    const { counter } = this.state;
    const value =
      !counter.isLoading && counter.report && counter.report[0]
        ? counter.report[0][key]
        : undefined;
    return {
      value,
      loading: counter.isLoading,
    };
  };

  getCounters = () => {
    const { datamarts, datamartId, intl } = this.props;
    const counters: CounterProps[] = [];

    counters.push({
      iconType: 'full-users' as McsIconType,
      title: intl.formatMessage(messages.userPoints),
      ...this.getLoadingValue('user_points'),
    });
    if (datamartId) {
      const datamart = datamarts.find(dm => dm.id === datamartId);
      const otherMetrics =
        datamart && datamart.audience_segment_metrics
          ? datamart.audience_segment_metrics.map(el => {
              return {
                iconType: el.icon as McsIconType,
                title: el.display_name,
                ...this.getLoadingValue(el.technical_name),
              };
            })
          : [];
      return counters.concat(otherMetrics);
    } else {
      return counters;
    }
  };

  getKnownCounters = () => {
    const { datamarts, intl } = this.props;
    const counters =
      datamarts[0] && datamarts[0].audience_segment_metrics
        ? datamarts[0].audience_segment_metrics.map(el => {
            return {
              iconType: el.icon as McsIconType,
              title: el.display_name,
              ...this.getLoadingValue(el.technical_name),
            };
          })
        : [];
    return [
      {
        iconType: 'full-users' as McsIconType,
        title: intl.formatMessage(messages.userPoints),
        ...this.getLoadingValue('user_points'),
      },
    ].concat(counters);
  };

  render() {
    const { datamarts } = this.props;
    const getCounters = () => {
      return datamarts.length > 1
        ? this.getCounters()
        : this.getKnownCounters();
    };
    return (
      <div className="audience-statistic">
        <CounterDashboard counters={getCounters()} invertedColor={true} />
      </div>
    );
  }
}

export default injectIntl(withRouter(AudienceCounters));
