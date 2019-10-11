import * as React from 'react';
import { isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import { formatMetric } from '../../../../utils/MetricHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { getFormattedQuery } from '../domain';

export interface CountProps {
  queryId: string;
  datamartId: string;
  title: string;
  segment?: AudienceSegmentShape;
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
    const { segment, datamartId, queryId } = this.props;
    this.fetchData(queryId, datamartId, segment);
  }

  componentWillReceiveProps(nextProps: CountProps) {
    const { segment, queryId, datamartId } = this.props;
    const {
      segment: nextSegment,
      queryId: nextChartQueryId,
      datamartId: nextDatamartId,
    } = nextProps;

    if (
      segment !== nextSegment ||
      queryId !== nextChartQueryId ||
      datamartId !== nextDatamartId
    ) {
      this.fetchData(nextChartQueryId, nextDatamartId, nextSegment);
    }
  }

  fetchData = (
    chartQueryId: string,
    datamartId: string,
    segment?: AudienceSegmentShape,
  ): Promise<void> => {
    this.setState({ error: false, loading: true });
    return this._queryService
      .getQuery(datamartId, chartQueryId)

      .then(queryResp => {
        return queryResp.data;
      })
      .then(q => {
        return getFormattedQuery(datamartId, this._queryService, q, segment);
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
