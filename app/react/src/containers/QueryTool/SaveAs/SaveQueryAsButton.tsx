import React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { SaveAsExportModal, SaveAsUserQuerySegmentModal } from '.';
import { NewExportSimpleFormData } from './NewExportSimpleForm';
import { NewUserQuerySimpleFormData } from './NewUserQuerySegmentSimpleForm';

import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { Button, Dropdown, Menu } from 'antd';

export interface SaveQueryAsButtonProps {
  saveAsUserQuery?: (formData: NewUserQuerySimpleFormData) => Promise<any>;
  saveAsExport?: (formData: NewExportSimpleFormData) => Promise<any>;
  saveAsTechnicalQuery?: () => Promise<any>;
  csvExportDisabled?: boolean;
  organisationId?: string;
  datamartId?: string;
}

interface State {
  segmentModalVisible: boolean;
  segmentModalLoading: boolean;
  exportModalLoading: boolean;
  exportModalVisible: boolean;
  conversionModalVisible: boolean;
}

type Props = SaveQueryAsButtonProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class SaveQueryAsButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      segmentModalLoading: false,
      segmentModalVisible: false,
      exportModalLoading: false,
      exportModalVisible: false,
      conversionModalVisible: false,
    };
  }

  handleSaveAsUserQuery(formData: NewUserQuerySimpleFormData) {
    const { saveAsUserQuery } = this.props;
    this.setState({ segmentModalLoading: true });
    saveAsUserQuery!(formData).catch(err => {
      this.props.notifyError(err);
      this.setState({
        segmentModalVisible: false,
        segmentModalLoading: false,
      });
    });
  }

  handleSaveAsExport(formData: NewExportSimpleFormData) {
    const { saveAsExport } = this.props;
    this.setState({ exportModalLoading: true });
    saveAsExport!(formData).catch(err => {
      this.props.notifyError(err);
      this.setState({
        exportModalVisible: false,
        exportModalLoading: false,
      });
    });
  }

  render() {
    const { saveAsUserQuery, saveAsExport, saveAsTechnicalQuery } = this.props;
    const closeExportModal = () =>
      this.setState({
        exportModalVisible: false,
        exportModalLoading: false,
      });

    const closeSegmentModal = () =>
      this.setState({
        segmentModalVisible: false,
        segmentModalLoading: false,
      });

    const handleMenuClick = (e: any) => {
      if (e.key === 'USER_QUERY') {
        this.setState({ segmentModalVisible: true });
      } else if (e.key === 'EXPORT') {
        this.setState({ exportModalVisible: true });
      } else if (e.key === 'TECHNICAL_QUERY' && saveAsTechnicalQuery) {
        saveAsTechnicalQuery();
      }
    };

    const saveAsMenu = (
      <Menu onClick={handleMenuClick} className='mcs-menu-antd-customized'>
        <Menu.Item
          className='mcs-saveQueryAsActionBar_menu_userQuery'
          key='USER_QUERY'
          disabled={!saveAsUserQuery}
        >
          <FormattedMessage
            id='queryTool.query-builder-page-actionbar-saveas-segment'
            defaultMessage='User Query Segment'
          />
        </Menu.Item>
        {saveAsExport && (
          <Menu.Item key='EXPORT'>
            <FormattedMessage
              id='queryTool.query-builder-page-actionbar-saveas-export'
              defaultMessage='Export'
            />
          </Menu.Item>
        )}
        <Menu.Item className='mcs-saveQueryAsActionBar_menu_technicalQuery' key='TECHNICAL_QUERY'>
          <FormattedMessage
            id='queryTool.query-builder-page-actionbar-saveas-techbical-query'
            defaultMessage='Technical query'
          />
        </Menu.Item>
      </Menu>
    );
    const handleSaveAsUserQuery = this.handleSaveAsUserQuery.bind(this);
    const handleSaveAsExport = this.handleSaveAsExport.bind(this);
    return (
      <div>
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button className='mcs-otqlInputEditor_save_as_button'>
            <FormattedMessage
              id='queryTool.query-builder.actionbar.save'
              defaultMessage='Save As...'
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
          csvExportDisabled={this.props.csvExportDisabled}
        />
      </div>
    );
  }
}
export default compose<Props, SaveQueryAsButtonProps>(
  injectIntl,
  injectNotifications,
  injectFeatures,
)(SaveQueryAsButton);
