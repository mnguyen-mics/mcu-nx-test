import * as React from 'react';
import _ from 'lodash';
import cuid from 'cuid';
import {
  isAggregateResult,
  isCountResult,
  OTQLResult,
  OTQLBucket,
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
import { getFormattedQuery } from '../domain';
import { QueryResource } from '../../../../models/datamart/DatamartResource';
import { DataLabel, TooltipChart } from '../../../../models/dashboards/dashboards';
import { EmptyChart, LoadingChart, BarChart } from '@mediarithmics-private/mcs-components-library';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import {
  Dataset,
  Format,
} from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';

export interface MapBarChartProps {
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
  drilldown?: boolean;
  stacking?: boolean;
  reducePadding?: boolean;
}

interface State {
  queryResult?: Dataset;
  error: boolean;
  loading: boolean;
}

const BASE_YKEY = 'yKey';
const COMPARED_YKEY = 'comparedYKey';

type Props = MapBarChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class MapBarChart extends React.Component<Props, State> {
  identifier = cuid();

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      error: false,
      loading: true,
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

  fetchData = (
    chartQueryId: string,
    datamartId: string,
    shouldCompare?: boolean,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
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
            .runOTQLQuery(datamartId, q.query_text, {
              use_cache: true,
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
            .runOTQLQuery(datamartId, q0.query_text, {
              use_cache: true,
            })
            .then(resp => {
              return resp.data;
            }),
          getResultPromise(q1),
        ])
          .then(([r0, r1]) => {
            if (r0 && !r1 && isAggregateResult(r0.rows) && !isCountResult(r0.rows)) {
              this.setState({
                queryResult:
                  this.formatDataset(
                    r0.rows[0]?.aggregations?.buckets[0]?.buckets || [],
                    BASE_YKEY,
                  ) || [],
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
                  this.formatDataset(
                    r0.rows[0]?.aggregations?.buckets[0]?.buckets || [],
                    BASE_YKEY,
                  ) || [],
                  BASE_YKEY,
                  this.formatDataset(
                    r1.rows[0]?.aggregations?.buckets[0]?.buckets || [],
                    COMPARED_YKEY,
                  ) || [],
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
      stacking,
      drilldown,
      reducePadding,
    } = this.props;

    const restKey = shouldCompare ? [{ key: COMPARED_YKEY, message: '' }] : [];

    const usedColors: string[] = [
      colors['mcs-chart-1'],
      colors['mcs-chart-7'],
      colors['mcs-chart-2'],
      colors['mcs-chart-3'],
      colors['mcs-chart-4'],
      colors['mcs-chart-5'],
      colors['mcs-chart-6'],
    ];

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: [{ key: BASE_YKEY, message: '' }].concat(restKey),
      colors: usedColors,
      labelsEnabled: this.props.labelsEnabled,
      tooltip: { format: tooltip?.formatter },
      vertical,
      sort: sortKey,
      labels,
      format: 'percentage' as Format,
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
              drilldown={drilldown}
              stacking={stacking}
              height={height}
              bigBars={reducePadding}
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

export default compose<Props, MapBarChartProps>(injectThemeColors, injectIntl)(MapBarChart);
