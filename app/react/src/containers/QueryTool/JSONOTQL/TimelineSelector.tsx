import * as React from 'react';
import { ObjectTreeExpressionNodeShape, QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import OTQLService from '../../../services/OTQLService';
import { OTQLDataResult } from '../../../models/datamart/graphdb/OTQLResult';
import { Spin } from 'antd';
import { ButtonStyleless } from '../../../components';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

export interface TimelineSelectorProps {
  query: ObjectTreeExpressionNodeShape | undefined;
  datamartId: string;
  organisationId: string;
  stale: boolean;
}

interface State {
  loading: boolean;
  error: boolean;
  results?: OTQLDataResult[];
}

const messages = defineMessages({
  buttonLabel: {
    id: 'queryBuilder.timelineSelector.button.label',
    defaultMessage: 'View Random Timeline'
  },
  errorLabel: {
    id: 'queryBuilder.timelineSelector.error.label',
    defaultMessage: 'There is an error with your query'
  }
})

type Props = TimelineSelectorProps & InjectedIntlProps

class TimelineSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      error: false,
      loading: false
    }
  }

  runQuery = () => {
    const { organisationId, datamartId, query, stale } = this.props;
    const { results } = this.state;
    const queryDocument: QueryDocument = {
      operations: [{ directives: [{name: 'select'}], selections: [] }],
      from: 'UserPoint',
      where: query,
    };
    if (!stale && results && results.length) {
      window.open(`${window.location.origin}/#/v2/o/${organisationId }/audience/timeline/user_point_id/${results[Math.floor(Math.random()*results.length)]}?datamart_id=${datamartId}`);
    } else {
      this.setState({
        loading: true,
        error: false,
        results: undefined
      });
      OTQLService.runJSONOTQLQuery(datamartId, queryDocument)
        .then(res => {
          window.open(`${window.location.origin}/#/v2/o/${organisationId }/audience/timeline/user_point_id/${res.data.rows[Math.floor(Math.random()*res.data.rows.length)]}?datamart_id=${datamartId}`);
          this.setState({
            loading: false,
            error: false,
            results: res.data.rows
          });
        })
        .catch(() => {
          this.setState({
            loading: false,
            error: true,
            results: undefined
          });
        });
    }
    
  };
  

  render() {
    const { intl: { formatMessage } } = this.props;
    const onClick = () => this.runQuery()
    return (
      <div
      className="m-t-5 timeline-selector"
      style={{
        float: 'left',
        padding: '0 8px',
        position: 'relative',
      }}>
        {this.state.loading ? <Spin size={'small'} /> : <ButtonStyleless onClick={onClick}>{formatMessage(messages.buttonLabel)}</ButtonStyleless>}
        {this.state.error && <div className="error">{formatMessage(messages.errorLabel)}</div>}
      </div>
    );
  }
}

export default compose<Props, TimelineSelectorProps>(injectIntl)(TimelineSelector);
