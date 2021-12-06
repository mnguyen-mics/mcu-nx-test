import { Button, Dropdown, Menu } from 'antd';
import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { SaveAsExportModal, SaveAsUserQuerySegmentModal } from '.';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { NewExportSimpleFormData } from './NewExportSimpleForm';
import { NewUserQuerySimpleFormData } from './NewUserQuerySegmentSimpleForm';
import { DataResponse } from '../../../services/ApiService';
import { QueryTranslationResource } from '../../../models/datamart/DatamartResource';
import Convert2Otql from './Convet2Otql';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';

export interface SaveQueryAsActionBarProps {
  saveAsUserQuery?: (formData: NewUserQuerySimpleFormData) => Promise<any>;
  saveAsExort?: (formData: NewExportSimpleFormData) => Promise<any>;
  saveAsTechnicalQuery?: () => Promise<any>;
  convertToOtql?: () => Promise<DataResponse<QueryTranslationResource>>;
  breadcrumb: React.ReactNode[];
  csvExportDisabled?: boolean;
}

interface State {
  segmentModalVisible: boolean;
  segmentModalLoading: boolean;
  exportModalLoading: boolean;
  exportModalVisible: boolean;
  conversionModalVisible: boolean;
}

type Props = SaveQueryAsActionBarProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class SaveQueryAsActionBar extends React.Component<Props, State> {
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

  render() {
    const {
      saveAsExort,
      saveAsUserQuery,
      convertToOtql,
      breadcrumb,
      csvExportDisabled,
      hasFeature,
      saveAsTechnicalQuery,
    } = this.props;
    const handleMenuClick = (e: any) => {
      if (e.key === 'USER_QUERY') {
        this.setState({ segmentModalVisible: true });
      } else if (e.key === 'EXPORT') {
        this.setState({ exportModalVisible: true });
      } else if (e.key === 'TECHNICAL_QUERY' && saveAsTechnicalQuery) {
        saveAsTechnicalQuery();
      }
    };

    const closeSegmentModal = () =>
      this.setState({
        segmentModalVisible: false,
        segmentModalLoading: false,
      });

    const closeExportModal = () =>
      this.setState({
        exportModalVisible: false,
        exportModalLoading: false,
      });

    const openConversionModal = () => this.setState({ conversionModalVisible: true });
    const closeConversionModal = () => this.setState({ conversionModalVisible: false });

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
        {saveAsExort && (
          <Menu.Item key='EXPORT'>
            <FormattedMessage
              id='queryTool.query-builder-page-actionbar-saveas-export'
              defaultMessage='Export'
            />
          </Menu.Item>
        )}
        <Menu.Item className='mcs-saveQueryAsActionBar_menu_userQuery' key='TECHNICAL_QUERY'>
          <FormattedMessage
            id='queryTool.query-builder-page-actionbar-saveas-techbical-query'
            defaultMessage='Technical query'
          />
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar pathItems={breadcrumb}>
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button
            className={`mcs-saveQueryAsActionBar_button ${
              hasFeature('query-tool-graphs') ? '' : 'mcs-primary'
            }`}
            type={hasFeature('query-tool-graphs') ? undefined : 'primary'}
          >
            <FormattedMessage
              id='queryTool.query-builder.actionbar.save'
              defaultMessage='Save As'
            />
          </Button>
        </Dropdown>
        {convertToOtql && (
          <Button onClick={openConversionModal} className='mcs-saveQueryAsActionBar_convert2Otql'>
            <FormattedMessage
              id='queryTool.query-builder.actionbar.convert'
              defaultMessage='Convert to OTQL'
            />
          </Button>
        )}
        {convertToOtql && this.state.conversionModalVisible && (
          <Convert2Otql
            onOk={closeConversionModal}
            onCancel={closeConversionModal}
            footer={null}
            visible={this.state.conversionModalVisible}
            convertQuery={convertToOtql}
          />
        )}
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
          csvExportDisabled={csvExportDisabled}
        />
      </Actionbar>
    );
  }
}

export default compose<Props, SaveQueryAsActionBarProps>(
  injectIntl,
  injectNotifications,
  injectFeatures,
)(SaveQueryAsActionBar);
