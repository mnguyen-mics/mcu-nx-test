import * as React from 'react';
import cuid from 'cuid';
import {
  isAggregateResult,
  isCountResult,
  OTQLCountResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import PieChart, { DatasetProps } from '../../../../components/PieChart';
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

export interface GaugePieChartProps {
  title?: string;
  queryId: string;
  clauseIds: string[];
  datamartId: string;
  showPercentage: boolean;
}

interface State {
  queryResult?: DatasetProps[];
  colors: string[];
  error: boolean;
  loading: boolean;
  partialValue?: number;
  totalValue?: number;
}

type Props = GaugePieChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class GaugePieChart extends React.Component<Props, State> {
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
    const { queryId, clauseIds, datamartId } = this.props;

    this.fetchData(datamartId, queryId, clauseIds);
  }

  componentWillReceiveProps(nextProps: GaugePieChartProps) {
    const { queryId, clauseIds, datamartId } = this.props;
    const {
      queryId: nextQueryId,
      clauseIds: nextClauseIds,
      datamartId: nextDatamartId,
    } = nextProps;

    if (
      queryId !== nextQueryId ||
      clauseIds !== nextClauseIds ||
      datamartId !== nextDatamartId
    ) {
      this.fetchData(nextDatamartId, nextQueryId, nextClauseIds);
    }
  }

  formatData = (
    totalResult: OTQLCountResult[],
    partialResult: OTQLCountResult[],
  ): DatasetProps[] => {
    const { title } = this.props;
    const { colors } = this.state;

    return [
      {
        color: colors[1],
        key: title || '',
        value: partialResult[0].count,
      },
      {
        color: '#eaeaea',
        key: 'rest',
        value: totalResult[0].count - partialResult[0].count,
      },
    ];
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
          return Promise.all([
            this._queryService.getWhereClause(datamartId, clauseIds[0]),
            this._queryService.getWhereClause(datamartId, clauseIds[1]),
          ])
            .then(clauses => {
              const query0 = {
                query: res.data.query_text,
                additional_expression: clauses[0].data,
              };
              const query1 = {
                query: res.data.query_text,
                additional_expression: clauses[1].data,
              };
              return Promise.all([
                this._queryService.runOTQLQuery(
                  datamartId,
                  JSON.stringify(query0),
                  {
                    use_cache: true,
                    content_type: `application/json`,
                  },
                ),
                this._queryService.runOTQLQuery(
                  datamartId,
                  JSON.stringify(query1),
                  {
                    use_cache: true,
                    content_type: `application/json`,
                  },
                ),
              ])
                .then(otqlResultListResp => {
                  return otqlResultListResp.map(
                    otqlResultResp => otqlResultResp.data,
                  );
                })
                .then(otqlResultList => {
                  if (
                    !isAggregateResult(otqlResultList[0].rows) &&
                    isCountResult(otqlResultList[0].rows) &&
                    !isAggregateResult(otqlResultList[1].rows) &&
                    isCountResult(otqlResultList[1].rows)
                  ) {
                    this.setState({
                      queryResult: this.formatData(
                        otqlResultList[0].rows as OTQLCountResult[],
                        otqlResultList[1].rows as OTQLCountResult[],
                      ),
                      loading: false,
                      partialValue: otqlResultList[1].rows[0].count,
                      totalValue: otqlResultList[0].rows[0].count,
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

  generateOptions = (totalValue?: number, partialValue?: number) => {
    const options = {
      innerRadius: true,
      isHalf: false,
      text:
        partialValue && totalValue
          ? {
              value: `${Math.round((partialValue / totalValue) * 100)}%`,
              text: '',
            }
          : {},
      colors: this.state.colors,
      showTooltip: false,
      height: 300,
    };
    return options;
  };

  public render() {
    const { intl } = this.props;
    const { partialValue, totalValue } = this.state;

    const pieChartsOptions = this.generateOptions(totalValue, partialValue);

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
            identifier={`${this.identifier}-chart`}
            dataset={this.state.queryResult}
            options={pieChartsOptions}
          />
        );
      }
    };

    return <CardFlex title={this.props.title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, GaugePieChartProps>(
  injectThemeColors,
  injectIntl,
)(GaugePieChart);
