import * as React from 'react';
import { Layout, Tag, Row } from 'antd';
import {
  Form,
  FieldArray,
  GenericFieldArray,
  Field,
  reduxForm,
  InjectedFormProps,
} from 'redux-form';
import { RouteComponentProps } from 'react-router';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';

import CampaignsInfos from './CampaignsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { FormSection } from '../../../../../../components/Form/index';
import { CampaignsInfosFieldModel } from '../domain';
import { Col } from 'antd/lib/grid';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../../services/DisplayCampaignService';
import { Loading } from '@mediarithmics-private/mcs-components-library';

const FORM_ID = 'editCampaignsForm';

const messageMap = defineMessages({
  allCampaignsNames: {
    id: 'display.campaigns.multiEdit.allCampaignsSelected',
    defaultMessage: 'You have selected all the campaigns.',
  },
  oldCampaignsNames: {
    id: 'display.campaigns.multiEdit.oldCampaignsSelected',
    defaultMessage:
      'It is not recommended to edit these campaigns because they are deprecated :',
  },
});

const CampaignsInfosFieldArray = FieldArray as new () => GenericFieldArray<
  Field
>;

export interface EditCampaignsFormData {
  [key: string]: Array<{ [property in keyof CampaignsInfosFieldModel]: any }>;
}

interface EditCampaignsFormState {
  campaignNames: string[];
  v2014CampaignNames: string[];
  loading: boolean;
}

export interface EditCampaignsFormProps {
  close: () => void;
  selectedRowKeys?: string[];
  onSave: (formData: EditCampaignsFormData) => Promise<any>;
}

type JoinedProps = EditCampaignsFormProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedFormProps<EditCampaignsFormData>;

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

class EditCampaignsForm extends React.Component<
  JoinedProps,
  EditCampaignsFormState
  > {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      campaignNames: [],
      loading: false,
      v2014CampaignNames: [],
    };
  }

  componentDidMount() {
    const { selectedRowKeys, intl } = this.props;
    if (selectedRowKeys) {
      this.fetchData(selectedRowKeys);
    } else {
      this.setState({
        campaignNames: [intl.formatMessage(messageMap.allCampaignsNames)],
      });
    }
  }

  fetchData = (selectedRowKeys: string[]) => {
    const v2014CampaignNames: string[] = [];
    Promise.all(
      selectedRowKeys.map(campaignId => {
        return this._displayCampaignService
          .getCampaignDisplay(campaignId)
          .then(apiResp => apiResp.data)
          .then(campaignData => {
            if (campaignData.model_version === 'V2014_06') {
              v2014CampaignNames.push(campaignData.name);
            }
            return campaignData.name || '';
          });
      }),
    ).then(campaignNames => {
      this.setState({
        campaignNames: campaignNames,
        v2014CampaignNames: v2014CampaignNames,
      });
    });
  };

  save = (formData: EditCampaignsFormData) => {
    this.setState({
      loading: true,
    });
    this.props
      .onSave(formData)
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { handleSubmit, close, intl: { formatMessage } } = this.props;

    const { loading, campaignNames, v2014CampaignNames } = this.state;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [
        {
          name: formatMessage(messages.editCampaigns),
        },
      ],
      message: messages.saveCampaigns,
      onClose: close,
    };

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout edit-campaigns-form"
            onSubmit={handleSubmit(this.save)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <FormSection
                subtitle={messages.multiEditSubtitle}
                title={messages.multiEditTitle}
              />
              <Row style={{ marginBottom: '3em' }}>
                {campaignNames.map((campaignName, index) => (
                  <Tag key={index}>{campaignName}</Tag>
                ))}
                {v2014CampaignNames.length > 0 && (
                  <div>
                    <br />
                    <FormattedMessage {...messageMap.oldCampaignsNames} />
                    <br />
                    {v2014CampaignNames.map((oldCampaignName, index) => (
                      <Tag key={index}>{oldCampaignName}</Tag>
                    ))}
                  </div>
                )}
              </Row>
              <Row>
                <Col span={4} />
                <Col span={16}>
                  <CampaignsInfosFieldArray
                    name="fields"
                    component={CampaignsInfos}
                    rerenderOnEveryChange={true}
                  />
                </Col>
              </Row>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, EditCampaignsFormProps>(
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  injectIntl,
  injectNotifications,
)(EditCampaignsForm);
