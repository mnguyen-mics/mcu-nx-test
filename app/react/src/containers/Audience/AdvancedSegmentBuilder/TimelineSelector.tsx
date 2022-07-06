import * as React from 'react';
import { OTQLDataResult } from '../../../models/datamart/graphdb/OTQLResult';
import { Spin } from 'antd';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';

export interface TimelineSelectorProps {
  getQuery: () => Promise<string>;
  datamartId: string;
  organisationId: string;
  stale: boolean;
  isLoading?: boolean;
}

interface State {
  loading: boolean;
  error: boolean;
  results?: OTQLDataResult[];
}

const messages = defineMessages({
  buttonLabel: {
    id: 'queryBuilder.timelineSelector.button.label',
    defaultMessage: 'View Matching Timeline',
  },
  errorLabel: {
    id: 'queryBuilder.timelineSelector.error.label',
    defaultMessage: 'There is an error with your query',
  },
  noResultsLabel: {
    id: 'queryBuilder.timelineSelector.noResults.label',
    defaultMessage: 'There is no matching timeline for your query',
  },
});

type Props = TimelineSelectorProps & InjectedIntlProps;

class TimelineSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      error: false,
      loading: false,
    };
  }

  runQuery = () => {
    const { organisationId, datamartId, getQuery, stale } = this.props;

    this.setState({
      loading: true,
      error: false,
      results: undefined,
    });

    getQuery().then(queryText =>
      this._queryService
        .runOTQLQuery(datamartId, queryText, 'DASHBOARD', 'ADVANCED_SEGMENT_BUILDER_DASHBOARD', {
          // This is a temporary fix for the view matching timeline
          // It should be removed when the OTQL execution is fixed
          graphql_select: true,
        })
        .then(res => {
          if (res.data.rows.length !== 0 && !stale) {
            window.open(
              `${window.location.origin}/#/v2/o/${organisationId}/audience/timeline/user_point_id/${
                res.data.rows[Math.floor(Math.random() * res.data.rows.length)].id
              }?datamartId=${datamartId}`,
            );
          }
          this.setState({
            loading: false,
            error: false,
            results: res.data.rows,
          });
        })
        .catch(() => {
          this.setState({
            loading: false,
            error: true,
            results: undefined,
          });
        }),
    );
  };

  render() {
    const {
      intl: { formatMessage },
      isLoading,
    } = this.props;
    const onClick = () => this.runQuery();
    return (
      <div
        className='m-t-5 timeline-selector mcs-timelineSelector'
        style={{
          float: 'left',
          padding: '0 8px',
          position: 'relative',
        }}
      >
        {this.state.loading || isLoading ? (
          <Spin size={'small'} />
        ) : (
          <Button onClick={onClick}>{formatMessage(messages.buttonLabel)}</Button>
        )}
        {this.state.error && !this.state.loading && (
          <div className='error'>{formatMessage(messages.errorLabel)}</div>
        )}
        {this.state.results && this.state.results.length === 0 && !this.state.loading && (
          <div className='error'>{formatMessage(messages.noResultsLabel)}</div>
        )}
      </div>
    );
  }
}

export default compose<Props, TimelineSelectorProps>(injectIntl)(TimelineSelector);
