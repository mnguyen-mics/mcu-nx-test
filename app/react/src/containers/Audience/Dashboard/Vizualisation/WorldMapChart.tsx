import * as React from 'react';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import WorldMap from '../../../../components/WorldMap';
import { mapData } from '../mapData';

export interface WorldMapChartProps {
  queryId: string;
  datamartId: string;
  title: string;
  reportQueryId: string;
}

interface State {
  queryResult?: number;
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
    };
  }

  componentDidMount() {
    const { queryId, datamartId, reportQueryId } = this.props;

    this.fetchData(datamartId, queryId, reportQueryId);
  }

  componentWillReceiveProps(nextProps: WorldMapChartProps) {
    const { queryId, datamartId, reportQueryId } = this.props;
    const {
      queryId: nextQueryId,
      datamartId: nextDatamartId,
      reportQueryId: nextReportQueryId,
    } = nextProps;

    if (
      queryId !== nextQueryId ||
      datamartId !== nextDatamartId ||
      reportQueryId !== nextReportQueryId
    ) {
      this.fetchData(nextDatamartId, nextQueryId, nextReportQueryId);
    }
  }

  fetchData = (
    datamartId: string,
    queryId: string,
    reportQueryId: string,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

    return this._queryService
      .getQuery(datamartId, queryId)
      .then(res => {
        if (res.data.query_language === 'OTQL' && res.data.query_text) {
          this._queryService
            .getWhereClause(datamartId, queryId)
            .then(clauseResp => {
              this._queryService
                .getQuery(datamartId, reportQueryId)
                .then(reportQueryResp => {
                  const query = {
                    query: reportQueryResp.data.query_text,
                    additional_expression: clauseResp.data,
                  };
                  return this._queryService
                    .runOTQLQuery(datamartId, JSON.stringify(query), {
                      use_cache: true,
                      content_type: `application/json`,
                    })
                    .then(r => r.data)
                    .then(r => {
                      // if (isCountResult(r.rows)) {
                      //   this.setState({ queryResult: r.rows[0].count, loading: false });
                      //   return Promise.resolve();
                      // }
                      const countErr = new Error('wrong query type');
                      return Promise.reject(countErr);
                    });
                });
            })
            .catch(e => this.setState({ error: true, loading: false }));
        }
        const err = new Error('wrong query language');
        return Promise.reject(err);
      })
      .catch(() => {
        this.setState({ error: false, loading: false, queryResult: 127659 });
      });
  };

  public render() {
    return (
      <CardFlex>
        <div className="dashboard-counter">
          <div className="count-title">
            {this.state.loading ? (
              <i
                className="mcs-table-cell-loading"
                style={{ maxWidth: '40%' }}
              />
            ) : (
              this.props.title
            )}
          </div>
          <WorldMap dataset={mapData} />
        </div>
      </CardFlex>
    );
  }
}
