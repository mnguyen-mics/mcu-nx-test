import * as React from 'react';
import { Layout, Tag, Button } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  Form,
  InjectedFormProps,
  reduxForm,
  getFormValues,
  ConfigProps,
} from 'redux-form';
import { compose } from 'recompose';
import {
  FormSliderField,
  FormRadioGroup,
  FormSlider,
  withValidators,
  FormRadioGroupField,
  FormFieldWrapper,
} from '../../../../../components/Form';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import messages from '../messages';
import { Path } from '../../../../../components/ActionBar';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { TableSelector } from '../../../../../components';
import { Omit } from '../../../../../utils/Types';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { TableSelectorProps } from '../../../../../components/ElementSelector/TableSelector';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { SearchFilter } from '../../../../../components/ElementSelector';
import {
  DataListResponse,
  DataResponse,
} from '../../../../../services/ApiService';
import { ExperimentationFormData } from './AudienceExperimentationEditPage';
import { ScrollspySider } from '../../../../../components/Layout';
import { SidebarWrapperProps } from '../../../../../components/Layout/ScrollspySider';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';

export const messagesMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  partitionSelectorTitle: {
    id: 'audience.segments.partitionSelector.AddButton',
    defaultMessage: 'Add partitions',
  },
  segmentSelectorSearchPlaceholder: {
    id: 'audience.segments.partitionSelector.searchPlaceholder',
    defaultMessage: 'Search partitions',
  },
  partitionSelectorColumnName: {
    id: 'audience.segments.partitionSelector.name',
    defaultMessage: 'Name',
  },
  partitionSelectorColumnType: {
    id: 'audience.segments.partitionSelector.type',
    defaultMessage: 'Type',
  },
  partitionSelectorColumnPartCount: {
    id: 'audience.segments.partitionSelector.partCount',
    defaultMessage: 'Part Count',
  },
  control: {
    id: 'audience.segments.experimentation.control',
    defaultMessage: 'Control',
  },
  engagement: {
    id: 'audience.segments.experimentation.engagement',
    defaultMessage: 'Engagement',
  },
  eCommerceEngagement: {
    id: 'audience.segments.experimentation.eCommerceEngagement',
    defaultMessage: 'E-commerce Engagement',
  },
  channelEngagement: {
    id: 'audience.segments.experimentation.channelEngagement',
    defaultMessage: 'Channel Engagement',
  },
  tooltipControl: {
    id: 'audience.segments.experimentation.control.tooltip',
    defaultMessage: 'Select a control value',
  },
  tooltipEngagement: {
    id: 'audience.segments.experimentation.engagement.tooltip',
    defaultMessage: 'Select an engagement value',
  },
  selectPartition: {
    id: 'audience.segments.experimentation.form.selectPartition',
    defaultMessage: 'Select Partition',
  },
  experimentation: {
    id: 'audience.segments.experimentation.form.experimentation',
    defaultMessage: 'Experimentation',
  },
  savingInProgress: {
    id: 'audience.segments.experimentation.form.saveInProgress',
    defaultMessage: 'Saving in progress...',
  },
  successfullyCreated: {
    id: 'audience.segments.experimentation.form.successfullyCreated',
    defaultMessage: 'Experimentation Successfully created!',
  },
});

const PartitionTableSelector: React.ComponentClass<TableSelectorProps<
  AudiencePartitionResource
>> = TableSelector;
const FORM_ID = 'experimentationForm';
const { Content } = Layout;

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

interface MapStateToProps {
  formValues: ExperimentationFormData;
}

export interface AudienceExperimentationFormProps
  extends Omit<ConfigProps<ExperimentationFormData>, 'form'> {
  breadCrumbPaths: Path[];
  close: () => void;
  fetchAudiencePartitions: (
    filter?: SearchFilter,
  ) => Promise<DataListResponse<AudiencePartitionResource>>;
  fetchAudiencePartition: (
    id: string,
  ) => Promise<DataResponse<AudiencePartitionResource>>;
}

interface State {
  loadingPartitions: boolean;
  partitions: AudiencePartitionResource[];
}

type Props = AudienceExperimentationFormProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps &
  MapStateToProps &
  InjectedDrawerProps &
  ReduxFormChangeProps &
  InjectedFormProps<ExperimentationFormData, AudienceExperimentationFormProps> &
  InjectedNotificationProps &
  ValidatorProps;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 19, offset: 1 },
};

class AudienceExperimentationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loadingPartitions: true,
      partitions: [],
    };
  }

  addPartitions = (
    partitionIds: string[],
    partitions: AudiencePartitionResource[],
  ) => {
    this.props.change('selectedPartition', partitions[0]);
    this.props.closeNextDrawer();
  };

  getColumns = () => {
    return [
      {
        intlMessage: messagesMap.partitionSelectorColumnName,
        key: 'name',
        render: (text: string, record: AudiencePartitionResource) => {
          return text;
        },
      },
      {
        intlMessage: messagesMap.partitionSelectorColumnType,
        key: 'type',
        render: (text: string, record: AudiencePartitionResource) => {
          return text;
        },
      },
      {
        intlMessage: messagesMap.partitionSelectorColumnPartCount,
        key: 'part_count',
        render: (text: string, record: AudiencePartitionResource) => {
          return text;
        },
      },
    ];
  };

  openPartitionSelector = () => {
    const {
      intl,
      fetchAudiencePartition,
      fetchAudiencePartitions,
      formValues,
      closeNextDrawer
    } = this.props;
    this.props.openNextDrawer<TableSelectorProps<AudiencePartitionResource>>(
      PartitionTableSelector,
      {
        additionalProps: {
          actionBarTitle: intl.formatMessage(
            messagesMap.partitionSelectorTitle,
          ),
          displayFiltering: true,
          searchPlaceholder: intl.formatMessage(
            messagesMap.segmentSelectorSearchPlaceholder,
          ),
          fetchDataList: fetchAudiencePartitions,
          fetchData: fetchAudiencePartition,
          columnsDefinitions: this.getColumns(),
          save: this.addPartitions,
          close: closeNextDrawer,
          displayDatamartSelector: true,
          singleSelection: true,
          selectedIds: formValues &&
            formValues.selectedPartition && [formValues.selectedPartition.id],
        },
      },
    );
  };

  render() {
    const {
      intl,
      handleSubmit,
      breadCrumbPaths,
      close,
      formValues,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.experimentationCreation,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: [
        {
          sectionId: 'section-partition',
          title: intl.formatMessage(messagesMap.selectPartition),
        },
        {
          sectionId: 'section-experimentation',
          title: intl.formatMessage(messagesMap.experimentation),
        },
      ],
      scrollId: FORM_ID,
    };
    const maxControl =
      formValues &&
      formValues.selectedPartition &&
      formValues.selectedPartition.part_count !== undefined
        ? formValues.selectedPartition.part_count
        : 0;
    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout>
          <ScrollspySider {...sideBarProps} />
          <Form onSubmit={handleSubmit} className={'edit-layout ant-layout'}>
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div id="section-partition" className="m-t-20 m-b-20">
                {formValues &&
                formValues.selectedPartition &&
                formValues.selectedPartition.name ? (
                  <FormattedMessage
                    id="audience.segments.experimentation.form.title"
                    defaultMessage={`You have select the following partition: {partitionName}.
                    Continue your experimentation creation by selecting an engagement value and a control value.`}
                    values={{
                      partitionName: (
                        <Tag>{formValues.selectedPartition.name}</Tag>
                      ),
                    }}
                  />
                ) : (
                  <FormattedMessage
                    id="audience.segments.experimentation.form.noPartitionSelected.title"
                    defaultMessage={`You have not selected a partition yet. click on the button below to select one partition.`}
                  />
                )}
                <div className="text-center mcs-audience-segment-experimentation_select_partition_button">
                  <Button onClick={this.openPartitionSelector}>
                    {this.props.intl.formatMessage({
                      id:
                        'audience.segments.experimentation.form.slectPartitionButton',
                      defaultMessage: 'Select Partition',
                    })}
                  </Button>
                </div>
              </div>
              <div id="section-experimentation">
                <FormFieldWrapper
                  label={intl.formatMessage(messagesMap.engagement)}
                  helpToolTipProps={{
                    title: intl.formatMessage(messagesMap.tooltipEngagement),
                  }}
                  {...fieldGridConfig}
                >
                  <FormRadioGroupField
                    name="engagement"
                    component={FormRadioGroup}
                    elements={[
                      {
                        id: 'E_COMMERCE_ENGAGEMENT',
                        value: 'E_COMMERCE_ENGAGEMENT',
                        title: intl.formatMessage(
                          messagesMap.eCommerceEngagement,
                        ),
                      },
                      {
                        id: 'CHANNEL_ENGAGEMENT',
                        value: 'CHANNEL_ENGAGEMENT',
                        title: intl.formatMessage(
                          messagesMap.channelEngagement,
                        ),
                      },
                    ]}
                  />
                </FormFieldWrapper>
                <FormSliderField
                  name="control"
                  component={FormSlider}
                  formItemProps={{
                    label: intl.formatMessage(messagesMap.control),
                    required: true,
                    ...fieldGridConfig,
                  }}
                  inputProps={{
                    min: 1,
                    max: Math.round(100 / maxControl),
                    disabled: maxControl === 0,
                  }}
                  helpToolTipProps={{
                    title: intl.formatMessage(messagesMap.tooltipControl),
                  }}
                />
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, AudienceExperimentationFormProps>(
  withRouter,
  withValidators,
  injectIntl,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps),
  reduxForm<ExperimentationFormData, AudienceExperimentationFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AudienceExperimentationForm);
