import * as React from 'react';
import QueryService from '../../../../services/QueryService';
import { Card } from '../../../../components/Card';
import { isCountResult } from '../../../../models/datamart/graphdb/OTQLResult';
import { formatMetric } from '../../../../utils/MetricHelper';

export interface CountProps {
  queryId: string;
  datamartId: string;
  title: string;
}

interface State {
  queryResult?: number;
  error: boolean;
  loading: boolean;
}

export default class Count extends React.Component<CountProps, State> {
  constructor(props: CountProps) {
    super(props);
    this.state = {
      error: false,
      loading: true,
    };
  }

  componentDidMount() {
    const { queryId, datamartId } = this.props;

    this.fetchData(datamartId, queryId);
  }

  componentWillReceiveProps(nextProps: CountProps) {
    const { queryId, datamartId } = this.props;
    const { queryId: nextQueryId, datamartId: nextDatamartId } = this.props;

    if (queryId !== nextQueryId || datamartId !== nextDatamartId) {
      this.fetchData(nextDatamartId, nextQueryId);
    }
  }

  fetchData = (datamartId: string, queryId: string): Promise<void> => {
    this.setState({ error: false, loading: true });

    return QueryService.getQuery(datamartId, queryId)
      .then(res => {
        if (res.data.query_language === 'OTQL' && res.data.query_text) {
          return QueryService.runOTQLQuery(datamartId, res.data.query_text)
            .then(r => r.data)
            .then(r => {
              if (isCountResult(r.rows)) {
                this.setState({ queryResult: r.rows[0].count, loading: false });
                return Promise.resolve();
              }
              const countErr = new Error('wrong query type');
              return Promise.reject(countErr);
            })
            .catch(e => this.setState({ error: true, loading: false }));
        }
        const err = new Error('wrong query language');
        return Promise.reject(err);
      })
      .catch(() => {
        this.setState({ error: true, loading: false });
      });
  };

  public render() {
    return (
      <Card className="dashboard-counter">
        <div className="title">
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
          {
            this.state.loading ? (
              <i
              className="mcs-table-cell-loading-large"
              style={{ maxWidth: '100%' }}
            />
            ) : (
              formatMetric(this.state.queryResult, '0,0')
            )
          }
        </div>
      </Card>
    );
  }
}
