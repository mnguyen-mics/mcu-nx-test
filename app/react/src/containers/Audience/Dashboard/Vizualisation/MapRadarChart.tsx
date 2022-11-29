import * as React from 'react';
import cuid from 'cuid';
import _ from 'lodash';
import {
  OTQLAggregationResult,
  isAggregateResult,
  isCountResult,
  OTQLResult,
  QueryPrecisionMode,
} from '../../../../models/datamart/graphdb/OTQLResult';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
  QueryExecutionSource,
  QueryExecutionSubSource,
} from '@mediarithmics-private/advanced-components';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { getFormattedQuery } from '../domain';
import { QueryResource } from '../../../../models/datamart/DatamartResource';
import {
  EmptyChart,
  LoadingChart,
  RadarChart,
} from '@mediarithmics-private/mcs-components-library';
import { BASE_CHART_HEIGHT, SerieSortType } from '../../../../components/Charts/domain';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { RadarChartProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/radar-chart';
import { chartColors } from '../../../../components/Funnel/Utils';
import {
  TooltipChart,
  DataLabel,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dashboardsModel';

export interface MapBarChartProps {
  title?: string;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
  queryId: string;
  data?: OTQLResult;
  datamartId: string;
  height?: number;
  labelsEnabled?: boolean;
  percentage?: boolean;
  shouldCompare?: boolean;
  vertical?: boolean;
  tooltip?: TooltipChart;
  labels?: DataLabel;
  sortKey?: SerieSortType;
  precision?: QueryPrecisionMode;
}

interface QueryResult {
  xKey: number | string;
  [key: string]: number | string;
}

interface State {
  queryResult?: QueryResult[];
  colors: string[];
  error: boolean;
  loading: boolean;
}

const BASE_YKEY = 'yKey';
const COMPARED_YKEY = 'comparedYKey';

type Props = MapBarChartProps & InjectedThemeColorsProps & WrappedComponentProps;

class MapBarChart extends React.Component<Props, State> {
  identifier = cuid();

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    const { colors } = props;
    const usedColors: string[] = chartColors.map(chartColor => colors[chartColor]);
    this.state = {
      error: false,
      loading: true,
      colors: usedColors,
    };
  }

  componentDidMount() {
    const { source, queryId, datamartId, shouldCompare, data } = this.props;
    if (data) {
      this.formatOtqlQueryResult(data);
    } else {
      this.fetchData(queryId, datamartId, shouldCompare, source);
    }
  }

  componentDidUpdate(previousProps: MapBarChartProps) {
    const { source, queryId, datamartId, shouldCompare, data } = this.props;
    const {
      source: previousSource,
      queryId: previousChartQueryId,
      datamartId: previousDatamartId,
      data: previousData,
    } = previousProps;

    if (
      !_.isEqual(previousSource, source) ||
      queryId !== previousChartQueryId ||
      datamartId !== previousDatamartId ||
      !_.isEqual(data, previousData)
    ) {
      if (data) {
        this.formatOtqlQueryResult(data);
      } else {
        this.fetchData(queryId, datamartId, shouldCompare, source);
      }
    }
  }

  public formatOtqlQueryResult = (r: OTQLResult) => {
    if (r && isAggregateResult(r.rows) && !isCountResult(r.rows)) {
      return this.setState({
        queryResult: this.formatData(r.rows, BASE_YKEY),
        loading: false,
      });
    }
    return this.setState({ error: true, loading: false });
  };

  formatData = (queryResult: OTQLAggregationResult[], key: string): QueryResult[] => {
    const { percentage } = this.props;
    if (
      queryResult.length &&
      queryResult[0].aggregations.buckets.length &&
      queryResult[0].aggregations.buckets[0].buckets.length
    ) {
      const total = percentage
        ? queryResult[0].aggregations.buckets[0].buckets.reduce((acc, data) => {
            return acc + data.count;
          }, 0)
        : undefined;
      return queryResult[0].aggregations.buckets[0].buckets.map((data, i) => ({
        [`${key}-count`]: data.count,
        [key]: total ? Math.round((data.count / total) * 10000) / 100 : data.count,
        xKey: data.key,
      }));
    }
    return [];
  };

  mergeData = (d0: QueryResult[], yKey0: string, d1: QueryResult[], yKey1: string) => {
    // filter and unique the keys;
    const xKeys = d0
      .map(d => d.xKey)
      .concat(d1.map(d => d.xKey))
      .filter((x, i, s) => s.indexOf(x) === i);
    return xKeys.map(xKey => ({
      [yKey1]:
        d1.find(d => d.xKey === xKey) && d1.find(d => d.xKey === xKey)![yKey1]
          ? d1.find(d => d.xKey === xKey)![yKey1]
          : 0,
      [yKey0]:
        d0.find(d => d.xKey === xKey) && d0.find(d => d.xKey === xKey)![yKey0]
          ? d0.find(d => d.xKey === xKey)![yKey0]
          : 0,
      xKey,
    }));
  };

  fetchData = (
    chartQueryId: string,
    datamartId: string,
    shouldCompare?: boolean,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
    const { precision, queryExecutionSource, queryExecutionSubSource } = this.props;
    const promise: Promise<void | QueryResource> = shouldCompare
      ? this._queryService
          .getQuery(datamartId, chartQueryId)
          .then(queryResp => {
            return queryResp.data;
          })
          .then(q => {
            return getFormattedQuery(datamartId, this._queryService, q);
          })
      : Promise.resolve();

    const getResultPromise = (q?: QueryResource | void): Promise<void | OTQLResult> =>
      q
        ? this._queryService
            .runOTQLQuery(datamartId, q.query_text, queryExecutionSource, queryExecutionSubSource, {
              use_cache: true,
              precision: precision,
            })
            .then(resp => {
              return resp.data;
            })
        : Promise.resolve();

    return Promise.all([
      this._queryService
        .getQuery(datamartId, chartQueryId)
        .then(queryResp => {
          return queryResp.data;
        })
        .then(q => {
          return getFormattedQuery(datamartId, this._queryService, q, source);
        }),
      promise,
    ])
      .then(([q0, q1]) => {
        return Promise.all([
          this._queryService
            .runOTQLQuery(
              datamartId,
              q0.query_text,
              queryExecutionSource,
              queryExecutionSubSource,
              {
                use_cache: true,
                precision: precision,
              },
            )
            .then(resp => {
              return resp.data;
            }),
          getResultPromise(q1),
        ])
          .then(([r0, r1]) => {
            if (r0 && !r1 && isAggregateResult(r0.rows) && !isCountResult(r0.rows)) {
              this.setState({
                queryResult: this.formatData(r0.rows, BASE_YKEY),
                loading: false,
              });
              return Promise.resolve();
            }
            if (
              r0 &&
              r1 &&
              isAggregateResult(r0.rows) &&
              !isCountResult(r0.rows) &&
              isAggregateResult(r1.rows) &&
              !isCountResult(r1.rows)
            ) {
              this.setState({
                queryResult: this.mergeData(
                  this.formatData(r0.rows, BASE_YKEY),
                  BASE_YKEY,
                  this.formatData(r1.rows, COMPARED_YKEY),
                  COMPARED_YKEY,
                ),
                loading: false,
              });
              return Promise.resolve();
            }
            const mapErr = new Error('wrong query type');
            return Promise.reject(mapErr);
          })
          .catch(() => this.setState({ error: true, loading: false }));
      })
      .catch(() => this.setState({ error: true, loading: false }));
  };

  public render() {
    const { title, colors, intl, shouldCompare, labels, tooltip, percentage } = this.props;

    const restKey = shouldCompare ? [{ key: COMPARED_YKEY, message: '' }] : [];

    const optionsForChart: RadarChartProps = {
      dataset: this.state.queryResult as any,
      height: BASE_CHART_HEIGHT,
      xKey: 'xKey',
      colors: [colors['mcs-chart-1']].concat(shouldCompare ? [colors['mcs-chart-7']] : []),
      yKeys: [{ key: BASE_YKEY, message: '' }].concat(restKey),
      dataLabels: {
        enabled: labels?.enable,
        filter: labels?.filterValue
          ? {
              operator: '>',
              property: 'y',
              value: labels.filterValue,
            }
          : undefined,
        format: labels?.format,
      },
      tooltip: { format: tooltip?.formatter },
      format: percentage ? 'percentage' : 'count',
    };

    const generateChart = () => {
      if (this.state.loading) {
        return <LoadingChart />;
      } else if (this.state.error) {
        return <EmptyChart title={intl.formatMessage(messages.error)} icon={'close-big'} />;
      } else if (
        (this.state.queryResult && this.state.queryResult.length === 0) ||
        !this.state.queryResult
      ) {
        return <EmptyChart title={intl.formatMessage(messages.noData)} icon='warning' />;
      } else {
        return (
          this.state.queryResult &&
          this.state.queryResult.length && <RadarChart {...optionsForChart} />
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, MapBarChartProps>(injectThemeColors, injectIntl)(MapBarChart);
