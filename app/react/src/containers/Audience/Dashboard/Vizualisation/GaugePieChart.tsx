import * as React from 'react';
import cuid from 'cuid';
import {
  isAggregateResult,
  isCountResult,
  OTQLCountResult,
  QueryPrecisionMode,
} from '../../../../models/datamart/graphdb/OTQLResult';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
  QueryExecutionSource,
  QueryExecutionSubSource,
} from '@mediarithmics-private/advanced-components';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { PieChart, EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import {
  Dataset,
  PieChartFormat,
} from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import { chartColors } from '../../../../components/Funnel/Utils';

export interface GaugePieChartProps {
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
  title?: string;
  queryIds: string[];
  datamartId: string;
  height: number;
  precision?: QueryPrecisionMode;
}

interface State {
  queryResult?: Dataset;
  colors: string[];
  error: boolean;
  loading: boolean;
  totalNumber1?: number;
  totalNumber2?: number;
}

type Props = GaugePieChartProps & InjectedThemeColorsProps & WrappedComponentProps;

class GaugePieChart extends React.Component<Props, State> {
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
    const { queryIds, datamartId } = this.props;

    this.fetchData(queryIds, datamartId);
  }

  componentDidUpdate(previousProps: GaugePieChartProps) {
    const { queryIds, datamartId } = this.props;
    const { queryIds: previousChartQueryIds, datamartId: previousDatamartId } = previousProps;

    if (queryIds !== previousChartQueryIds || datamartId !== previousDatamartId) {
      this.fetchData(queryIds, datamartId);
    }
  }

  formatData = (result0: OTQLCountResult[], result1: OTQLCountResult[]): Dataset => {
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

  fetchData = (chartQueryIds: string[], datamartId: string): Promise<void> => {
    this.setState({ error: false, loading: true });
    const { precision, queryExecutionSource, queryExecutionSubSource } = this.props;
    const promises = chartQueryIds.map(chartQueryId => {
      return this._queryService.getQuery(datamartId, chartQueryId);
    });
    return Promise.all(promises)
      .then(queryListResp => {
        return queryListResp.map(ql => ql.data);
      })
      .then(queryList => {
        const queryListPromises = queryList.map(q => {
          return this._queryService.runOTQLQuery(
            datamartId,
            q.query_text,
            queryExecutionSource,
            queryExecutionSubSource,
            {
              use_cache: true,
              precision: precision,
            },
          );
        });
        return Promise.all(queryListPromises)
          .then(otqlResultListResp => {
            return otqlResultListResp.map(otqlResultResp => otqlResultResp.data);
          })
          .then(otqlResultList => {
            if (
              !isAggregateResult(otqlResultList[0].rows) &&
              isCountResult(otqlResultList[0].rows) &&
              !isAggregateResult(otqlResultList[1].rows) &&
              isCountResult(otqlResultList[1].rows)
            ) {
              this.setState({
                queryResult: this.formatData(otqlResultList[0].rows, otqlResultList[1].rows),
                loading: false,
                totalNumber1: otqlResultList[1].rows[0].count,
                totalNumber2: otqlResultList[0].rows[0].count,
              });
              return Promise.resolve();
            }
            const mapErr = new Error('wrong query type');
            return Promise.reject(mapErr);
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
      // text:
      //   totalNumber2 && totalNumber1
      //     ? {
      //         value:
      //           totalNumber1 - totalNumber2 > 0
      //             ? `${((totalNumber1 / (totalNumber1 + totalNumber2)) * 100).toFixed(2)}% Female`
      //             : `${((totalNumber2 / (totalNumber1 + totalNumber2)) * 100).toFixed(2)}% Male`,
      //         text: '',
      //       }
      //     : {}, , // Deprecated by this spec: https://docs.google.com/presentation/d/1bs18HSKzW4g1DpHej4WhVcmswffUN0s-lJxgPp1p_kA/edit#slide=id.ge81274b9a1_0_0
      colors: this.state.colors,
      dataset: this.state.queryResult as Dataset,
      format: 'percentage' as PieChartFormat,
    };
    return options;
  };

  public render() {
    const { intl, height } = this.props;
    const { totalNumber1, totalNumber2 } = this.state;

    const pieChartsOptions = this.generateOptions(totalNumber1, totalNumber2);

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
        return <PieChart {...pieChartsOptions} height={height} />;
      }
    };

    return <CardFlex title={this.props.title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, GaugePieChartProps>(injectThemeColors, injectIntl)(GaugePieChart);
