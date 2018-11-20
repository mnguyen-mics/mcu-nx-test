import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { connect } from 'react-redux';
import {
  ObjectTreeExpressionNodeShape,
  QueryDocument,
} from '../../../models/datamart/graphdb/QueryDocument';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { RouteComponentProps, withRouter } from 'react-router';
import { QueryResult } from '../../QueryTool/JSONOTQL/JSONQLBuilder';
import AutomationBuilder from './AutomationBuilder';

export interface AutomationBuilderContainerProps {
  datamartId: string;
  renderActionBar: (
    queryDocument: QueryDocument,
    datamartId: string,
  ) => React.ReactNode;
  editionLayout?: boolean;
}

interface State {
  queryHistory: {
    past: Array<ObjectTreeExpressionNodeShape | undefined>;
    present: ObjectTreeExpressionNodeShape | undefined;
    future: ObjectTreeExpressionNodeShape[];
  };
  queryResult: QueryResult;
  staleQueryResult: boolean;
}

type Props = AutomationBuilderContainerProps &
InjectedIntlProps &
InjectedNotificationProps &
RouteComponentProps<{ organisationId: string }>;

class AutomationBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      staleQueryResult: false,
      queryResult: {
        loading: false,
      },
      queryHistory: {
        past: [],
        present: undefined,
        future: [],
      },
    };
  }

  handleUpdateQuery = (query: ObjectTreeExpressionNodeShape | undefined) => {
    this.setState(prevState => {
      const newPresent = query;
      return {
        queryHistory: {
          past: [
            ...prevState.queryHistory.past,
            prevState.queryHistory.present,
          ],
          present: newPresent,
          future: [],
        },
        staleQueryResult: true,
        queryResult: {
          ...prevState.queryResult,
          error: undefined,
        },
      };
    });
  };


handleUndo = () => {
  this.setState(prevState => {
    const {
      queryHistory: { past, present, future },
    } = prevState;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    return {
      queryHistory: {
        past: newPast,
        present: previous,
        future: [present!, ...future],
      },
      staleQueryResult: true,
      queryResult: {
        ...prevState.queryResult,
        error: undefined,
      },
    };
  });
};

handleRedo = () => {
  this.setState(prevState => {
    const {
      queryHistory: { past, present, future },
    } = prevState;
    const next = future[0];
    const newFuture = future.slice(1);
    return {
      queryHistory: {
        past: [...past, present!],
        present: next,
        future: newFuture,
      },
      staleQueryResult: true,
      queryResult: {
        ...prevState.queryResult,
        error: undefined,
      },
    };
  });
};
  
  render() {
    const {
      editionLayout,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const {
      queryHistory: { present: query },
      queryResult,
      staleQueryResult,
    } = this.state;
    
    return (
      <Layout className={editionLayout ? 'edit-layout' : ''}>
      <Layout.Content
      className={`mcs-content-container ${editionLayout ? 'flex-basic' : ''}`}
      style={{ padding: 0, overflow: 'hidden' }}
      >
      <AutomationBuilder
      objectTypes={[]}
      query={query}
      updateQuery={this.handleUpdateQuery}
      undoRedo={{
          enableUndo: false,
          enableRedo: false,
          handleUndo: this.handleUndo,
          handleRedo: this.handleRedo,
        }}
      edition={editionLayout}
      staleQueryResult={staleQueryResult}
      queryResult={queryResult}
      datamartId={this.props.datamartId}
      organisationId={organisationId}
      />
      </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AutomationBuilderContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
