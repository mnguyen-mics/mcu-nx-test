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
import { DrawableContentProps } from '../../../../../../components/Drawer';
import CampaignsInfos from './CampaignsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { FormSection } from '../../../../../../components/Form/index';
import DisplayCampaignService from '../../../../../../services/DisplayCampaignService';
import operation, { CampaignsInfosFieldModel } from '../domain';
import { DisplayCampaignResource } from '../../../../../../models/campaign/display/index';

const FORM_ID = 'editCampaignsForm';

const CampaignsInfosFieldArray = FieldArray as new () => GenericFieldArray<
  Field
>;

interface EditCampaignsFormData {
  [key: string]: Array<
    { [property in keyof CampaignsInfosFieldModel]: any}
  >;
}

interface EditCampaignsFormState {
  campaignNames: string[];
}

export interface EditCampaignsFormProps extends DrawableContentProps {
  save: () => void; // type later
  close: () => void;
  selectedRowKeys: string[];
  RxF: InjectedFormProps<EditCampaignsFormData>;
}

type JoinedProps = EditCampaignsFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

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
            return !campaignData.archived ? campaignData.name : '';
          });
      }),
    ).then(campaignNames => {
      this.setState({
        campaignNames: campaignNames,
      });
    });
  };

  onSave = (formData: EditCampaignsFormData) => {
    const { save, selectedRowKeys } = this.props;
    selectedRowKeys.map(campaignId => {
      DisplayCampaignService.getCampaignDisplay(campaignId)
        .then(apiRes => apiRes.data)
        .then((campaignData: any) => {
          const updatedData = formData.fields.reduce((acc, field) => {
            const campaignProperty: keyof DisplayCampaignResource =
              field.campaignProperty;
            return {
              ...acc,
              [field.campaignProperty]: operation(
                field.action,
                campaignData[campaignProperty],
                parseInt(field.value, 10),
              ),
            };
          }, {'type': 'DISPLAY'});
          DisplayCampaignService.updateCampaign(campaignId, updatedData);
        });
    });
    save();
  };

  render() {
    const { RxF: { handleSubmit } } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [
        {
          name: messages.editCampaigns,
        },
      ],
      message: messages.saveCampaigns,
      onClose: this.props.closeNextDrawer,
    };

    const multiEditSubtitle = {
      id: 'editCampaigns.subtitle',
      defaultMessage: `In this section you will be able to edit campaigns you just selected : `,
    };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout edit-campaigns-form"
            onSubmit={handleSubmit(this.onSave)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <FormSection
                subtitle={multiEditSubtitle}
                title={messages.multiEditTitle}
              />
              <Row style={{ marginBottom: '3em' }}>
                {this.state.campaignNames.map((campaignName, index) => (
                  <Tag key={index}>{campaignName}</Tag>
                ))}
              </Row>

              <div className="ant-col-4 content" />
              <div className="ant-col-16 content">
                <CampaignsInfosFieldArray
                  name="fields"
                  component={CampaignsInfos}
                  rerenderOnEveryChange={true}
                />
              </div>
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
    propNamespace: 'RxF',
  }),
  injectIntl,
)(EditCampaignsForm);
