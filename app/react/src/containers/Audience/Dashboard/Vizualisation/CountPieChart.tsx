import * as React from 'react';
import cuid from 'cuid';
import _ from 'lodash';
import {
  OTQLCountResult,
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
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { getFormattedQuery } from '../domain';
import { PieChartProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/pie-chart/PieChart';
import {
  Dataset,
  PieChartFormat,
} from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import { PieChart, EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { chartColors } from '../../../../components/Funnel/Utils';

export interface CountPieChartProps {
  title?: string;
  queryIds: string[];
  datamartId: string;
  height: number;
  labelsEnabled?: boolean;
  plotLabels: string[];
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  precision?: QueryPrecisionMode;
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
}

interface State {
  queryResult?: Dataset;
  error: boolean;
  loading: boolean;
}

type Props = CountPieChartProps & InjectedThemeColorsProps & WrappedComponentProps;

class CountPieChart extends React.Component<Props, State> {
  identifier = cuid();

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      error: false,
      loading: true,
    };
  }

  componentDidMount() {
    const { queryIds, datamartId, source } = this.props;

    this.fetchData(queryIds, datamartId, source);
  }

  componentDidUpdate(previousProps: CountPieChartProps) {
    const { queryIds, datamartId, source } = this.props;
    const {
      queryIds: previousChartQueryIds,
      datamartId: previousDatamartId,
      source: previousSource,
    } = previousProps;

    if (
      queryIds !== previousChartQueryIds ||
      datamartId !== previousDatamartId ||
      !_.isEqual(source, previousSource)
    ) {
      this.fetchData(queryIds, datamartId, source);
    }
  }

  formatDataQuery = (otqlResults: OTQLCountResult[], plotLabelName: string, i: number): Dataset => {
    const { colors } = this.props;

    if (otqlResults.length && otqlResults[0].count) {
      const colorArray = Object.keys(colors);
      const color = colorArray[i % colorArray.length];

      return [
        {
          value: otqlResults[0].count,
          key: plotLabelName,
          color: color,
        },
      ];
    }
    return [];
  };

  fetchData = (
    chartQueryIds: string[],
    datamartId: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
    const promises = chartQueryIds.map((chartQueryId, i) => {
      return this.fetchQuery(chartQueryId, datamartId, i, source);
    });
    return Promise.all(promises)
      .then(queryListResp => {
        this.setState({
          loading: false,
          queryResult: queryListResp.reduce((acc, v, i) => {
            return acc.concat(v);
          }, []),
        });
      })

      .catch(() => {
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  fetchQuery = (
    chartQueryId: string,
    datamartId: string,
    plotLabelIndex: number,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<Dataset> => {
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
            if (isCountResult(r.rows)) {
              return Promise.resolve(
                this.formatDataQuery(
                  r.rows,
                  this.props.plotLabels[plotLabelIndex]
                    ? this.props.plotLabels[plotLabelIndex]
                    : plotLabelIndex.toString(),
                  plotLabelIndex,
                ),
              );
            }
            throw new Error('wrong query type');
          });
      });
  };

  public render() {
    const { title, colors, intl, height, queryIds } = this.props;

    const computeChartColors = () => {
      return queryIds.map((q, i) => {
        return colors[
          chartColors[i % (chartColors.length - 1)] as keyof ThemeColorsShape
        ] as string;
      });
    };

    const optionsForChart: PieChartProps = {
      dataset: this.state.queryResult as Dataset,
      colors: computeChartColors(),
      dataLabels: {
        enabled: !!this.props.labelsEnabled,
      },
      isHalf: false,
      innerRadius: true,
      format: 'percentage' as PieChartFormat,
    };

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
        return <PieChart {...optionsForChart} height={height} />;
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, CountPieChartProps>(injectThemeColors, injectIntl)(CountPieChart);
