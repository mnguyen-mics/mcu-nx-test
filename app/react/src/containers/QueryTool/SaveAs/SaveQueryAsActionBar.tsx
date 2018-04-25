import { Button, Dropdown, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { SaveAsExportModal, SaveAsUserQuerySegmentModal } from '.';
import ActionBar from '../../../components/ActionBar';
import injectNotifications, { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import { NewExportSimpleFormData } from './NewExportSimpleForm';
import { NewUserQuerySimpleFormData } from './NewUserQuerySegmentSimpleForm';

export interface SaveQueryAsActionBarProps {
  saveAsUserQuery?: (formData: NewUserQuerySimpleFormData) => Promise<any>;
  saveAsExort?: (formData: NewExportSimpleFormData) => Promise<any>;
}

interface State {
  segmentModalVisible: boolean;
  segmentModalLoading: boolean;
  exportModalLoading: boolean;
  exportModalVisible: boolean;
}

type Props = SaveQueryAsActionBarProps & InjectedIntlProps & InjectedNotificationProps;

class SaveQueryAsActionBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      segmentModalLoading: false,
      segmentModalVisible: false,
      exportModalLoading: false,
      exportModalVisible: false,
    };
  }

  render() {
    const { intl, saveAsExort, saveAsUserQuery } = this.props;
    const handleMenuClick = (e: ClickParam) => {
      if (e.key === 'USER_QUERY') {
        this.setState({ segmentModalVisible: true });
      } else if (e.key === 'EXPORT') {
        this.setState({ exportModalVisible: true });
      }
    };

    const closeSegmentModal = () =>
      this.setState({ 
        segmentModalVisible: false,
        segmentModalLoading: false,
      });

    const closeExportModal = () => this.setState({ 
      exportModalVisible: false,
      exportModalLoading: false,
    });

    const handleSaveAsUserQuery = (formData: NewUserQuerySimpleFormData) => {
      this.setState({ segmentModalLoading: true });
      saveAsUserQuery!(formData).catch(err => {
        this.props.notifyError(err);
        this.setState({
          segmentModalVisible: false,
          segmentModalLoading: false,
        });
      });
    };

    const handleSaveAsExport = (formData: NewExportSimpleFormData) => {
      this.setState({ exportModalLoading: true });
      saveAsExort!(formData).catch(err => {
        this.props.notifyError(err);
        this.setState({
          exportModalVisible: false,
          exportModalLoading: false,
        });
      });
    };

    const saveAsMenu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="USER_QUERY" disabled={!saveAsUserQuery}>
          <FormattedMessage
            id="query-builder-page-actionbar-saveas-segment"
            defaultMessage="User Query Segment"
          />
        </Menu.Item>
        <Menu.Item key="EXPORT" disabled={!saveAsExort}>
          <FormattedMessage
            id="query-builder-page-actionbar-saveas-export"
            defaultMessage="Export"
          />
        </Menu.Item>
      </Menu>
    );

    return (
      <ActionBar
        paths={[
          {
            name: intl.formatMessage({
              id: 'query-builder-page-actionbar-title',
              defaultMessage: 'Query Builder',
            }),
          },
        ]}
      >
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <FormattedMessage
              id="query-builder-page-actionbar-save"
              defaultMessage="Save As"
            />
          </Button>
        </Dropdown>
        <SaveAsUserQuerySegmentModal
          onOk={handleSaveAsUserQuery}
          onCancel={closeSegmentModal}
          visible={this.state.segmentModalVisible}
          confirmLoading={this.state.segmentModalLoading}
        />
        <SaveAsExportModal
          onOk={handleSaveAsExport}
          onCancel={closeExportModal}
          visible={this.state.exportModalVisible}
          confirmLoading={this.state.exportModalLoading}
        />
      </ActionBar>
    );
  }
}

export default compose<Props, SaveQueryAsActionBarProps>(
  injectIntl,
  injectNotifications,
)(SaveQueryAsActionBar);
