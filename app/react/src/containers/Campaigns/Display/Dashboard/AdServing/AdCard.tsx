import * as React from 'react';
import { Row, Col } from 'antd';
import { Card } from '../../../../../components/Card';
import { AdInfoResource } from '../../../../../models/campaign/display';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';
import {
  updateSearch,
  parseSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  EmptyCharts,
  LoadingChart,
} from '../../../../../components/EmptyCharts';
import McsMoment from '../../../../../utils/McsMoment';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { LegendChart } from '../../../../../components/LegendChart';
import ReportService from '../../../../../services/ReportService';
import { makeCancelable } from '../../../../../utils/ApiHelper';
import { CancelablePromise } from '../../../../../services/ApiService';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { Index } from '../../../../../utils';
import DoubleStackedAreaPlot from '../../../../../components/Charts/TimeBased/DoubleStackedAreaPlot';

const LegendChartTS = LegendChart as any;

export interface AdCardProps {
  ad: AdInfoResource;
  adGroupId: string;
}

interface Stats {
  impressions: string;
  clicks: string;
}

interface State {
  dataSource: Stats[];
  loading: boolean;
}

type Props = AdCardProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  InjectedIntlProps &
  InjectedThemeColorsProps;

class AdCard extends React.Component<Props, State> {
  cancelablePromises: Array<CancelablePromise<any>> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      dataSource: [],
      loading: true,
    };
  }

  componentDidMount() {
    const {
      ad,
      match: {
        params: { organisationId, campaignId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    this.fetchData(
      organisationId,
      ad.creative_id,
      filter.from,
      filter.to,
      campaignId,
    );
  }

  componentDidUpdate(previousProps: Props) {
    const {
      ad,
      match: {
        params: { organisationId, campaignId },
      },
      location: { search },
    } = this.props;
    const {
      ad: previousAd,
      match: {
        params: {
          organisationId: previousOrganisationId,
          campaignId: previousCampaignId,
        },
      },
      location: { search: previousSearch },
    } = previousProps;
    if (
      ad.id !== previousAd.id ||
      organisationId !== previousOrganisationId ||
      !compareSearches(search, previousSearch) ||
      campaignId !== previousCampaignId
    ) {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      this.fetchData(
        organisationId,
        ad.creative_id,
        filter.from,
        filter.to,
        campaignId,
      );
    }
  }

  filterValueForCampaign = (
    normalizedReport: Index<any>,
    campaignId: string,
  ) => {
    return normalizedReport.filter(
      (item: any) => item.campaign_id === campaignId,
    );
  };

  fetchData = (
    organisationId: string,
    creativeId: string,
    from: McsMoment,
    to: McsMoment,
    campaignId: string,
  ) => {
    const { adGroupId } = this.props;
    const lookbackWindow = to.toMoment().unix() - from.toMoment().unix();
    const dimensions =
      lookbackWindow > 172800
        ? ['day', 'campaign_id']
        : ['day,hour_of_day', 'campaign_id'];
    const getAdPerf = makeCancelable(
      ReportService.getAdDeliveryReport(
        organisationId,
        'creative_id',
        creativeId,
        from,
        to,
        dimensions,
        undefined,
        {
          campaign_id: campaignId,
          ad_group_id: adGroupId,
        },
      ),
    );
    this.cancelablePromises.push(getAdPerf);
    this.setState({ loading: true });
    getAdPerf.promise
      .then(res =>
        this.filterValueForCampaign(
          normalizeReportView(res.data.report_view),
          campaignId,
        ),
      )
      .then(res => {
        const t = res as any;
        this.setState({
          loading: false,
          dataSource: t,
        });
      });
  };

  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DISPLAY_DASHBOARD_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      location: { search },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  createLegend() {
    const {
      intl: { formatMessage },
    } = this.props;
    const legends = [
      {
        key: 'impressions',
        domain: formatMessage(messages.impressions),
      },
      {
        key: 'clicks',
        domain: formatMessage(messages.clicks),
      },
    ];

    return legends;
  }

  renderChart() {
    const { colors } = this.props;
    const { dataSource } = this.state;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'clicks', message: messages.clicks },
        { key: 'impressions', message: messages.impressions },
      ],
      colors: [colors['mcs-warning'], colors['mcs-info']],
      isDraggable: true,
      onDragEnd: (values: string[]) => {
        this.updateLocationSearch({
          from: new McsMoment(values[0]),
          to: new McsMoment(values[1]),
        });
      },
    };

    return (
      <div style={{ display: 'flex' }}>
        <DoubleStackedAreaPlot
          dataset={dataSource as any}
          options={optionsForChart}
          style={{ flex: '1' }}
        />
      </div>
    );
  }

  public render() {
    const {
      ad,
      intl: { formatMessage },
      colors,
    } = this.props;
    const { dataSource, loading } = this.state;
    const title = ad.name;

    const legendOptions = [
      {
        key: 'clicks',
        domain: formatMessage(messages.clicks),
        color: colors['mcs-warning'],
      },
      {
        key: 'impressions',
        domain: formatMessage(messages.impressions),
        color: colors['mcs-info'],
      },
    ];
    const legends = this.createLegend();

    return (
      <Card title={title} buttons={<span>{this.renderDatePicker()}</span>}>
        <hr />
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource && dataSource.length === 0 && loading ? (
              <div />
            ) : (
              <LegendChartTS
                identifier={`chartLegend-${ad.id}`}
                options={legendOptions}
                legends={legends}
              />
            )}
          </Col>
        </Row>
        {loading ? <LoadingChart /> : null}
        {!dataSource.length && !loading ? (
          <EmptyCharts title={formatMessage(messages.noStatAvailable)} />
        ) : null}
        {dataSource.length && !loading ? this.renderChart() : null}
      </Card>
    );
  }
}

export default compose<Props, AdCardProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
)(AdCard);
