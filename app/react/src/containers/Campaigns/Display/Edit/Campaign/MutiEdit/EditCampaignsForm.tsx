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
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';

import CampaignsInfos from './CampaignsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { FormSection } from '../../../../../../components/Form/index';
import DisplayCampaignService from '../../../../../../services/DisplayCampaignService';
import { CampaignsInfosFieldModel } from '../domain';
import { Col } from 'antd/lib/grid';

const FORM_ID = 'editCampaignsForm';

const CampaignsInfosFieldArray = FieldArray as new () => GenericFieldArray<
  Field
>;

export interface EditCampaignsFormData {
  [key: string]: Array<{ [property in keyof CampaignsInfosFieldModel]: any }>;
}

interface EditCampaignsFormState {
  campaignNames: string[];
}

export interface EditCampaignsFormProps {
  close: () => void;
  selectedRowKeys: string[];
}

type JoinedProps = EditCampaignsFormProps &
  InjectedIntlProps &
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
    };
  }

  componentDidMount() {
    const { selectedRowKeys } = this.props;
    this.fetchData(selectedRowKeys);
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const { selectedRowKeys } = this.props;
    const { selectedRowKeys: nextSelectedRowKeys } = nextProps;
    if (selectedRowKeys !== nextSelectedRowKeys) {
      this.fetchData(nextSelectedRowKeys);
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

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout edit-campaigns-form"
            onSubmit={handleSubmit as any}
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
)(EditCampaignsForm);
