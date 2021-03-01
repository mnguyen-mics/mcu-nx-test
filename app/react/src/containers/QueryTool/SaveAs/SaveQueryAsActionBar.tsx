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
import { QueryResource } from '../../../models/datamart/DatamartResource';
import Convert2Otql from './Convet2Otql';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';

export interface SaveQueryAsActionBarProps {
  saveAsUserQuery?: (formData: NewUserQuerySimpleFormData) => Promise<any>;
  saveAsExort?: (formData: NewExportSimpleFormData) => Promise<any>;
  convertToOtql?: () => Promise<DataResponse<QueryResource>>;
  breadcrumb: Path[];
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
  InjectedNotificationProps;

class SaveQueryAsActionBar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      segmentModalLoading: false,
      segmentModalVisible: false,
      exportModalLoading: false,
      exportModalVisible: false,
      conversionModalVisible: false

    };
  }

  render() {
    const { saveAsExort, saveAsUserQuery, convertToOtql, breadcrumb, csvExportDisabled } = this.props;
    const handleMenuClick = (e: any) => {
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

    const closeExportModal = () =>
      this.setState({
        exportModalVisible: false,
        exportModalLoading: false,
      });

    const openConversionModal = () => this.setState({ conversionModalVisible: true })
    const closeConversionModal = () => this.setState({ conversionModalVisible: false })

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
            id="queryTool.query-builder-page-actionbar-saveas-segment"
            defaultMessage="User Query Segment"
          />
        </Menu.Item>
        {saveAsExort && <Menu.Item key="EXPORT">
          <FormattedMessage
            id="queryTool.query-builder-page-actionbar-saveas-export"
            defaultMessage="Export"
          />
        </Menu.Item>}
      </Menu>
    );

    return (
      <Actionbar paths={breadcrumb}>
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <FormattedMessage
              id="queryTool.query-builder.actionbar.save"
              defaultMessage="Save As"
            />
          </Button>
        </Dropdown>
        {convertToOtql && <Button onClick={openConversionModal}>
          <FormattedMessage
            id="queryTool.query-builder.actionbar.convert"
            defaultMessage="Convert to OTQL"
          />
        </Button>}
       {convertToOtql && this.state.conversionModalVisible && <Convert2Otql 
          onOk={closeConversionModal}
          onCancel={closeConversionModal}
          footer={null}
          visible={this.state.conversionModalVisible}
          convertQuery={convertToOtql}
        />}
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
)(SaveQueryAsActionBar);
