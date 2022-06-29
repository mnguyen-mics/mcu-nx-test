import * as React from 'react';
import _ from 'lodash';
import {
  isAggregateResult,
  OTQLBucket,
  QueryPrecisionMode,
} from '../../../../models/datamart/graphdb/OTQLResult';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import CardFlex from '../Components/CardFlex';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { getFormattedQuery } from '../domain';
import messages from './messages';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import {
  QueryExecutionSource,
  QueryExecutionSubSource,
} from '@mediarithmics-private/advanced-components';

export interface TopInfoProps {
  queryId: string;
  datamartId: string;
  title: string;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  precision?: QueryPrecisionMode;
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
}

interface State {
  queryResult?: OTQLBucket[];
  error: boolean;
  loading: boolean;
}

type Props = TopInfoProps & InjectedIntlProps;

class TopInfo extends React.Component<Props, State> {
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
    const { source, datamartId, queryId } = this.props;
    this.fetchData(queryId, datamartId, source);
  }

  componentDidUpdate(previousProps: Props) {
    const { source, queryId, datamartId } = this.props;
    const {
      source: previousSource,
      queryId: previousChartQueryId,
      datamartId: previousDatamartId,
    } = previousProps;

    if (
      !_.isEqual(previousSource, source) ||
      queryId !== previousChartQueryId ||
      datamartId !== previousDatamartId
    ) {
      this.fetchData(queryId, datamartId, source);
    }
  }

  fetchData = (
    chartQueryId: string,
    datamartId: string,
    source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
  ): Promise<void> => {
    const { precision, queryExecutionSource, queryExecutionSubSource } = this.props;
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
          .runOTQLQuery(datamartId, query, queryExecutionSource, queryExecutionSubSource, {
            use_cache: true,
            precision: precision,
          })

          .then(otqlResultResp => {
            return otqlResultResp.data;
          })
          .then(r => {
            if (isAggregateResult(r.rows)) {
              this.setState({
                queryResult:
                  r.rows[0].aggregations.buckets[0] && r.rows[0].aggregations.buckets[0].buckets
                    ? r.rows[0].aggregations.buckets[0].buckets
                    : [],
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

  public renderChart = () => {
    const { intl } = this.props;
    const { loading, error, queryResult } = this.state;
    if (loading) {
      return <LoadingChart />;
    }
    if (error) {
      return <EmptyChart title={intl.formatMessage(messages.error)} icon={'close-big'} />;
    }
    if (!queryResult || queryResult.length === 0) {
      return <EmptyChart title={intl.formatMessage(messages.noData)} icon={'close-big'} />;
    }
    return (
      <div>
        {queryResult.map(qr => {
          return (
            <div key={qr.key} style={{ padding: '5px 5px', width: '100%' }}>
              <div style={{ display: 'inline' }}>{qr.key}</div>
              <div style={{ float: 'right' }}>{qr.count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  public render() {
    return <CardFlex title={this.props.title}>{this.renderChart()}</CardFlex>;
  }
}

export default compose<Props, TopInfoProps>(injectIntl)(TopInfo);
