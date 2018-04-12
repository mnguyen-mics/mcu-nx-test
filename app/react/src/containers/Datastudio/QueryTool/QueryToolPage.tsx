import * as React from 'react';
import { Layout, Alert, Button, Menu, Modal, Input } from 'antd';
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
import OTQLService from '../../../services/OTQLService';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import OTQLResultRenderer from './OTQLResultRenderer';
import OTQLInputEditor from './OTQLInputEditor';
import { DataResponse } from '../../../services/ApiService';
import { withRouter, RouteComponentProps } from 'react-router';
import AngularWidget from './AngularWidget';
import { ClickParam } from 'antd/lib/menu';
import ExportsService from '../../../services/Library/ExportsService';
import { Export } from '../../../models/exports/exports';
import { Dropdown } from '../../../components/PopupContainers';

const { Content } = Layout;

interface ExportModalProps {
  visible: boolean;
  exportName: string;
  loading: boolean;
}

interface State {
  queryResult: OTQLResult | null;
  runningQuery: boolean;
  queryAborted: boolean;
  error: any | null;
  container: any;
  exportModal: ExportModalProps;
}

type Props = InjectedIntlProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class QueryToolPage extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  constructor(props: Props) {
    super(props);
    this.state = {
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
      container: null,
      exportModal: {
        visible: false,
        exportName: '',
        loading: false,
      },
    };
  }

  runQuery = (otqlQuery: string) => {
    const { datamart } = this.props;

    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
      queryResult: null,
    });
    this.asyncQuery = makeCancelable(
      OTQLService.runQuery(datamart.id, otqlQuery),
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

  getContainer = (container: any) =>
    this.state.container ? null : this.setState({ container });

  handleOk = () => {
    this.setState(
      { exportModal: { ...this.state.exportModal, loading: true } },
      () => {
        this.state.container
          .saveOrUpdate()
          .then((res: any) => res.id)
          .then((queryId: string) =>
            ExportsService.createExport(
              this.props.match.params.organisationId,
              {
                name: this.state.exportModal.exportName,
                output_format: 'CSV',
                query_id: queryId,
                type: 'QUERY',
              },
            ),
          )
          .then((res: DataResponse<Export>) => res.data)
          .then((res: Export) => {
            this.setState(
              {
                exportModal: { loading: false, visible: false, exportName: '' },
              },
              () => {
                this.props.history.push(
                  `/o${this.props.match.params.organisationId}d${
                    this.props.datamart.id
                  }/datastudio/exports/${res.id}`,
                );
              },
            );
          })
          .catch((err: any) =>
            this.setState(
              { exportModal: { ...this.state.exportModal, loading: false } },
              () => {
                this.props.notifyError(err);
              },
            ),
          );
      },
    );
  };

  onExportInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      exportModal: { ...this.state.exportModal, exportName: e.target.value },
    });
  };

  handleCancel = () => {
    this.setState({
      exportModal: { visible: false, exportName: '', loading: false },
    });
  };

  render() {
    const { intl, datamart } = this.props;
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

    const handleMenuClick = (e: ClickParam) => {
      if (e.key === 'EXPORT') {
        this.setState({
          exportModal: { visible: true, exportName: '', loading: false },
        });
      }
    };

    const addMenu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="EXPORT">
          <FormattedMessage {...messages.querySaveAsExport} />
        </Menu.Item>
      </Menu>
    );

    const exportModal = (
      <Modal
        title="Basic Modal"
        visible={this.state.exportModal.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        confirmLoading={this.state.exportModal.loading}
      >
        <p>
          <FormattedMessage {...messages.querySaveAsExportExplanation} />
        </p>
        <Input placeholder="Export Name" onChange={this.onExportInputChange} />
      </Modal>
    );

    return (
      <Layout>
        <ActionBar
          paths={[
            { name: intl.formatMessage(messages.queryToolBreadcrumbLabel) },
          ]}
        >
          {datamart.storage_model_version === 'v201709' ? null : <div>
            <Dropdown overlay={addMenu} trigger={['click']}>
              <Button className="mcs-primary" type="primary">
                {intl.formatMessage(messages.querySaveAs)}
              </Button>
            </Dropdown>
            {exportModal}
          </div>}
        </ActionBar>
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
          {datamart.storage_model_version !== 'v201709' ? (
            <AngularWidget
              organisationId={this.props.match.params.organisationId}
              datamartId={datamart.id}
              getContainer={this.getContainer}
            />
          ) : (
            <OTQLInputEditor
              onRunQuery={this.runQuery}
              onAbortQuery={this.abortQuery}
              runningQuery={runningQuery}
            />
          )}
          {queryResultRenderer}
        </Content>
      </Layout>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectDatamart,
  injectNotifications,
)(QueryToolPage);

const messages = defineMessages({
  queryToolBreadcrumbLabel: {
    id: 'query-tool-action-bar-breadcrumb-label-query-tool',
    defaultMessage: 'Query Tool',
  },
  queryErrorDefaultMsg: {
    id: 'query-tool-error-default-message',
    defaultMessage: 'An error occured',
  },
  querySaveAs: {
    id: 'query-tool-save-as',
    defaultMessage: 'Save As',
  },
  querySaveAsExport: {
    id: 'query-tool-save-as-export',
    defaultMessage: 'Query Export',
  },
  querySaveAsExportExplanation: {
    id: 'query-tool-save-as-export-description',
    defaultMessage:
      'Give your export a name to find it back on the export screen.',
  },
});
