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
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { QueryTranslationResource } from '../../../models/datamart/DatamartResource';
import Convert2Otql from './Convet2Otql';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { SegmentSelector } from '@mediarithmics-private/advanced-components';
import { AudienceSegmentShape } from '../../../models/audiencesegment';

export interface SaveQueryAsActionBarProps {
  saveAsUserQuery?: (formData: NewUserQuerySimpleFormData) => Promise<void>;
  saveAsExport?: (formData: NewExportSimpleFormData) => Promise<void>;
  saveAsTechnicalQuery?: () => Promise<void>;
  convertToOtql?: () => Promise<DataResponse<QueryTranslationResource>>;
  breadcrumb: React.ReactNode[];
  csvExportDisabled?: boolean;
  organisationId?: string;
  datamartId?: string;
  handleSelectExistingSegment?: (segment: AudienceSegmentShape) => void;
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
      saveAsExport,
      saveAsUserQuery,
      convertToOtql,
      breadcrumb,
      csvExportDisabled,
      saveAsTechnicalQuery,
      datamartId,
      organisationId,
      handleSelectExistingSegment,
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
      saveAsExport!(formData).catch(err => {
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

    return (
      <Actionbar pathItems={breadcrumb}>
        {organisationId && datamartId && handleSelectExistingSegment && (
          <SegmentSelector
            organisationId={organisationId}
            datamartId={datamartId}
            onSelectSegment={handleSelectExistingSegment}
            segmentType={['USER_QUERY']}
          />
        )}
        <Dropdown overlay={saveAsMenu} trigger={['click']}>
          <Button className='mcs-saveQueryAsActionBar_button mcs-primary' type='primary'>
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
