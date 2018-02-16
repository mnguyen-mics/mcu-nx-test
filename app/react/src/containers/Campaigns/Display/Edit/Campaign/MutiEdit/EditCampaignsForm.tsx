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
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';

import CampaignsInfos from './CampaignsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { FormSection } from '../../../../../../components/Form/index';
import Loading from '../../../../../../components/Loading';
import DisplayCampaignService from '../../../../../../services/DisplayCampaignService';
import { CampaignsInfosFieldModel } from '../domain';
import { Col } from 'antd/lib/grid';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';

const FORM_ID = 'editCampaignsForm';

const messageMap = defineMessages({
  allCampaignsNames: {
    id: 'edit.campaigns.all.campaigns.names',
    defaultMessage: 'You have selected all the campaigns.',
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
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      campaignNames: [],
      loading: false,
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

  componentWillReceiveProps(nextProps: JoinedProps) {
    const { selectedRowKeys, intl } = this.props;
    const { selectedRowKeys: nextSelectedRowKeys } = nextProps;
    if (
      selectedRowKeys &&
      nextSelectedRowKeys &&
      selectedRowKeys !== nextSelectedRowKeys
    ) {
      this.fetchData(nextSelectedRowKeys);
    } else {
      this.setState({
        campaignNames: [intl.formatMessage(messageMap.allCampaignsNames)],
      });
    }
  }

  fetchData = (selectedRowKeys: string[]) => {
    Promise.all(
      selectedRowKeys.map(campaignId => {
        return DisplayCampaignService.getCampaignDisplay(campaignId)
          .then(apiResp => apiResp.data)
          .then(campaignData => {
            return campaignData.name || '';
          });
      }),
    ).then(campaignNames => {
      this.setState({
        campaignNames: campaignNames,
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
    const { handleSubmit, close } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [
        {
          name: messages.editCampaigns,
        },
      ],
      message: messages.saveCampaigns,
      onClose: close,
    };

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
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
                {this.state.campaignNames.map((campaignName, index) => (
                  <Tag key={index}>{campaignName}</Tag>
                ))}
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
