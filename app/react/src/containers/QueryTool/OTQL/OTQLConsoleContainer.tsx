import * as React from 'react';
import { Layout, Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import {
  FormattedMessage,
  injectIntl,
  InjectedIntlProps,
  defineMessages,
} from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import ActionBar from '../../../components/ActionBar';
import ContentHeader from '../../../components/ContentHeader';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import QueryService from '../../../services/QueryService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import OTQLResultRenderer from './OTQLResultRenderer';
import OTQLInputEditor from './OTQLInputEditor';
import { DataResponse } from '../../../services/ApiService';

const { Content } = Layout;

export interface OTQLConsoleContainerProps {
  datamartId: string;
}

interface State {
  queryResult: OTQLResult | null;
  runningQuery: boolean;
  queryAborted: boolean;
  error: any | null;
}

type Props =
  OTQLConsoleContainerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class OTQLConsoleContainer extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  constructor(props: Props) {
    super(props);
    this.state = {
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
    };
  }

  runQuery = (otqlQuery: string) => {
    const { datamartId } = this.props;

    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
      queryResult: null,
    });
    this.asyncQuery = makeCancelable(
      QueryService.runOTQLQuery(datamartId, otqlQuery),
    );
    this.asyncQuery.promise
      .then(result => {
        this.setState({ runningQuery: false, queryResult: result.data });
      })
      .catch(error => {
        this.setState({
          error: !error.isCanceled ? error : null,
          runningQuery: false,
        });
      });
  };

  abortQuery = () => {
    this.asyncQuery.cancel();
    this.setState({ queryAborted: true, runningQuery: false });
  };

  dismissError = () => this.setState({ error: null });

  render() {
    const { intl } = this.props;
    const { error, queryResult, runningQuery, queryAborted } = this.state;

    const errorMsg = error && (
      <Alert
        message="Error"
        style={{ marginBottom: 40 }}
        description={
          error.error_id ? (
            <span>
              {error.error}
              <br />
              <code>{error.error_id}</code>
            </span>
          ) : (
              intl.formatMessage(messages.queryErrorDefaultMsg)
            )
        }
        type="error"
        showIcon={true}
        closable={true}
        onClose={this.dismissError}
      />
    );

    const queryResultRenderer: React.ReactNode = (runningQuery ||
      queryAborted ||
      queryResult) && (
        <OTQLResultRenderer
          loading={runningQuery}
          result={queryResult}
          aborted={queryAborted}
        />
      );

    return (
      <Layout>
        <ActionBar
          paths={[
            { name: intl.formatMessage(messages.queryToolBreadcrumbLabel) },
          ]}
        />
        <Content className="mcs-content-container">
          <ContentHeader
            title={
              <FormattedMessage
                id="query-tool-page-title"
                defaultMessage="Query Tool"
              />
            }
          />
          {errorMsg}
          <OTQLInputEditor
            onRunQuery={this.runQuery}
            onAbortQuery={this.abortQuery}
            runningQuery={runningQuery}
          />
          {queryResultRenderer}
        </Content>
      </Layout>
    );
  }
}

export default compose<Props, OTQLConsoleContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(OTQLConsoleContainer);

const messages = defineMessages({
  queryToolBreadcrumbLabel: {
    id: 'query-tool-action-bar-breadcrumb-label-query-tool',
    defaultMessage: 'Query Tool',
  },
  queryErrorDefaultMsg: {
    id: 'query-tool-error-default-message',
    defaultMessage: 'An error occured',
  },
});
