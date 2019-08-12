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
  queryId: string;
  datamartId: string;
  clauseIds: string[];
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
    const { queryId, datamartId, clauseIds } = this.props;

    this.fetchData(datamartId, queryId, clauseIds);
  }

  componentWillReceiveProps(nextProps: CountBarChartProps) {
    const { queryId, datamartId, clauseIds } = this.props;
    const {
      queryId: nextQueryId,
      datamartId: nextDatamartId,
      clauseIds: nextClauseIds,
    } = nextProps;

    if (
      queryId !== nextQueryId ||
      datamartId !== nextDatamartId ||
      clauseIds !== nextClauseIds
    ) {
      this.fetchData(nextDatamartId, nextQueryId, nextClauseIds);
    }
  }

  formatData = (otqlResults: OTQLAggregationResult[]): QueryResult[] => {
    return [];
    // if (
    //   queryResult.length &&
    //   queryResult[0].aggregations.buckets.length &&
    //   queryResult[0].aggregations.buckets[0].buckets.length
    // ) {
    //   return queryResult[0].aggregations.buckets[0].buckets.map((data, i) => ({
    //     yKey: data.count,
    //     xKey: data.key,
    //   }));
    // }
    // return [];
  };

  fetchData = (
    datamartId: string,
    queryId: string,
    clauseIds: string[],
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

    return this._queryService
      .getQuery(datamartId, queryId)
      .then(res => {
        if (res.data.query_language === 'OTQL' && res.data.query_text) {
          return Promise.all(
            clauseIds.map(clauseId =>
              this._queryService.getWhereClause(datamartId, clauseId),
            ),
          )
            .then(clauseListResp => {
              return clauseListResp.map(cl => cl.data);
            })
            .then(clauseList => {
              return Promise.all(
                clauseList.map(clause => {
                  const query = {
                    query: res.data.query_text,
                    additional_expression: clause,
                  };
                  return this._queryService.runOTQLQuery(
                    datamartId,
                    JSON.stringify(query),
                    { use_cache: true, content_type: `application/json` },
                  );
                }),
              )
                .then(resp => {
                  return resp.map(r => r.data);
                })
                .then(result => {
                  const rows = result.map(r => r.rows);
                  if (isAggregateResult(rows) && !isCountResult(rows)) {
                    this.setState({
                      queryResult: this.formatData(rows),
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
        }
        const err = new Error('wrong query language');
        return Promise.reject(err);
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
