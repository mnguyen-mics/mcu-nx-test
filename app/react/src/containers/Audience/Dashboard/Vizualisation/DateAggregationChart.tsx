import * as React from 'react';
import cuid from 'cuid';
import { Card } from '../../../../components/Card';
import {
  OTQLAggregationResult,
  isAggregateResult,
  isCountResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import StackedAreaPlot from '../../../../components/Charts/TimeBased/StackedAreaPlot';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { LoadingChart, EmptyCharts } from '../../../../components/EmptyCharts';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';

export interface DateAggregationChartProps {
  title?: string;
  segment?: AudienceSegmentShape;
  queryIds: string[];
  datamartId: string;
  plotLabels: string[];
}

interface QueryResult {
  xKey: number | string;
  yKey: number | string;
}

interface State {
  queryResult?: QueryResult[];
  colors: string[];
  error: boolean;
  loading: boolean;
}

type Props = DateAggregationChartProps &
  InjectedThemeColorsProps &
  InjectedIntlProps;

class DateAggregationChart extends React.Component<Props, State> {
  identifier = cuid();

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    const { colors } = props;
    const usedColors: string[] = [
      colors['mcs-error'],
      colors['mcs-highlight'],
      colors['mcs-info'],
      colors['mcs-normal'],
      colors['mcs-primary'],
      colors['mcs-success'],
      colors['mcs-warning'],
    ];
    this.state = {
      error: false,
      loading: true,
      colors: usedColors,
    };
  }

  componentDidMount() {
    const { segment, queryIds, datamartId } = this.props;
    this.fetchData(queryIds, datamartId, segment);
  }

  componentWillReceiveProps(nextProps: DateAggregationChartProps) {
    const { segment, queryIds, datamartId } = this.props;
    const { segment: nextSegment, queryIds: nextChartQueryId, datamartId: nextDatamartId } = nextProps;

    if (segment !== nextSegment || queryIds !== nextChartQueryId || datamartId !== nextDatamartId) {
      this.fetchData(nextChartQueryId, datamartId, nextSegment);
    }
  }

  formatData = (queryResult: OTQLAggregationResult[]): QueryResult[] => {
    if (
      queryResult.length &&
      queryResult[0].aggregations.buckets.length &&
      queryResult[0].aggregations.buckets[0].buckets.length
    ) {
      return queryResult[0].aggregations.buckets[0].buckets.map((data, i) => ({
        yKey: data.count,
        xKey: data.key,
      }));
    }
    return [];
  };

  fetchData = (
    chartQueryIds: string[],
    datamartId: string,
    segment?: AudienceSegmentShape,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
    return Promise.all(chartQueryIds.map(c => {
      return this.fetchQuery(c, datamartId, segment)
    }))
    .then(q => {
      this.setState({

      })
    })
    .catch(() => {
      this.setState({ error: true, loading: false });
    });
  };

  fetchQuery = (
    chartQueryId: string,
    datamartId: string,
    segment?: AudienceSegmentShape,
  ): Promise<QueryResult[]> => {
    return this._queryService
          .getQuery(datamartId, chartQueryId)
          .then(queryResp => {
            return queryResp.data;
          })
          .then(q => {
            return this._queryService
              .runOTQLQuery(datamartId, q.query_text, {
                use_cache: true,
              })
              .then(r => r.data)
              .then(r => {
                if (isAggregateResult(r.rows) && !isCountResult(r.rows)) {
                  return Promise.resolve(this.formatData(r.rows),);
                }
                throw new Error('wrong query type');
              })
          })
  };

  generateOptions = () => {
    const options = {
      innerRadius: true,
      isHalf: false,
      text: {},
      colors: this.state.colors,
      showTooltip: true,
    };
    return options;
  };

  public render() {
    const { title, colors, intl } = this.props;

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: [{ key: 'yKey', message: messages.count }],
      colors: [colors['mcs-warning']],
    };

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
        this.state.queryResult &&
        this.state.queryResult.length === 0
      ) {
        return <EmptyCharts title={intl.formatMessage(messages.noData)} />;
      } else {
        return (
          this.state.queryResult &&
          this.state.queryResult.length && (
            <StackedAreaPlot
              dataset={this.state.queryResult as any}
              options={optionsForChart}
            />
          )
        );
      }
    };

    return (
      <Card title={title}>
        <hr />
        {generateChart()}
      </Card>
    );
  }
}

export default compose<Props, DateAggregationChartProps>(
  injectThemeColors,
  injectIntl,
)(DateAggregationChart);
