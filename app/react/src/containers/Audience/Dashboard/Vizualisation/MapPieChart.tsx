import * as React from 'react';
import cuid from 'cuid';
import _ from 'lodash';
import {
  OTQLAggregationResult,
  isAggregateResult,
  isCountResult,
  OTQLResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { getFormattedQuery } from '../domain';
import {
  DonutChart,
  EmptyChart,
  LoadingChart,
} from '@mediarithmics-private/mcs-components-library';
import { DatasetProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/donut-chart/DonutChart';
import { AudienceBuilderQueryDocument } from '../../../../models/audienceBuilder/AudienceBuilderResource';

export interface MapPieChartProps {
  title?: string;
  source?: AudienceSegmentShape | AudienceBuilderQueryDocument;
  queryId: string;
  data?: OTQLResult;
  datamartId: string;
  showLegend?: boolean;
  labelsEnabled?: boolean;
  height: number;
}

interface State {
  queryResult?: DatasetProps[];
  colors: string[];
  error: boolean;
  loading: boolean;
}

type Props = MapPieChartProps & InjectedThemeColorsProps & InjectedIntlProps;

class MapPieChart extends React.Component<Props, State> {
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
    const { source, queryId, datamartId, data } = this.props;
    if (data) {
      this.formatOtqlQueryResult(data);
    } else {
      this.fetchData(queryId, datamartId, source);
    }
  }

  componentDidUpdate(previousProps: MapPieChartProps) {
    const { source, queryId, datamartId, data } = this.props;
    const {
      source: previousSource,
      queryId: previousChartQueryId,
      datamartId: previousDatamartId,
      data: previousData,
    } = previousProps;

    if (
      !_.isEqual(previousSource, source) ||
      queryId !== previousChartQueryId ||
      datamartId !== previousDatamartId ||
      !_.isEqual(data, previousData)
    ) {
      if (data) {
        this.formatOtqlQueryResult(data);
      } else {
        this.fetchData(queryId, datamartId, source);
      }
    }
  }

  public formatOtqlQueryResult = (r: OTQLResult) => {
    if (r && isAggregateResult(r.rows) && !isCountResult(r.rows)) {
      return this.setState({
        queryResult: this.formatData(r.rows),
        loading: false,
      });
    }
    return this.setState({ error: true, loading: false });
  };

  formatData = (queryResult: OTQLAggregationResult[]): DatasetProps[] => {
    const generateColorIndex = (currentIndex: number) => {
      const { colors } = this.state;
      if (currentIndex < colors.length) {
        return currentIndex;
      } else {
        const times = Math.floor(currentIndex / colors.length);
        return currentIndex - times * colors.length;
      }
    };

    return queryResult.length &&
      queryResult[0].aggregations.buckets.length &&
      queryResult[0].aggregations.buckets[0].buckets.length
      ? queryResult[0].aggregations.buckets[0].buckets.map((data, i) => ({
          key: data.key,
          value: data.count,
          color: this.state.colors[generateColorIndex(i)],
        }))
      : [];
  };

  fetchData = (
    chartQueryId: string,
    datamartId: string,
    source?: AudienceSegmentShape | AudienceBuilderQueryDocument,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

    return this._queryService
      .getQuery(datamartId, chartQueryId)

      .then(queryResp => {
        return queryResp.data;
      })
      .then(q => {
        return getFormattedQuery(datamartId, this._queryService, q, source);
      })
      .then(q => {
        const query = q.query_text;
        return this._queryService
          .runOTQLQuery(datamartId, query, {
            use_cache: true,
          })
          .then(otqlResultResp => {
            return otqlResultResp.data;
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
          });
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
      text: {
        text: '',
        value: '',
      },
      colors: this.state.colors,
      showTooltip: true,
      height: 300,
      showLabels: this.props.labelsEnabled,
    };
    return options;
  };

  public render() {
    const { intl, height } = this.props;

    const pieChartsOptions = this.generateOptions();

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
          <DonutChart dataset={this.state.queryResult} options={pieChartsOptions} height={height} />
        );
      }
    };

    return <CardFlex title={this.props.title}>{generateChart()}</CardFlex>;
  }
}

export default compose<Props, MapPieChartProps>(injectThemeColors, injectIntl)(MapPieChart);
