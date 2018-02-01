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
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';

import AdGroupsInfos from './AdGroupsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { FormSection } from '../../../../../../components/Form/index';
import DisplayCampaignService from '../../../../../../services/DisplayCampaignService';
import { AdGroupsInfosFieldModel } from '../domain';
import Loading from '../../../../../../components/Loading';

const FORM_ID = 'editAdGroupsForm';

const AdGroupsInfosFieldArray = FieldArray as new () => GenericFieldArray<
  Field
>;

export interface EditAdGroupsFormData {
  [key: string]: Array<{ [property in keyof AdGroupsInfosFieldModel]: any }>;
}

interface EditAdGroupsFormState {
  AdGroupNames: string[];
  loading: boolean;
}

export interface EditAdGroupsFormProps {
  close: () => void;
  selectedRowKeys: string[];
  onSave: (formData: EditAdGroupsFormData) => Promise<any>;
}

type JoinedProps = EditAdGroupsFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ campaignId: string }> &
  InjectedFormProps<EditAdGroupsFormData>;

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

class EditAdGroupsForm extends React.Component<
  JoinedProps,
  EditAdGroupsFormState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      AdGroupNames: [],
      loading: false,
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
    const { match: { params: { campaignId } } } = this.props;
    Promise.all(
      selectedRowKeys.map(adGroupId => {
        return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
          .then(apiResp => apiResp.data)
          .then(adGroupData => {
            return adGroupData.name || '';
          });
      }),
    ).then(AdGroupNames => {
      this.setState({
        AdGroupNames: AdGroupNames,
      });
    });
  };

  save = (formData: EditAdGroupsFormData) => {
    this.setState({
      loading: true,
    });
    this.props.onSave(formData).then(() => {
      this.setState({
        loading: false,
      });
    });
  }

  render() {
    const { handleSubmit, close } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [
        {
          name: messages.editAdGroups,
        },
      ],
      message: messages.saveAdGroup,
      onClose: close,
    };

    const multiEditSubtitle = {
      id: 'editAdGroups.subtitle',
      defaultMessage: `In this section you will be able to edit ad groups you just selected : `,
    };

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout edit-adgroups-form"
            onSubmit={handleSubmit(this.save)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <FormSection
                subtitle={multiEditSubtitle}
                title={messages.multiEditAdGroupsTitle}
              />
              <Row style={{ marginBottom: '3em' }}>
                {this.state.AdGroupNames.map((AdGroupName, index) => (
                  <Tag key={index}>{AdGroupName}</Tag>
                ))}
              </Row>

              <div className="ant-col-4 content" />
              <div className="ant-col-16 content">
                <AdGroupsInfosFieldArray
                  name="fields"
                  component={AdGroupsInfos}
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

export default compose<JoinedProps, EditAdGroupsFormProps>(
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  injectIntl,
  withRouter,
)(EditAdGroupsForm);
