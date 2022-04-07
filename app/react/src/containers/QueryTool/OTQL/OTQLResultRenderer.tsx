import * as React from 'react';
import { Spin, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import {
  OTQLResult,
  isCountResult,
  isAggregateResult,
} from '../../../models/datamart/graphdb/OTQLResult';
import AggregationRenderer from './AggregationRenderer';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { CountRenderer } from './CountRenderer';
import { RouteComponentProps, withRouter } from 'react-router';

export interface OTQLResultRendererProps {
  result: OTQLResult | null;
  loading?: boolean;
  aborted?: boolean;
  query?: string;
  datamartId: string;
}

type Props = OTQLResultRendererProps &
  InjectedThemeColorsProps &
  InjectedFeaturesProps &
  RouteComponentProps<{ organisationId: string }>;

class OTQLResultRenderer extends React.Component<Props> {
  render() {
    const {
      result,
      loading,
      aborted,
      colors,
      hasFeature,
      query,
      datamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;

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
      content = <CountRenderer count={count} />;
    } else if (result && isAggregateResult(result.rows)) {
      const aggregations = result.rows[0].aggregations;
      content = (
        <div>
          <AggregationRenderer
            rootAggregations={aggregations}
            query={query}
            datamartId={datamartId}
            organisationId={organisationId}
          />
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
      <div className='mcs-otqlQuery_result'>
        {result && (
          <React.Fragment>
            <Tag className='mcs-otqlQuery_result_tag'>
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
        )}
        {content}
      </div>
    ) : (
      <div className='mcs-otqlQuery_result'>
        {result ? (
          <React.Fragment>
            <Tag className='mcs-otqlQuery_result_tag'>
              <FormattedMessage
                id='otql-result-renderer-card-subtitle-duration2'
                defaultMessage='Took {duration}ms'
                values={{ duration: result.took }}
              />
            </Tag>
            {result.cache_hit && (
              <Tag color={colors['mcs-success']}>
                <FormattedMessage
                  id='otql-result-renderer-card-subtitle-cache2'
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
  withRouter,
)(OTQLResultRenderer);
