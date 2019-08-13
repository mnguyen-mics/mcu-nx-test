import * as React from 'react';
import { isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import { formatMetric } from '../../../../utils/MetricHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';

export interface CountProps {
  segmentQueryId: string;
  chartQueryId: string;
  datamartId: string;
  title: string;
}

interface State {
  queryResult?: number;
  error: boolean;
  loading: boolean;
}

export default class Count extends React.Component<CountProps, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: CountProps) {
    super(props);
    this.state = {
      error: false,
      loading: true,
    };
  }

  componentDidMount() {
    const { segmentQueryId, chartQueryId, datamartId } = this.props;

    this.fetchData(datamartId, segmentQueryId, chartQueryId);
  }

  componentWillReceiveProps(nextProps: CountProps) {
    const { segmentQueryId, chartQueryId, datamartId } = this.props;
    const {
      segmentQueryId: nextSegmentQueryId,
      datamartId: nextDatamartId,
      chartQueryId: nextChartQueryId,
    } = nextProps;

    if (
      segmentQueryId !== nextSegmentQueryId ||
      datamartId !== nextDatamartId ||
      chartQueryId !== nextChartQueryId
    ) {
      this.fetchData(nextDatamartId, nextSegmentQueryId, nextChartQueryId);
    }
  }

  fetchData = (
    datamartId: string,
    segmentQueryId: string,
    chartQueryId: string,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });

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
                if (isCountResult(r.rows)) {
                  this.setState({
                    queryResult: r.rows[0].count,
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
        this.setState({
          error: true,
          loading: false,
        });
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
          <div className="count-result">
            {this.state.loading ? (
              <i
                className="mcs-table-cell-loading-large"
                style={{ maxWidth: '100%' }}
              />
            ) : (
              formatMetric(this.state.queryResult, '0,0')
            )}
          </div>
        </div>
      </CardFlex>
    );
  }
}
