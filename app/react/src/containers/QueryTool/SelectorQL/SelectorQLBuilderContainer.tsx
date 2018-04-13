import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Button, Menu, Dropdown } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import {
  FormattedMessage,
  injectIntl,
  InjectedIntlProps,
  defineMessages,
} from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import ActionBar from '../../../components/ActionBar';
import ExportsService from '../../../services/Library/ExportsService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import AngularQueryToolWidget, {
  QueryContainer,
} from './AngularQueryToolWidget';
import { SaveAsExportModal } from '../Modal';

export interface SelectorQLBuilderContainerProps {
  datamartId: string;
}

interface State {
  queryContainer: QueryContainer | null;
  exportModalVisible: boolean;
  exportModalLoading: boolean;
}

type Props = SelectorQLBuilderContainerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class SelectorQLBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      queryContainer: null,
      exportModalVisible: false,
      exportModalLoading: false,
    };
  }

  setStateWithQueryContainer = (queryContainer: QueryContainer) => {
    if (this.state.queryContainer) {
      this.setState({ queryContainer });
    }
  };

  saveAsExport = (exportName: string) => {
    const {
      history,
      match: { params: { organisationId } },
      notifyError,
    } = this.props;
    const { queryContainer } = this.state;
    this.setState({
      exportModalLoading: true,
    });

    queryContainer!
      .saveOrUpdate()
      .then(queryResource => {
        return ExportsService.createExport(organisationId, {
          name: exportName,
          output_format: 'CSV',
          query_id: queryResource.id,
          type: 'QUERY',
        });
      })
      .then(res => {
        this.setState({
          exportModalLoading: false,
          exportModalVisible: false,
        });
        const exportId = res.data.id;
        history.push(`/v2/o/${organisationId}/datastudio/exports/${exportId}`);
      })
      .catch(err => {
        this.setState({
          exportModalLoading: false,
          exportModalVisible: false,
        });
        notifyError(err);
      });
  };

  getSaveAsMenu = () => {
    const handleMenuClick = (e: ClickParam) => {
      if (e.key === 'EXPORT') {
        this.setState({ exportModalVisible: true });
      }
    };
    return (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="EXPORT">
          <FormattedMessage {...messages.querySaveAsExport} />
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { intl } = this.props;
    const { exportModalVisible, exportModalLoading } = this.state;

    const closeExportModal = () => this.setState({ exportModalVisible: false });

    return (
      <Layout>
        <ActionBar
          paths={[
            { name: intl.formatMessage(messages.queryToolBreadcrumbLabel) },
          ]}
        >
          <Dropdown overlay={this.getSaveAsMenu()} trigger={['click']}>
            <Button className="mcs-primary" type="primary">
              {intl.formatMessage(messages.querySaveAs)}
            </Button>
          </Dropdown>
        </ActionBar>
        <Layout.Content
          className="mcs-content-container"
          style={{ padding: 0 }}
        >
          <AngularQueryToolWidget
            organisationId={this.props.match.params.organisationId}
            datamartId={this.props.datamartId}
            setStateWithQueryContainer={this.setStateWithQueryContainer}
          />
        </Layout.Content>
        <SaveAsExportModal
          onOk={this.saveAsExport}
          onCancel={closeExportModal}
          visible={exportModalVisible}
          confirmLoading={exportModalLoading}
        />
      </Layout>
    );
  }
}

export default compose<Props, SelectorQLBuilderContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(SelectorQLBuilderContainer);

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
});
