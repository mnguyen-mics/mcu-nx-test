import * as React from 'react';
import _ from 'lodash';
import cuid from 'cuid';
import {
  OTQLAggregationResult,
  isAggregateResult,
  isCountResult,
  QueryPrecisionMode,
} from '../../../../models/datamart/graphdb/OTQLResult';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
  ThemeColorsShape,
  QueryExecutionSource,
  QueryExecutionSubSource,
} from '@mediarithmics-private/advanced-components';
import moment from 'moment';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import CardFlex from '../Components/CardFlex';
import { getFormattedQuery } from '../domain';
import { EmptyChart, LoadingChart, BarChart } from '@mediarithmics-private/mcs-components-library';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { Format } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import { chartColors } from '../../../../components/Funnel/Utils';

export interface DateAggregationChartProps {
  title?: string;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
  queryIds: string[];
  datamartId: string;
  plotLabels: string[];
  height?: number;
  format?: string;
  precision?: QueryPrecisionMode;
}

interface QueryResult {
  xKey: number | string;
  [yKey: string]: number | string;
}

interface State {
  queryResult?: QueryResult[];
  colors: string[];
  error: boolean;
  loading: boolean;
}

type Props = DateAggregationChartProps & InjectedThemeColorsProps & WrappedComponentProps;

class DateAggregationChart extends React.Component<Props, State> {
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
    const { source, queryIds, datamartId } = this.props;
    this.fetchData(queryIds, datamartId, source);
  }

  componentDidUpdate(previousProps: DateAggregationChartProps) {
    const { source, queryIds, datamartId } = this.props;
    const {
      source: previousSource,
      queryIds: previousChartQueryIds,
      datamartId: previousDatamartId,
    } = previousProps;

    if (
      !_.isEqual(source, previousSource) ||
      queryIds !== previousChartQueryIds ||
      datamartId !== previousDatamartId
    ) {
      this.fetchData(queryIds, datamartId, source);
    }
  }

  formatDataQuery = (
    queryResult: OTQLAggregationResult[],
    plotLabelIndex: string,
  ): QueryResult[] => {
    const { format } = this.props;
    if (
      queryResult.length &&
      queryResult[0].aggregations.buckets.length &&
      queryResult[0].aggregations.buckets[0].buckets.length
    ) {
      return queryResult[0].aggregations.buckets[0].buckets.map((data, i) => ({
        [plotLabelIndex]: data.count,
        xKey: format ? moment(data.key).format(format) : data.key,
      }));
    }
    return [];
  };

  groupQueryResult = (groupKey: string, q: QueryResult[][]): QueryResult[] => {
    return q
      .reduce((acc, v, i) => {
        return acc.concat(v);
      }, [] as QueryResult[])
      .reduce((acc, v, i) => {
        const foundValue = acc.findIndex(s => s[groupKey] === v[groupKey]);
        if (foundValue > -1) {
          acc[foundValue] = { ...acc[foundValue], ...v };
          return acc;
        } else {
          acc.push(v);
          return acc;
        }
      }, [] as QueryResult[]);
  };

  fetchData = (
    chartQueryIds: string[],
    datamartId: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
    return Promise.all(
      chartQueryIds.map((c, i) => {
        return this.fetchQuery(c, datamartId, i, source);
      }),
    )
      .then(q => {
        this.setState({
          loading: false,
          queryResult: this.groupQueryResult('xKey', q),
        });
      })
      .catch(() => {
        this.setState({ error: true, loading: false });
      });
  };

  fetchQuery = (
    chartQueryId: string,
    datamartId: string,
    plotLabelIndex: number,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<QueryResult[]> => {
    const { precision, queryExecutionSource, queryExecutionSubSource } = this.props;
    return this._queryService
      .getQuery(datamartId, chartQueryId)
      .then(queryResp => {
        return queryResp.data;
      })
      .then(q => {
        return getFormattedQuery(datamartId, this._queryService, q, source);
      })
      .then(q => {
        return this._queryService
          .runOTQLQuery(datamartId, q.query_text, queryExecutionSource, queryExecutionSubSource, {
            use_cache: true,
            precision: precision,
          })
          .then(r => r.data)
          .then(r => {
            if (isAggregateResult(r.rows) && !isCountResult(r.rows)) {
              return Promise.resolve(
                this.formatDataQuery(
                  r.rows,
                  this.props.plotLabels[plotLabelIndex]
                    ? this.props.plotLabels[plotLabelIndex]
                    : plotLabelIndex.toString(),
                ),
              );
            }
            throw new Error('wrong query type');
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
      format: 'count' as Format,
    };
    return options;
  };

  public render() {
    const { title, colors, intl, plotLabels, queryIds, height } = this.props;

    const computeChartLabels = () => {
      return queryIds.map((q, i) => {
        return {
          key: plotLabels[i] ? plotLabels[i] : i.toString(),
          message: plotLabels[i] ? plotLabels[i] : i.toString(),
        };
      });
    };

    const computeChartColors = () => {
      const availableColors = Object.keys(colors).filter(c => c !== 'mcs-normal');
      return queryIds.map((q, i) => {
        return colors[
          availableColors[i % (availableColors.length - 1)] as keyof ThemeColorsShape
        ] as string;
      });
    };

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: computeChartLabels(),
      colors: computeChartColors(),
      format: 'count' as Format,
    };

    const generateChart = () => {
      if (this.state.loading) {
        return <LoadingChart />;
      } else if (this.state.error) {
        return <EmptyChart title={intl.formatMessage(messages.error)} icon={'close-big'} />;
      } else if (this.state.queryResult && this.state.queryResult.length === 0) {
        return <EmptyChart title={intl.formatMessage(messages.noData)} icon='warning' />;
      } else {
        return (
          this.state.queryResult &&
          this.state.queryResult.length && (
            <BarChart
              {...optionsForChart}
              dataset={this.state.queryResult as any}
              height={height}
            />
          )
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, DateAggregationChartProps>(
  injectThemeColors,
  injectIntl,
)(DateAggregationChart);
