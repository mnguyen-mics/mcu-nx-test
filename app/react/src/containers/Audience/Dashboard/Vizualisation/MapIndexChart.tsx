import * as React from 'react';
import _ from 'lodash';
import {
  isAggregateResult,
  isCountResult,
  OTQLResult,
  OTQLBucket,
  QueryPrecisionMode,
} from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { QueryResource } from '../../../../models/datamart/DatamartResource';
import { DataLabel, TooltipChart } from '../../../../models/dashboards/dashboards';
import { EmptyChart, LoadingChart, BarChart } from '@mediarithmics-private/mcs-components-library';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import {
  Dataset,
  Format,
} from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import { getFormattedQuery } from '../domain';
import { chartColors } from '../../../../components/Funnel/Utils';

export interface MapIndexChartProps {
  title?: string;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  data?: OTQLResult;
  queryId: string;
  datamartId: string;
  height?: number;
  labelsEnabled?: boolean;
  percentage?: boolean;
  shouldCompare?: boolean;
  vertical?: boolean;
  sortKey?: 'A-Z' | 'Z-A';
  labels?: DataLabel;
  tooltip?: TooltipChart;
  showTop?: number;
  minimumPercentage?: number;
  precision?: QueryPrecisionMode;
}

interface State {
  queryResult?: Dataset;
  colors: string[];
  error: boolean;
  loading: boolean;
}

const BASE_YKEY = 'yKey';
const COMPARED_YKEY = 'comparedYKey';

type Props = MapIndexChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class MapIndexChart extends React.Component<Props, State> {
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
    const { queryId, datamartId, data, source } = this.props;
    if (data) {
      this.formatOtqlQueryResult(data);
    } else {
      this.fetchData(queryId, datamartId, source);
    }
  }

  componentDidUpdate(previousProps: MapIndexChartProps) {
    const { source, queryId, datamartId, data } = this.props;
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
        this.fetchData(queryId, datamartId, source);
      }
    }
  }

  public formatOtqlQueryResult = (r: OTQLResult) => {
    if (r && isAggregateResult(r.rows) && !isCountResult(r.rows)) {
      const queryResult = this.formatDataset(
        r.rows[0]?.aggregations.buckets[0].buckets || [],
        BASE_YKEY,
      );
      return this.setState({
        queryResult: queryResult,
        loading: false,
      });
    }
    return this.setState({ error: true, loading: false });
  };

  formatDataset(buckets: OTQLBucket[], key: string): Dataset | undefined {
    const { percentage } = this.props;

    if (!buckets || buckets.length === 0) return undefined;
    else {
      const total = percentage ? buckets.reduce((acc, b) => acc + b.count, 0) : undefined;
      const dataset: any = buckets.map(buck => {
        return {
          [`${key}-count`]: buck.count,
          [key]: total ? Math.round((buck.count / total) * 10000) / 100 : buck.count,
          buckets: this.formatDataset(buck.aggregations?.buckets[0]?.buckets || [], key),
          xKey: buck.key,
        };
      });
      return dataset;
    }
  }

  mergeData = (d0: Dataset, yKey0: string, d1: Dataset, yKey1: string) => {
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

  getResultPromise = (datamartId: string, q: QueryResource): Promise<void | OTQLResult> =>
    this._queryService
      .runOTQLQuery(datamartId, q.query_text, {
        use_cache: true,
        precision: this.props.precision,
      })
      .then(resp => {
        return resp.data;
      });

  getQueryWithoutWhere = (q: QueryResource): QueryResource => {
    const queryWithoutWhere = {
      ...q,
      query_text: q.query_text.substring(0, q.query_text.toLowerCase().indexOf('where')),
    };
    return queryWithoutWhere;
  };

  fetchData = (
    chartQueryId: string,
    datamartId: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): any => {
    const { showTop, minimumPercentage } = this.props;
    this.setState({ error: false, loading: true });
    this._queryService
      .getQuery(datamartId, chartQueryId)
      .then(queryResp => {
        return queryResp.data;
      })
      .then(q => {
        if (source) {
          return getFormattedQuery(datamartId, this._queryService, q, source).then(qForSource => {
            return [q, qForSource];
          });
        }
        const queryWithoutWhere = this.getQueryWithoutWhere(q);
        return [q, queryWithoutWhere];
      })
      .then(([query, formattedQuery]) => {
        return Promise.all([
          this.getResultPromise(datamartId, query),
          this.getResultPromise(datamartId, formattedQuery),
        ])
          .then(([queryResult, queryReferenceResult]) => {
            if (
              queryResult &&
              queryReferenceResult &&
              isAggregateResult(queryResult.rows) &&
              !isCountResult(queryResult.rows) &&
              isAggregateResult(queryReferenceResult.rows) &&
              !isCountResult(queryReferenceResult.rows)
            ) {
              const mergedData = this.mergeData(
                this.formatDataset(
                  queryResult.rows[0]?.aggregations?.buckets[0]?.buckets || [],
                  BASE_YKEY,
                ) || [],
                BASE_YKEY,
                this.formatDataset(
                  queryReferenceResult.rows[0]?.aggregations?.buckets[0]?.buckets || [],
                  COMPARED_YKEY,
                ) || [],
                COMPARED_YKEY,
              );

              const totalQueryResult = mergedData.reduce((a, b) => {
                return a + (b as any).yKey;
              }, 0);

              const totalqueryReferenceResult = mergedData.reduce((a, b) => {
                return a + (b as any).comparedYKey;
              }, 0);

              const mergedDataInPourcentage = mergedData.map(d => {
                return {
                  ...d,
                  yKey: ((d.yKey as number) * 100) / totalQueryResult,
                  comparedYKey: ((d.comparedYKey as number) * 100) / totalqueryReferenceResult,
                };
              });

              const computedData = mergedDataInPourcentage
                .map(d => {
                  const yKeyValue = (
                    (source ? d.comparedYKey / d.yKey : d.yKey / d.comparedYKey) * 100
                  ).toFixed(2);
                  return {
                    xKey: d.xKey,
                    yKey: parseFloat(yKeyValue),
                  };
                })
                .filter(cd => cd.yKey >= (minimumPercentage || 1));
              const sortedComputedData = _.sortBy(computedData, ['yKey']).reverse();

              this.setState({
                queryResult: sortedComputedData.slice(0, showTop),
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
    const {
      title,
      colors,
      intl,
      shouldCompare,
      vertical,
      sortKey,
      labels,
      tooltip,
      height,
    } = this.props;

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: [{ key: BASE_YKEY, message: '' }],
      colors: [colors['mcs-chart-1']].concat(shouldCompare ? [colors['mcs-chart-7']] : []),
      labelsEnabled: this.props.labelsEnabled,
      vertical,
      sort: sortKey,
      tooltip: { format: tooltip?.formatter },
      labels,
      type: 'bar',
      chart: {
        type: 'bar',
      },
      format: 'count' as Format,
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
          this.state.queryResult.length && (
            <BarChart
              {...optionsForChart}
              dataset={this.state.queryResult as any}
              drilldown={true}
              height={height}
              plotLineValue={100}
              tooltip={{
                format: tooltip?.formatter,
              }}
            />
          )
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, MapIndexChartProps>(injectThemeColors, injectIntl)(MapIndexChart);
