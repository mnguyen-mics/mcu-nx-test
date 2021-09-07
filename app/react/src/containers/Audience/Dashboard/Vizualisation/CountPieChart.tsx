import * as React from 'react';
import cuid from 'cuid';
import _ from 'lodash';
import { OTQLCountResult, isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, {
  InjectedThemeColorsProps,
  ThemeColorsShape,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { getFormattedQuery } from '../domain';
import { DonutChartOptionsProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/donut-chart/DonutChart';
import {
  Dataset,
  Format,
} from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import {
  DonutChart,
  EmptyChart,
  LoadingChart,
} from '@mediarithmics-private/mcs-components-library';

export interface CountPieChartProps {
  title?: string;
  queryIds: string[];
  datamartId: string;
  height: number;
  labelsEnabled?: boolean;
  plotLabels: string[];
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
}

interface State {
  queryResult?: Dataset;
  error: boolean;
  loading: boolean;
}

type Props = CountPieChartProps & InjectedThemeColorsProps & InjectedIntlProps;

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
          .runOTQLQuery(datamartId, q.query_text, {
            use_cache: true,
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
      const availableColors = Object.keys(colors).filter(c => c !== 'mcs-normal');
      return queryIds.map((q, i) => {
        return colors[
          availableColors[i % (availableColors.length - 1)] as keyof ThemeColorsShape
        ] as string;
      });
    };

    const optionsForChart: DonutChartOptionsProps = {
      colors: computeChartColors(),
      showLabels: this.props.labelsEnabled,
      showTooltip: true,
      isHalf: false,
      innerRadius: true,
      format: 'count' as Format,
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
        return (
          <DonutChart
            dataset={this.state.queryResult as Dataset}
            options={optionsForChart}
            height={height}
          />
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, CountPieChartProps>(injectThemeColors, injectIntl)(CountPieChart);
