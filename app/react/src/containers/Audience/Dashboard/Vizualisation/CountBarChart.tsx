import * as React from 'react';
import _ from 'lodash';
import cuid from 'cuid';
import {
  OTQLCountResult,
  isCountResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { VerticalBarChart } from '../../../../components/BarCharts';
import { LoadingChart, EmptyCharts } from '../../../../components/EmptyCharts';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';

export interface CountBarChartProps {
  title?: string;
  segmentQueryId: string;
  datamartId: string;
  chartQueryIds: string[];
  height?: number;
  labelsEnabled?: boolean;
  type: string;
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

type Props = CountBarChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class CountBarChart extends React.Component<Props, State> {
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
    const { segmentQueryId, datamartId, chartQueryIds } = this.props;

    this.fetchData(datamartId, segmentQueryId, chartQueryIds);
  }

  componentWillReceiveProps(nextProps: CountBarChartProps) {
    const { segmentQueryId, datamartId, chartQueryIds } = this.props;
    const {
      segmentQueryId: nextSegmentQueryId,
      datamartId: nextDatamartId,
      chartQueryIds: nextChartQueryIds,
    } = nextProps;

    if (
      segmentQueryId !== nextSegmentQueryId ||
      datamartId !== nextDatamartId ||
      chartQueryIds !== nextChartQueryIds
    ) {
      this.fetchData(nextDatamartId, nextSegmentQueryId, nextChartQueryIds);
    }
  }

  formatData = (otqlResults: OTQLCountResult[]): QueryResult[] => {
    const { type } = this.props;
    let xkeys: string[];
    switch (type) {
      case 'age_det':
      case 'age_prob':
        xkeys = ['0-15 yo', '15-25 yo', '25-35 yo', '35-55 yo', '55+ yo'];
        break;
      case 'reader_status':
        xkeys = ['Is a contributor', 'Is a subscriber', 'Is a free reader'];
        break;

      default:
        xkeys = [];
        break;
    }

    if (otqlResults.length) {
      return otqlResults.map((data, i) => ({
        yKey: data.count,
        xKey: xkeys[i],
      }));
    }
    return [];
  };

  fetchData = (
    datamartId: string,
    segmentQueryId: string,
    chartQueryIds: string[],
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

    return this._queryService
      .getWhereClause(datamartId, segmentQueryId)
      .then(clauseResp => {
        const promises = chartQueryIds.map(chartQueryId => {
          return this._queryService.getQuery(datamartId, chartQueryId);
        });
        return Promise.all(promises)
          .then(queryListResp => {
            return queryListResp.map(ql => ql.data);
          })
          .then(queryList => {
            const queryListPromises = queryList.map(q => {
              const query = {
                query: q.query_text,
                additional_expression: clauseResp,
              };
              return this._queryService.runOTQLQuery(
                datamartId,
                JSON.stringify(query),
                {
                  use_cache: true,
                  content_type: `application/json`,
                },
              );
            });
            return Promise.all(queryListPromises)
              .then(otqlResultListResp => {
                return otqlResultListResp.map(
                  otqlResultResp => otqlResultResp.data,
                );
              })
              .then(result => {
                const rows = _.flattenDepth(result.map(r => r.rows), 1);
                if (isCountResult(rows)) {
                  this.setState({
                    queryResult: this.formatData(rows),
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
        // To remove
        this.setState({
          error: false,
          loading: false,
          queryResult: [
            { xKey: '0', yKey: 2 },
            { xKey: '1', yKey: 4 },
            { xKey: '2', yKey: 6 },
            { xKey: '3', yKey: 3 },
            { xKey: '4', yKey: 1 },
          ],
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
    };
    return options;
  };

  public render() {
    const { title, colors, intl, height } = this.props;

    const optionsForChart = {
      xKey: 'xKey',
      yKeys: ['yKey'],
      colors: [colors['mcs-info']],
      labelsEnabled: this.props.labelsEnabled,
      showTooltip: true,
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
          <VerticalBarChart
            identifier={`${this.identifier}-chart`}
            dataset={this.state.queryResult}
            options={optionsForChart}
            colors={{ base: colors['mcs-info'], hover: colors['mcs-warning'] }}
            height={height}
          />
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, CountBarChartProps>(
  injectThemeColors,
  injectIntl,
)(CountBarChart);
