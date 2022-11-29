import * as React from 'react';
import { OTQLCountResult } from '../../../models/datamart/graphdb/OTQLResult';
import { QueryResult } from './AdvancedSegmentBuilder';
import Counter from './Counter';
import TimelineSelector from './TimelineSelector';

export interface CounterListProps {
  queryResults: QueryResult[];
  staleQueryResult: boolean;
  onRefresh: () => void;
  getQuery: () => Promise<string>;
  datamartId: string;
  organisationId: string;
  editionLayout?: boolean;
  hideCounterAndTimeline?: boolean;
}

export default class CounterList extends React.Component<CounterListProps, any> {
  generateWidth = () => {
    const { queryResults } = this.props;
    if (queryResults.length === 1) {
      return '100%';
    } else if (queryResults.length > 1 && queryResults.length < 6) {
      return `${100 / queryResults.length}%`;
    }
    return '20%';
  };

  render() {
    const {
      queryResults,
      staleQueryResult,
      onRefresh,
      organisationId,
      editionLayout,
      hideCounterAndTimeline,
      getQuery,
      datamartId,
    } = this.props;
    if (queryResults.length === 0) {
      return null;
    }
    const style: React.CSSProperties = editionLayout ? {} : { position: 'relative', height: 0 };

    const timelineSelector = !hideCounterAndTimeline && (
      <TimelineSelector
        stale={staleQueryResult}
        datamartId={datamartId}
        getQuery={getQuery}
        organisationId={organisationId}
      />
    );

    return (
      <div style={style}>
        <div
          style={{
            position: 'absolute',
            padding: '0px 40px',
            left: 0,
            zIndex: 10000,
            display: 'inline-block',
            width: queryResults.length <= 5 ? `${20 * queryResults.length}%` : '100%',
            cursor: 'auto',
          }}
        >
          {queryResults.map((v, i) => {
            const value =
              v.otqlResult && v.otqlResult.rows.length > 0
                ? (v.otqlResult.rows[0] as OTQLCountResult).count
                : undefined;
            const error = v.error || (v.otqlResult ? v.otqlResult.timed_out : undefined);
            return (
              <Counter
                key={i}
                name='UserPoint'
                value={value}
                loading={v.loading}
                stale={staleQueryResult}
                width={this.generateWidth()}
                onRefresh={onRefresh}
                error={error}
                hideValue={hideCounterAndTimeline}
              />
            );
          })}
          {timelineSelector}
        </div>
      </div>
    );
  }
}
