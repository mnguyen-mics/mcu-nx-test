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
import { StackedAreaPlot } from '../../../../components/StackedAreaPlot';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { LoadingChart, EmptyCharts } from '../../../../components/EmptyCharts';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';

export interface DateAggregationChartProps {
  title?: string;
  queryId: string;
  datamartId: string;
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
    const { queryId, datamartId } = this.props;

    this.fetchData(datamartId, queryId);
  }

  componentWillReceiveProps(nextProps: DateAggregationChartProps) {
    const { queryId, datamartId } = this.props;
    const { queryId: nextQueryId, datamartId: nextDatamartId } = this.props;

    if (queryId !== nextQueryId || datamartId !== nextDatamartId) {
      this.fetchData(nextDatamartId, nextQueryId);
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

  fetchData = (datamartId: string, queryId: string): Promise<void> => {
    this.setState({ error: false, loading: true });

    return this._queryService
      .getQuery(datamartId, queryId)
      .then(res => {
        if (res.data.query_language === 'OTQL' && res.data.query_text) {
          return this._queryService
            .runOTQLQuery(datamartId, res.data.query_text, {use_cache: true})
            .then(r => r.data)
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
            })
            .catch(e => this.setState({ error: true, loading: false }));
        }
        const err = new Error('wrong query language');
        return Promise.reject(err);
      })
      .catch(() => {
        this.setState({ error: true, loading: false });
      });
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
          <StackedAreaPlot
            identifier={`${this.identifier}-chart`}
            dataset={this.state.queryResult}
            options={optionsForChart}
          />
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
