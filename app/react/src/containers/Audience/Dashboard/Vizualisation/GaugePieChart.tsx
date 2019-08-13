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
  segmentQueryId: string;
  chartQueryIds: string[];
  datamartId: string;
}

interface State {
  queryResult?: DatasetProps[];
  colors: string[];
  error: boolean;
  loading: boolean;
  totalNumber1?: number;
  totalNumber2?: number;
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
    const { segmentQueryId, chartQueryIds, datamartId } = this.props;

    this.fetchData(datamartId, segmentQueryId, chartQueryIds);
  }

  componentWillReceiveProps(nextProps: GaugePieChartProps) {
    const { segmentQueryId, chartQueryIds, datamartId } = this.props;
    const {
      segmentQueryId: nextSegmentQueryId,
      chartQueryIds: nextChartQueryIds,
      datamartId: nextDatamartId,
    } = nextProps;

    if (
      segmentQueryId !== nextSegmentQueryId ||
      chartQueryIds !== nextChartQueryIds ||
      datamartId !== nextDatamartId
    ) {
      this.fetchData(nextDatamartId, nextSegmentQueryId, nextChartQueryIds);
    }
  }

  formatData = (
    result0: OTQLCountResult[],
    result1: OTQLCountResult[],
  ): DatasetProps[] => {
    const { colors } = this.state;
    return [
      {
        color: colors[1],
        key: 'Male',
        value: result0[0].count,
      },
      {
        color: '#eaeaea',
        key: 'Female',
        value: result1[0].count,
      },
    ];
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
                    totalNumber1: otqlResultList[1].rows[0].count,
                    totalNumber2: otqlResultList[0].rows[0].count,
                  });
                  return Promise.resolve();
                }
                const mapErr = new Error('wrong query type');
                return Promise.reject(mapErr);
              });
          });
      })
      .catch(() => {
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  generateOptions = (totalNumber1?: number, totalNumber2?: number) => {
    const options = {
      innerRadius: true,
      isHalf: false,
      text:
        totalNumber2 && totalNumber1
          ? {
              value:
                totalNumber1 - totalNumber2 > 0
                  ? `${(
                      (totalNumber1 / (totalNumber1 + totalNumber2)) *
                      100
                    ).toFixed(2)}% Female`
                  : `${(
                      (totalNumber2 / (totalNumber1 + totalNumber2)) *
                      100
                    ).toFixed(2)}% Male`,
              text: '',
            }
          : {},
      colors: this.state.colors,
      showTooltip: true,
      height: 300,
    };
    return options;
  };

  public render() {
    const { intl } = this.props;
    const { totalNumber1, totalNumber2 } = this.state;

    const pieChartsOptions = this.generateOptions(totalNumber1, totalNumber2);

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
