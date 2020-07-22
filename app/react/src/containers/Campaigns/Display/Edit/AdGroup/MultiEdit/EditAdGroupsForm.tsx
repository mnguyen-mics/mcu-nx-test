import * as React from 'react';
import { Layout, Tag, Row, message } from 'antd';
import {
  Form,
  FieldArray,
  GenericFieldArray,
  Field,
  reduxForm,
  InjectedFormProps,
} from 'redux-form';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';
import AdGroupsInfos from './AdGroupsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { FormSection } from '../../../../../../components/Form/index';
import { AdGroupsInfosFieldModel } from '../domain';
import Loading from '../../../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../../services/DisplayCampaignService';

const FORM_ID = 'editAdGroupsForm';

const messageMap = defineMessages({
  allAdGroupsNames: {
    id: 'edit.campaign.all.adgroups.names',
    defaultMessage: 'You have selected all the ad groups.',
  },
  dateError: {
    id: 'edit.adgroups.startDate.after.endDate',
    defaultMessage: 'Warning : Start date is after end date !',
  },
});

const AdGroupsInfosFieldArray = FieldArray as new () => GenericFieldArray<
  Field
>;

export interface EditAdGroupsFormData {
  [key: string]: Array<{ [property in keyof AdGroupsInfosFieldModel]: any }>;
}

interface EditAdGroupsFormState {
  adGroupNames: string[];
  loading: boolean;
}

export interface EditAdGroupsFormProps {
  close: () => void;
  selectedRowKeys?: string[];
  onSave: (formData: EditAdGroupsFormData) => Promise<any>;
}

type JoinedProps = EditAdGroupsFormProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ campaignId: string }> &
  InjectedFormProps<EditAdGroupsFormData>;

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

class EditAdGroupsForm extends React.Component<
  JoinedProps,
  EditAdGroupsFormState
> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      adGroupNames: [],
      loading: false,
    };
  }

  componentDidMount() {
    const { selectedRowKeys, intl } = this.props;
    if (selectedRowKeys) {
      this.fetchData(selectedRowKeys);
    } else {
      this.setState({
        adGroupNames: [intl.formatMessage(messageMap.allAdGroupsNames)],
      });
    }
  }

  componentDidUdpate(previousProps: JoinedProps) {
    const { selectedRowKeys, intl } = this.props;
    const { selectedRowKeys: previousSelectedRowKeys } = previousProps;
    const { adGroupNames } = this.state;
    if (
      selectedRowKeys &&
      previousSelectedRowKeys &&
      selectedRowKeys !== previousSelectedRowKeys
    ) {
      this.fetchData(selectedRowKeys);
    } else if (
      !(
        adGroupNames.length === 1 &&
        adGroupNames[0] === intl.formatMessage(messageMap.allAdGroupsNames)
      )
    ) {
      this.setState({
        adGroupNames: [intl.formatMessage(messageMap.allAdGroupsNames)],
      });
    }
  }

  fetchData = (selectedRowKeys: string[]) => {
    const {
      match: {
        params: { campaignId },
      },
    } = this.props;
    Promise.all(
      selectedRowKeys.map(adGroupId => {
        return this._displayCampaignService
          .getAdGroup(campaignId, adGroupId)
          .then(apiResp => apiResp.data)
          .then(adGroupData => {
            return adGroupData.name || '';
          });
      }),
    ).then(adGroupNames => {
      this.setState({
        adGroupNames: adGroupNames,
      });
    });
  };

  save = (formData: EditAdGroupsFormData): any => {
    const { intl } = this.props;
    const startDateField = formData.fields.filter(
      field => field.adGroupProperty === 'start_date',
    )[0];
    const endDateField = formData.fields.filter(
      field => field.adGroupProperty === 'end_date',
    )[0];
    if (
      startDateField &&
      endDateField &&
      startDateField.value > endDateField.value
    ) {
      return message.warning(intl.formatMessage(messageMap.dateError));
    } else {
      this.setState({
        loading: true,
      });
      return this.props.onSave(formData).catch((err: any) => {
        this.setState({
          loading: false,
        });
      });
    }
  };

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
                {this.state.adGroupNames.map((AdGroupName, index) => (
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
  injectNotifications,
)(EditAdGroupsForm);
