import * as React from 'react';
import _ from 'lodash';
import { isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import { formatMetric } from '../../../../utils/MetricHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { getFormattedQuery } from '../domain';
import { QueryDocument } from '../../../../models/datamart/graphdb/QueryDocument';

export interface PercentageProps {
  queryId: string;
  totalQueryId: string;
  datamartId: string;
  title: string;
  source?: AudienceSegmentShape | QueryDocument;
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
    const { source, datamartId, queryId, totalQueryId } = this.props;
    this.fetchData(queryId, totalQueryId, datamartId, source);
  }

  componentDidUpdate(previousProps: PercentageProps) {
    const { source, queryId, datamartId, totalQueryId } = this.props;
    const {
      source: previousSource,
      queryId: previousChartQueryId,
      datamartId: previousDatamartId,
      totalQueryId: previousTotalQueryId,
    } = previousProps;

    if (
      !_.isEqual(previousSource, source) ||
      queryId !== previousChartQueryId ||
      datamartId !== previousDatamartId ||
      totalQueryId !== previousTotalQueryId
    ) {
      this.fetchData(queryId, totalQueryId, datamartId, source);
    }
  }

  fetchData = (
    chartQueryId: string,
    totalQueryId: string,
    datamartId: string,
    source?: AudienceSegmentShape | QueryDocument,
  ): Promise<void> => {
    return Promise.all([
      this.fetchQuery(chartQueryId, datamartId, source),
      this.fetchQuery(totalQueryId, datamartId, source),
    ])
      .then(q => {
        const left = q[0];
        const right = q[1];
        if (typeof left === 'number' && typeof right === 'number') {
          this.setState({
            queryResult: Math.round((left / right) * 1000) / 10,
            loading: false,
          });
        }
        return Promise.reject(new Error('Error'));
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
    source?: AudienceSegmentShape | QueryDocument,
  ): Promise<number | void> => {
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
            if (isCountResult(r.rows)) {
              return r.rows[0].count as number;
            }
            throw new Error('wrong query type');
          });
      });
  };

  public render() {
    return (
      <CardFlex>
        <div className='dashboard-counter'>
          <div className='count-title'>{this.props.title}</div>
          <div className='count-result'>
            {this.state.loading ? (
              <i className='mcs-table-cell-loading-large' style={{ maxWidth: '100%' }} />
            ) : (
              formatMetric(this.state.queryResult, '0,0', '', '%')
            )}
          </div>
        </div>
      </CardFlex>
    );
  }
}
