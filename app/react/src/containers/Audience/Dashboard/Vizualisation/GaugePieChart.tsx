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
  totalQueryId: string;
  partialQueryId: string;
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
    const { totalQueryId, partialQueryId, datamartId } = this.props;

    this.fetchData(datamartId, totalQueryId, partialQueryId);
  }

  componentWillReceiveProps(nextProps: GaugePieChartProps) {
    const { totalQueryId, partialQueryId, datamartId } = this.props;
    const {
      totalQueryId: nextTotalQueryId,
      partialQueryId: nextPartialQueryId,
      datamartId: nextDatamartId,
    } = this.props;

    if (
      totalQueryId !== nextTotalQueryId ||
      partialQueryId !== nextPartialQueryId ||
      datamartId !== nextDatamartId
    ) {
      this.fetchData(nextDatamartId, nextTotalQueryId, nextPartialQueryId);
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
    totalQueryId: string,
    partialQueryId: string,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

    return Promise.all([
      this._queryService.getQuery(datamartId, totalQueryId),
      this._queryService.getQuery(datamartId, partialQueryId),
    ])
      .then(([totalQuery, partialQuery]) => {
        if (
          totalQuery.data.query_language === 'OTQL' &&
          totalQuery.data.query_text &&
          partialQuery.data.query_language === 'OTQL' &&
          totalQuery.data.query_text
        ) {
          return Promise.all([
            this._queryService.runOTQLQuery(
              datamartId,
              totalQuery.data.query_text,
              { use_cache: true },
            ),
            this._queryService.runOTQLQuery(
              datamartId,
              partialQuery.data.query_text,
              { use_cache: true },
            ),
          ])
            .then(([totalQueryResult, partialQueryResult]) => {
              if (
                !isAggregateResult(totalQueryResult.data.rows) &&
                isCountResult(totalQueryResult.data.rows) &&
                !isAggregateResult(partialQueryResult.data.rows) &&
                isCountResult(partialQueryResult.data.rows)
              ) {
                this.setState({
                  queryResult: this.formatData(
                    totalQueryResult.data.rows,
                    partialQueryResult.data.rows,
                  ),
                  loading: false,
                  partialValue: partialQueryResult.data.rows[0].count,
                  totalValue: totalQueryResult.data.rows[0].count
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

  generateOptions = (totalValue?: number, partialValue?: number) => {
    const options = {
      innerRadius: true,
      isHalf: false,
      text: partialValue && totalValue ? {
        value: `${Math.round(partialValue / totalValue * 100)}%`,
        text: ""
      } : {},
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
