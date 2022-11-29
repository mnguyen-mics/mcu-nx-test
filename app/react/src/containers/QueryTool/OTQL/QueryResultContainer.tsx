import * as React from 'react';
import { Spin, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import {
  isAggregateResult,
  isAggregateDataset,
  isOTQLResult,
  isCountDataset,
  isJsonDataset,
} from '../../../models/datamart/graphdb/OTQLResult';
import QueryResultRenderer from './QueryResultRenderer';
import { compose } from 'recompose';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { McsTabsItem } from './QueryToolTabsContainer';
import { QueryToolJsonResultRenderer } from './QueryToolJsonResultRenderer';
import { ChartResource } from '@mediarithmics-private/advanced-components/lib/models/chart/Chart';

export interface QueryResultContainerProps {
  tab: McsTabsItem;
  query?: string;
  datamartId: string;
  onSaveChart?: (chart: ChartResource) => void;
  onDeleteChart: () => void;
}

type Props = QueryResultContainerProps &
  InjectedThemeColorsProps &
  RouteComponentProps<{ organisationId: string }>;

class QueryResultContainer extends React.Component<Props> {
  render() {
    const {
      tab,
      colors,
      query,
      datamartId,
      match: {
        params: { organisationId },
      },
      onDeleteChart,
      onSaveChart,
    } = this.props;
    const result = tab.queryResult;

    let content: React.ReactNode;
    if (tab.runningQuery) {
      content = (
        <div className='text-center m-t-20'>
          <Spin size='large' />
        </div>
      );
    } else if (tab.queryAborted) {
      content = (
        <div className='text-center'>
          <FormattedMessage
            id='queryTool.otql-result-renderer-aborted'
            defaultMessage='Aborted...'
          />
        </div>
      );
    } else if (result) {
      const commonProps = {
        tab,
        query,
        datamartId,
        organisationId,
        onSaveChart,
        onDeleteChart,
      };
      // This first condition should not be useful anymore
      if (isOTQLResult(result) && isAggregateResult(result.rows)) {
        content = <QueryResultRenderer datasource={result.rows[0].aggregations} {...commonProps} />;
      } else if (isAggregateDataset(result) || isCountDataset(result)) {
        content = <QueryResultRenderer datasource={result} {...commonProps} />;
      } else if (isJsonDataset(result)) {
        content = (
          <div className='mcs-otqlQuery_result_json'>
            <QueryToolJsonResultRenderer rows={result.rows} organisationId={organisationId} />
          </div>
        );
      }
    }

    return (
      <div className='mcs-otqlQuery_result'>
        {result && isOTQLResult(result) && (
          <div className='mcs-otqlQuery_result_tag_container'>
            <>
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
            </>
          </div>
        )}
        {content}
      </div>
    );
  }
}

export default compose<Props, QueryResultContainerProps>(
  injectThemeColors,
  withRouter,
)(QueryResultContainer);
