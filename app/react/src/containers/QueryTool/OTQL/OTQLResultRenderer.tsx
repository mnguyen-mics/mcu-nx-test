import * as React from 'react';
import { Spin, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import CountUp from 'react-countup';
import {
  OTQLResult,
  isCountResult,
  isAggregateResult,
} from '../../../models/datamart/graphdb/OTQLResult';
import { Card } from '@mediarithmics-private/mcs-components-library';
import AggregationRenderer from './AggregationRenderer';
import injectThemeColors, { InjectedThemeColorsProps } from '../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';

export interface OTQLResultRendererProps {
  result: OTQLResult | null;
  loading?: boolean;
  aborted?: boolean;
}

type Props = OTQLResultRendererProps & InjectedThemeColorsProps & InjectedFeaturesProps;

class OTQLResultRenderer extends React.Component<Props> {
  render() {
    const { result, loading, aborted, colors, hasFeature } = this.props;

    let content: React.ReactNode;
    if (loading) {
      content = (
        <div className='text-center'>
          <Spin size='large' />
        </div>
      );
    } else if (aborted) {
      content = (
        <div className='text-center'>
          <FormattedMessage
            id='queryTool.otql-result-renderer-aborted'
            defaultMessage='Aborted...'
          />
        </div>
      );
    } else if (result && isCountResult(result.rows)) {
      const count = result.rows[0].count;
      content = (
        <div className='text-center' style={{ fontSize: '5em' }}>
          <CountUp start={0} end={count} separator=',' decimal='.' duration={0.5} />
        </div>
      );
    } else if (result && isAggregateResult(result.rows)) {
      const aggregations = result.rows[0].aggregations;
      content = (
        <div>
          <AggregationRenderer rootAggregations={aggregations} />
        </div>
      );
    } else if (result) {
      content = (
        <div>
          <pre>{JSON.stringify(result.rows, null, 2)}</pre>
        </div>
      );
    } else {
      content = (
        <div className='text-center'>
          <FormattedMessage
            id='queryTool.otql-result-renderer-empty'
            defaultMessage='Empty Result'
          />
        </div>
      );
    }

    return !hasFeature('query-tool-graphs') || !(result && isAggregateResult(result.rows)) ? (
      <Card
        title={
          <FormattedMessage
            id='queryTool.otql-result-renderer-card-title'
            defaultMessage='Result'
          />
        }
        buttons={
          result ? (
            <React.Fragment>
              <Tag color={colors['mcs-info']}>
                <FormattedMessage
                  id='otql-result-renderer-card-subtitle-duration'
                  defaultMessage='Took {duration}ms'
                  values={{ duration: result.took }}
                />
              </Tag>
              {result.cache_hit && (
                <Tag color={colors['mcs-success']}>
                  <FormattedMessage
                    id='otql-result-renderer-card-subtitle-cache'
                    defaultMessage='From Cache'
                  />
                </Tag>
              )}
            </React.Fragment>
          ) : undefined
        }
      >
        {content}
      </Card>
    ) : (
      <div className='mcs-otqlQuery_result'>
        {result ? (
          <React.Fragment>
            <Tag color='blue' className='mcs-otqlQuery_result_tag'>
              <FormattedMessage
                id='otql-result-renderer-card-subtitle-duration'
                defaultMessage='Took {duration}ms'
                values={{ duration: result.took }}
              />
            </Tag>
            {result.cache_hit && (
              <Tag color={colors['mcs-success']}>
                <FormattedMessage
                  id='otql-result-renderer-card-subtitle-cache'
                  defaultMessage='From Cache'
                />
              </Tag>
            )}
          </React.Fragment>
        ) : undefined}
        {content}
      </div>
    );
  }
}

export default compose<Props, OTQLResultRendererProps>(
  injectThemeColors,
  injectFeatures,
)(OTQLResultRenderer);
