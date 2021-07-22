import * as React from 'react';
import cuid from 'cuid';
import _ from 'lodash';
import { OTQLCountResult, isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { getFormattedQuery } from '../domain';
import {
  EmptyChart,
  LoadingChart,
  StackedBarChart,
} from '@mediarithmics-private/mcs-components-library';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';

export interface CountBarChartProps {
  title?: string;
  queryIds: string[];
  datamartId: string;
  height: number;
  labelsEnabled?: boolean;
  plotLabels: string[];
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
}

interface QueryResult {
  xKey: number | string;
  yKey: number | string;
  color: string;
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
    const { queryIds, datamartId, source } = this.props;

    this.fetchData(queryIds, datamartId, source);
  }

  componentDidUpdate(previousProps: CountBarChartProps) {
    const { queryIds, datamartId, source } = this.props;
    const {
      queryIds: previousChartQueryIds,
      datamartId: previousDatamartId,
      source: previousSource,
    } = previousProps;

    if (
      !_.isEqual(source, previousSource) ||
      queryIds !== previousChartQueryIds ||
      datamartId !== previousDatamartId
    ) {
      this.fetchData(queryIds, datamartId, source);
    }
  }

  formatDataQuery = (
    otqlResults: OTQLCountResult[],
    plotLabelName: string,
    i: number,
  ): QueryResult[] => {
    const { colors } = this.props;

    if (otqlResults.length && otqlResults[0].count) {
      const colorArray = Object.keys(colors);
      const color = colorArray[i % colorArray.length];

      return [
        {
          yKey: otqlResults[0].count,
          xKey: plotLabelName,
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
  ): Promise<QueryResult[]> => {
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
      yKeys: [{ key: 'yKey', message: '' }],
      colors: [colors['mcs-info']],
      labelsEnabled: this.props.labelsEnabled,
      showTooltip: true,
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
          <StackedBarChart
            dataset={this.state.queryResult as any}
            options={optionsForChart}
            height={height}
          />
        );
      }
    };

    return <CardFlex title={title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, CountBarChartProps>(injectThemeColors, injectIntl)(CountBarChart);
