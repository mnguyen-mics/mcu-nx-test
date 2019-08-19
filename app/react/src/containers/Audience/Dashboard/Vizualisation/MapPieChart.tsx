import * as React from 'react';
import cuid from 'cuid';
import {
  OTQLAggregationResult,
  isAggregateResult,
  isCountResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import PieChart, { DatasetProps } from '../../../../components/Charts/CategoryBased/PiePlot';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { LegendChart } from '../../../../components/LegendChart';
import { LoadingChart, EmptyCharts } from '../../../../components/EmptyCharts';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';

export interface MapPieChartProps {
  title?: string;
  segmentQueryId: string;
  chartQueryId: string;
  datamartId: string;
  showLegend?: boolean;
  labelsEnabled?: boolean;
}

interface State {
  queryResult?: DatasetProps[];
  colors: string[];
  error: boolean;
  loading: boolean;
}

type Props = MapPieChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class MapPieChart extends React.Component<Props, State> {
  identifier = cuid();

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    const { colors } = props;
    const usedColors: string[] = [
      colors['mcs-warning'],
      colors['mcs-info'],
      colors['mcs-highlight'],
      colors['mcs-success'],
      colors['mcs-normal'],
      colors['mcs-primary'],
      colors['mcs-error'],
    ];
    this.state = {
      error: false,
      loading: true,
      colors: usedColors,
    };
  }

  componentDidMount() {
    const { segmentQueryId, chartQueryId, datamartId } = this.props;

    this.fetchData(datamartId, segmentQueryId, chartQueryId);
  }

  componentWillReceiveProps(nextProps: MapPieChartProps) {
    const { segmentQueryId, chartQueryId, datamartId } = this.props;
    const {
      segmentQueryId: nextQueryId,
      datamartId: nextDatamartId,
      chartQueryId: nextChartQueryId,
    } = nextProps;

    if (
      segmentQueryId !== nextQueryId ||
      datamartId !== nextDatamartId ||
      chartQueryId !== nextChartQueryId
    ) {
      this.fetchData(nextDatamartId, nextQueryId, nextChartQueryId);
    }
  }

  formatData = (queryResult: OTQLAggregationResult[]): DatasetProps[] => {
    const generateColorIndex = (currentIndex: number) => {
      const { colors } = this.state;
      if (currentIndex < colors.length) {
        return currentIndex;
      } else {
        const times = Math.floor(currentIndex / colors.length);
        return currentIndex - times * colors.length;
      }
    };

    return queryResult.length &&
      queryResult[0].aggregations.buckets.length &&
      queryResult[0].aggregations.buckets[0].buckets.length
      ? queryResult[0].aggregations.buckets[0].buckets.map((data, i) => ({
          key: data.key,
          value: data.count,
          color: this.state.colors[generateColorIndex(i)],
        }))
      : [];
  };

  fetchData = (
    datamartId: string,
    segmentQueryId: string,
    chartQueryId: string,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

    return this._queryService
      .getWhereClause(datamartId, segmentQueryId)
      .then(clauseResp => {
        return this._queryService
          .getQuery(datamartId, chartQueryId)

          .then(queryResp => {
            return queryResp.data;
          })
          .then(q => {
            const query = {
              query: q.query_text,
              additional_expression: clauseResp,
            };
            return this._queryService
              .runOTQLQuery(datamartId, JSON.stringify(query), {
                use_cache: true,
                content_type: `application/json`,
              })

              .then(otqlResultResp => {
                return otqlResultResp.data;
              })
              .then(r => {
                if (isAggregateResult(r.rows) && !isCountResult(r.rows)) {
                  this.setState({
                    queryResult: this.formatData(r.rows),
                    loading: false,
                  });
                  return Promise.resolve();
                }
                const mapErr = new Error('wrong query type');
                return Promise.reject(mapErr);
              });
          });
      })
      .catch(() => {
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  generateOptions = () => {
    const options = {
      innerRadius: true,
      isHalf: false,
      text: {},
      colors: this.state.colors,
      showTooltip: true,
      height: 300,
      labelsEnabled: this.props.labelsEnabled,
    };
    return options;
  };

  public render() {
    const { intl, showLegend } = this.props;

    const pieChartsOptions = this.generateOptions();

    const generateChart = () => {
      if (this.state.loading) {
        return <LoadingChart />;
      } else if (this.state.error) {
        return (
          <EmptyCharts
            title={intl.formatMessage(messages.error)}
            icon={'close-big'}
          />
        );
      } else if (
        (this.state.queryResult && this.state.queryResult.length === 0) ||
        !this.state.queryResult
      ) {
        return <EmptyCharts title={intl.formatMessage(messages.noData)} />;
      } else {
        return (
          <PieChart
            dataset={this.state.queryResult}
            options={pieChartsOptions}
          />
        );
      }
    };

    return (
      <CardFlex title={this.props.title}>
        {generateChart()}
        {showLegend &&
        this.state.queryResult &&
        this.state.queryResult.length ? (
          <LegendChart
            identifier={`${this.identifier}-legend`}
            options={this.state.queryResult.map(qr => ({
              color: qr.color,
              domain: qr.key,
            }))}
          />
        ) : null}
      </CardFlex>
    );
  }
}

export default compose<Props, MapPieChartProps>(
  injectThemeColors,
  injectIntl,
)(MapPieChart);
