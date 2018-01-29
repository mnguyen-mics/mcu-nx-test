import * as React from 'react';
import { Spin } from 'antd';
import { FormattedMessage } from 'react-intl';
import CountUp from 'react-countup';
import {
  OTQLResult,
  isCountResult,
  isAggregateResult,
} from '../../../models/datamart/graphdb/OTQLResult';
import { Card } from '../../../components/Card/index';

export interface Props {
  result: OTQLResult | null;
  loading?: boolean;
  aborted?: boolean;
}

class OTQLResultRenderer extends React.Component<Props> {
  render() {
    const { result, loading, aborted } = this.props;

    let content: React.ReactNode;
    if (loading) {
      content = (
        <div className="text-center">
          <Spin size="large" />
        </div>
      );
    } else if (aborted) {
      content = (
        <div className="text-center">
          <FormattedMessage
            id="otql-result-renderer-aborted"
            defaultMessage="Aborted..."
          />
        </div>
      );
    } else if (result && isCountResult(result.rows)) {
      const count = result.rows[0].count;
      content = (
        <div className="text-center" style={{ fontSize: '5em' }}>
          <CountUp
            start={0}
            end={count}
            separator=","
            decimal="."
            duration={0.5}
          />
        </div>
      );
    } else if (result) {
      // else if (result && isAggregateResult(result.rows)) {
      //   const count = result.rows[0].aggregations;
      //   content = (

      //   );
      // }
      content = (
        <div>
          <pre>{JSON.stringify(result.rows, null, 2)}</pre>
        </div>
      );
    } else {
      content = (
        <div className="text-center">
          <FormattedMessage
            id="otql-result-renderer-empty"
            defaultMessage="Empty Result"
          />
        </div>
      );
    }

    return (
      <Card
        title={
          <FormattedMessage
            id="otql-result-renderer-card-title"
            defaultMessage="Result"
          />
        }
        buttons={
          result && (
            <FormattedMessage
              id="otql-result-renderer-card-subtitle"
              defaultMessage="Took {duration}ms"
              values={{ duration: result.took }}
            />
          )
        }
      >
        {content}
      </Card>
    );
  }
}

export default OTQLResultRenderer;
