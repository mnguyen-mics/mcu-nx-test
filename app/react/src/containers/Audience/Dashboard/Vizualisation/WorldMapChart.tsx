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
  queryId: string;
  datamartId: string;
  title: string;
  clauseId: string;
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
    const { queryId, datamartId, clauseId } = this.props;

    this.fetchData(datamartId, queryId, clauseId);
  }

  componentWillReceiveProps(nextProps: WorldMapChartProps) {
    const { queryId, datamartId, clauseId } = this.props;
    const {
      queryId: nextQueryId,
      datamartId: nextDatamartId,
      clauseId: nextClauseId,
    } = nextProps;

    if (
      queryId !== nextQueryId ||
      datamartId !== nextDatamartId ||
      clauseId !== nextClauseId
    ) {
      this.fetchData(nextDatamartId, nextQueryId, nextClauseId);
    }
  }

  formatData = (queryResult: OTQLAggregationResult[]): any => {
    // to type better
    // return [
    //   {
    //     code3: 'USA',
    //     name: 'United States',
    //     value: 35.32,
    //     code: 'US',
    //   },
    // ];

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

  fetchData = (
    datamartId: string,
    segmentQueryId: string,
    chartQueryId: string,
  ): Promise<void> => {
    this.setState({ error: false });

    return this._queryService
      .getWhereClause(datamartId, segmentQueryId)
      .then(clauseResp => {
        return this._queryService
          .getQuery(datamartId, chartQueryId)

          .then(queryResp => {
            return queryResp.data;
          })
          .then(q => {
            const query = {
              query: q.query_text,
              additional_expression: clauseResp,
            };
            return this._queryService
              .runOTQLQuery(datamartId, JSON.stringify(query), {
                use_cache: true,
                content_type: `application/json`,
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
          });
      })
      .catch(() => {
        this.setState({ error: false, loading: false });
      });
  };

  generateChart = () => {
    const { loading } = this.state;
    const { mapData } = this.state;
    if (!loading && mapData) {
      return <WorldMap dataset={mapData} />;
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
