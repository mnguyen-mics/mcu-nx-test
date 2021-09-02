import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import CampaignDisplayProgress from './CampaignDisplayProgress';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import { updateSearch, parseSearch } from '../../../../../utils/LocationSearchHelper';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsMoment from '../../../../../utils/McsMoment';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import {
  DoubleStackedAreaChart,
  EmptyChart,
  LoadingChart,
  MetricsColumn,
  McsDateRangePicker,
  LegendChartWithModal
} from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';

const LegendChartWithModalJS = LegendChartWithModal as any;

export interface OverallStat {
  cpa: string;
  cpc: string;
  cpm: string;
  impressions: string;
  impressions_cost: string;
  ctr: string;
  clicks: string;
}

interface DisplayStackedAreaChartProps<T = any> {
  isFetchingCampaignStat: boolean;
  dataSource?: T[];
  isFetchingOverallStat: boolean;
  overallStat?: OverallStat[];
  renderCampaignProgress?: boolean;
}

interface DisplayStackedAreaChartState {
  key1: any;
  key2: any;
}

interface RouterProps {
  organisationId: string;
}

type JoinedProps<T = any> = DisplayStackedAreaChartProps<T> &
  InjectedIntlProps &
  RouteComponentProps<RouterProps> &
  InjectedThemeColorsProps;

class DisplayStackedAreaChart<T> extends React.Component<
  JoinedProps<T>,
  DisplayStackedAreaChartState
> {
  constructor(props: JoinedProps<T>) {
    super(props);

    this.state = {
      key1: 'impressions',
      key2: 'clicks',
    };
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
      {
        key: 'ctr',
        domain: formatMessage(messages.ctr),
      },
      {
        key: 'impressions_cost',
        domain: formatMessage(messages.impressions_cost),
      },
      {
        key: 'cpm',
        domain: formatMessage(messages.cpm),
      },
      {
        key: 'cpc',
        domain: formatMessage(messages.cpc),
      },
    ];

    return legends;
  }

  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      history: {
        location: { search },
      },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const {
      dataSource,
      isFetchingCampaignStat,
      isFetchingOverallStat,
      overallStat,
      colors,
    } = this.props;
    const { key1, key2 } = this.state;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: messages[key1].defaultMessage || '' },
        { key: key2, message: messages[key2].defaultMessage || '' },
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

    const metrics = [
      {
        name: 'CPA',
        value:
          !isFetchingOverallStat && overallStat && overallStat.length
            ? formatMetric(overallStat[0].cpa, '0,0[.]00', '', '€')
            : undefined,
      },
      {
        name: 'CPC',
        value:
          !isFetchingOverallStat && overallStat && overallStat.length
            ? formatMetric(overallStat[0].cpc, '0,0[.]00', '', '€')
            : undefined,
      },
      {
        name: 'CTR',
        value:
          !isFetchingOverallStat && overallStat && overallStat.length
            ? formatMetric(parseFloat(overallStat[0].ctr) / 100, '0.000 %')
            : undefined,
      },
      {
        name: 'CPM',
        value:
          !isFetchingOverallStat && overallStat && overallStat.length
            ? formatMetric(overallStat[0].cpm, '0,0[.]00', '', '€')
            : undefined,
      },
      {
        name: 'Spent',
        value:
          !isFetchingOverallStat && overallStat && overallStat.length
            ? formatMetric(overallStat[0].impressions_cost, '0,0[.]00', '', '€')
            : undefined,
      },
    ];

    return !isFetchingCampaignStat && !isFetchingOverallStat ? (
      <div style={{ display: 'flex' }}>
        <div style={{ float: 'left' }}>
          <MetricsColumn
            metrics={metrics}
            isLoading={isFetchingOverallStat || isFetchingOverallStat}
          />
        </div>
        {dataSource && (
          <DoubleStackedAreaChart
            dataset={dataSource as any}
            options={optionsForChart}
            style={{ flex: '1' }}
          />
        )}
      </div>
    ) : (
      <LoadingChart />
    );
  }

  render() {
    const {
      dataSource,
      isFetchingCampaignStat,
      renderCampaignProgress,
      colors,
      intl: { formatMessage },
    } = this.props;
    const { key1, key2 } = this.state;

    const legendOptions = [
      {
        key: key1,
        domain: formatMessage(messages[key1]),
        color: colors['mcs-warning'],
      },
      {
        key: key2,
        domain: formatMessage(messages[key2]),
        color: colors['mcs-info'],
      },
    ];
    const legends = this.createLegend();
    const onLegendChange = (a: string, b: string) => this.setState({ key1: a, key2: b });

    const chartArea = (
      <div>
        {renderCampaignProgress ? <CampaignDisplayProgress /> : null}
        {renderCampaignProgress ? <hr /> : null}
        <Row className='mcs-chart-header'>
          <Col span={12}>
            {dataSource && dataSource.length === 0 && !isFetchingCampaignStat ? (
              <div />
            ) : (
              <LegendChartWithModalJS
                identifier='chartLegend'
                options={legendOptions}
                legends={legends}
                onLegendChange={onLegendChange}
              />
            )}
          </Col>
          <Col span={12}>
            <span className='mcs-card-button'>{this.renderDatePicker()}</span>
          </Col>
        </Row>
        {dataSource && dataSource.length === 0 && !isFetchingCampaignStat ? (
          <EmptyChart title={formatMessage(messages.noStatAvailable)} icon='warning' />
        ) : (
          <Row gutter={20}>
            <Col span={24}>{this.renderStackedAreaCharts()}</Col>
          </Row>
        )}
      </div>
    );

    return chartArea;
  }
}

export default compose<JoinedProps, DisplayStackedAreaChartProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
)(DisplayStackedAreaChart);
