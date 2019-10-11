import * as React from 'react';
import { isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import { formatMetric } from '../../../../utils/MetricHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { getFormattedQuery } from '../domain';

export interface PercentageProps {
  queryId: string;
  totalQueryId: string;
  datamartId: string;
  title: string;
  segment?: AudienceSegmentShape;
}

interface State {
  queryResult?: number | string;
  error: boolean;
  loading: boolean;
}

export default class Percentage extends React.Component<PercentageProps, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: PercentageProps) {
    super(props);
    this.state = {
      error: false,
      loading: true,
    };
  }

  componentDidMount() {
    const { segment, datamartId, queryId, totalQueryId } = this.props;
    this.fetchData(queryId, totalQueryId, datamartId, segment);
  }

  componentWillReceiveProps(nextProps: PercentageProps) {
    const { segment, queryId, datamartId, totalQueryId } = this.props;
    const {
      segment: nextSegment,
      queryId: nextChartQueryId,
      datamartId: nextDatamartId,
      totalQueryId: nextTotalQueryId
    } = nextProps;

    if (
      segment !== nextSegment ||
      queryId !== nextChartQueryId ||
      datamartId !== nextDatamartId ||
      totalQueryId !== nextTotalQueryId
    ) {
      this.fetchData(nextChartQueryId, nextTotalQueryId, nextDatamartId, nextSegment);
    }
  }

  fetchData = (
    chartQueryId: string,
    totalQueryId: string,
    datamartId: string,
    segment?: AudienceSegmentShape,
  ): Promise<void> => {
    return Promise.all([
      this.fetchQuery(chartQueryId, datamartId, segment),
      this.fetchQuery(totalQueryId, datamartId, segment)
    ])
    .then(q => {
      const left = q[0]
      const right = q[1];
      if (typeof left === "number" &&  typeof right === "number") {
        this.setState({
          queryResult: Math.round(left / right * 1000) / 10,
          loading: false,
        });
      }
      return Promise.reject(new Error("Error"))
    })
    .catch(() => {
      this.setState({
        error: true,
        loading: false,
      });
    });
  }

  fetchQuery = (
    chartQueryId: string,
    datamartId: string,
    segment?: AudienceSegmentShape,
  ): Promise<number | void> => {
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
              return r.rows[0].count as number
            }
            throw new Error('wrong query type');
          });
      })
     
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
              formatMetric(this.state.queryResult, '0,0', "", "%")
            )}
          </div>
        </div>
      </CardFlex>
    );
  }
}
