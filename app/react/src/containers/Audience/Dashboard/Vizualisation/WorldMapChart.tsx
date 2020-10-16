import * as React from 'react';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import WorldMap, { MapData } from '../../../../components/WorldMap';
import {
  isAggregateResult,
  isCountResult,
  OTQLAggregationResult,
} from '../../../../models/datamart/graphdb/OTQLResult';
import { mapData2 } from '../mapData';

export interface WorldMapChartProps {
  title: string;
  queryId: string;
  datamartId: string;
  height: number;
}

interface State {
  mapData: MapData[];
  error: boolean;
  loading: boolean;
}

export default class WorldMapChart extends React.Component<
  WorldMapChartProps,
  State
> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: WorldMapChartProps) {
    super(props);
    this.state = {
      error: false,
      loading: true,
      mapData: mapData2,
    };
  }

  componentDidMount() {
    const { queryId, datamartId } = this.props;
    this.fetchData(queryId, datamartId);
  }

  componentDidUpdate(previousProps: WorldMapChartProps) {
    const { queryId, datamartId } = this.props;
    const {
      queryId: previousChartQueryId,
      datamartId: previousDatamartId,
    } = previousProps;

    if (queryId !== previousChartQueryId || datamartId !== previousDatamartId) {
      this.fetchData(queryId, datamartId);
    }
  }

  formatData = (queryResult: OTQLAggregationResult[]): any => {
    return queryResult.length &&
      queryResult[0].aggregations.buckets.length &&
      queryResult[0].aggregations.buckets[0].buckets.length
      ? queryResult[0].aggregations.buckets[0].buckets.map((data, i) => {
          const countryData = mapData2.find(md => md.code === data.key);
          return {
            code3: countryData ? countryData.code3 : '',
            name: 'country name',
            value: data.count,
            code: data.key,
          };
        })
      : [];
  };

  fetchData = (chartQueryId: string, datamartId: string): Promise<void> => {
    this.setState({ error: false });
    return this._queryService
      .getQuery(datamartId, chartQueryId)

      .then(queryResp => {
        return queryResp.data;
      })
      .then(q => {
        return this._queryService
          .runOTQLQuery(datamartId, q.query_text, {
            use_cache: true,
          })

          .then(otqlResultResp => {
            return otqlResultResp.data;
          })
          .then(r => {
            if (isAggregateResult(r.rows) && !isCountResult(r.rows)) {
              this.setState({
                mapData: this.formatData(r.rows),
                loading: false,
              });
              return Promise.resolve();
            }
            const countErr = new Error('wrong query type');
            return Promise.reject(countErr);
          });
      })
      .catch(() => {
        this.setState({ error: false, loading: false });
      });
  };

  generateChart = () => {
    const { loading, mapData } = this.state;
    const { height } = this.props;
    if (!loading && mapData) {
      return <WorldMap dataset={mapData} height={height} />;
    }
    return;
  };

  public render() {
    return (
      <CardFlex title={this.props.title}>
        <div style={{ width: '100%' }}>{this.generateChart()}</div>
      </CardFlex>
    );
  }
}
