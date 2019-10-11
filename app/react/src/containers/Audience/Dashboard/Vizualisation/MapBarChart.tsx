import * as React from 'react';
import cuid from 'cuid';
import {
  OTQLAggregationResult,
  isAggregateResult,
  isCountResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { LoadingChart, EmptyCharts } from '../../../../components/EmptyCharts';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import StackedBarPlot from '../../../../components/Charts/CategoryBased/StackedBarPlot';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';

export interface MapBarChartProps {
  title?: string;
  segment?: AudienceSegmentShape;
  queryId: string;
  datamartId: string;
  height?: number;
  labelsEnabled?: boolean;
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

type Props = MapBarChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class MapBarChart extends React.Component<Props, State> {
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
    const { segment, queryId, datamartId } = this.props;
    this.fetchData(queryId, datamartId, segment);
  }

  componentWillReceiveProps(nextProps: MapBarChartProps) {
    const { segment, queryId, datamartId } = this.props;
    const { segment: nextSegment, queryId: nextChartQueryId, datamartId: nextDatamartId } = nextProps;

    if (segment !== nextSegment || queryId !== nextChartQueryId || datamartId !== nextDatamartId) {
      this.fetchData(nextChartQueryId, nextDatamartId, nextSegment);
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
    chartQueryId: string,
    datamartId: string,
    segment?: AudienceSegmentShape,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
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
              .then(resp => {
                return resp.data;
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
              })
              .catch(() => this.setState({ error: true, loading: false }));
          })
          .catch(() => this.setState({ error: true, loading: false }));
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
      yKeys: [{ key: 'yKey', message: '' }],
      colors: [colors['mcs-info']],
      labelsEnabled: this.props.labelsEnabled,
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
        (this.state.queryResult && this.state.queryResult.length === 0) ||
        !this.state.queryResult
      ) {
        return <EmptyCharts title={intl.formatMessage(messages.noData)} />;
      } else {
        return (
          this.state.queryResult &&
          this.state.queryResult.length && (
            <StackedBarPlot
              dataset={this.state.queryResult as any}
              options={optionsForChart}
            />
          )
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, MapBarChartProps>(
  injectThemeColors,
  injectIntl,
)(MapBarChart);
