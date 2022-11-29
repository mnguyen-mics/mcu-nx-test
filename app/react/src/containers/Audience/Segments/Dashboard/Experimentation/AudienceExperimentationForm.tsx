import * as React from 'react';
import { Layout, Tag } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Form, InjectedFormProps, reduxForm, getFormValues, ConfigProps } from 'redux-form';
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
  WrappedComponentProps,
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
} from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import messages from '../messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { Omit } from '../../../../../utils/Types';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { ExperimentationFormData } from './AudienceExperimentationEditPage';
import { ScrollspySider } from '../../../../../components/Layout';
import { SidebarWrapperProps } from '../../../../../components/Layout/ScrollspySider';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import PartitionSelector from '../../../../Settings/DatamartSettings/Partitions/Common/PartitionSelector';

export const messagesMap: {
  [key: string]: MessageDescriptor;
} = defineMessages({
  partitionSelectorTitle: {
    id: 'audience.segments.partitionSelector.AddButton',
    defaultMessage: 'Add a partition',
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
  weight: {
    id: 'audience.segments.experimentation.weight',
    defaultMessage: 'Experimentation %',
  },
  controlGroupSegmentName: {
    id: 'audience.segments.experimentation.controlGroupSegmentName',
    defaultMessage: 'Control Group',
  },
  experimentationSegmentName: {
    id: 'audience.segments.experimentation.experimentationSegmentName',
    defaultMessage: 'Experimentation',
  },
  uplift: {
    id: 'audience.segments.experimentation.uplift',
    defaultMessage: 'Uplift',
  },
  engagementMetric: {
    id: 'audience.segments.experimentation.engagementMetric',
    defaultMessage: 'Engagement metric',
  },
  E_COMMERCE_ENGAGEMENT: {
    id: 'audience.segments.experimentation.eCommerceEngagement',
    defaultMessage: 'E-commerce Engagement',
  },
  CHANNEL_ENGAGEMENT: {
    id: 'audience.segments.experimentation.channelEngagement',
    defaultMessage: 'Channel Engagement',
  },
  tooltipWeight: {
    id: 'audience.segments.experimentation.control.tooltip',
    defaultMessage: 'Select the datamart percentage on which you want to do your experimentation.',
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
  abTestingDetailsTitle: {
    id: 'audience.segment.dashboard.ABDetailsTable.exportTitle',
    defaultMessage: 'AB Testing Details',
  },
  abDashboardSegmentFilterPlaceholder: {
    id: 'audience.segment.dashboard.abDashboard.segmentFilterPlaceholder',
    defaultMessage: 'Select an activation you want to refine your experimentation with',
  },
});

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
  breadCrumbPaths: React.ReactNode[];
  close: () => void;
  partitions: AudiencePartitionResource[];
  loadingPartitions: boolean;
}

interface State {
  loadingPartitions: boolean;
  partitions: AudiencePartitionResource[];
}

type Props = AudienceExperimentationFormProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  WrappedComponentProps &
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

  onSelectPartition = (partition: AudiencePartitionResource) => {
    this.props.change('selectedPartition', partition);
  };

  getSliderStep = (partitionCount?: number) => {
    if (!partitionCount) return 0;
    return 100 / partitionCount;
  };

  render() {
    const {
      intl,
      handleSubmit,
      breadCrumbPaths,
      close,
      formValues,
      partitions,
      loadingPartitions,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.experimentationCreation,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: [
        {
          sectionId: 'section-partition',
          title: intl.formatMessage(messagesMap.selectPartition),
          onClick: () => {
            this.props.change('selectedPartition', {});
          },
        },
        {
          sectionId: 'section-experimentation',
          title: intl.formatMessage(messagesMap.experimentation),
        },
      ],
      scrollId: FORM_ID,
    };

    return formValues && formValues.selectedPartition && formValues.selectedPartition.id ? (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout>
          <ScrollspySider {...sideBarProps} />
          <Form onSubmit={handleSubmit} className={'edit-layout ant-layout'}>
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              <FormattedMessage
                id='audience.segments.experimentation.form.title'
                defaultMessage={`You have selected the following partition: {partitionName}.
                    Continue your experimentation creation by selecting an engagement type and a percentage of experimentation.`}
                values={{
                  partitionName: <Tag>{formValues.selectedPartition.name}</Tag>,
                }}
              />

              <div
                className='mcs-audienceExperimentationForm_experimentationSection'
                id='section-experimentation'
              >
                <FormFieldWrapper
                  label={intl.formatMessage(messagesMap.engagementMetric)}
                  helpToolTipProps={{
                    title: intl.formatMessage(messagesMap.tooltipEngagement),
                  }}
                  {...fieldGridConfig}
                >
                  <FormRadioGroupField
                    name='engagement'
                    component={FormRadioGroup}
                    elements={[
                      {
                        id: 'E_COMMERCE_ENGAGEMENT',
                        value: 'E_COMMERCE_ENGAGEMENT',
                        title: intl.formatMessage(messagesMap.E_COMMERCE_ENGAGEMENT),
                      },
                      {
                        id: 'CHANNEL_ENGAGEMENT',
                        value: 'CHANNEL_ENGAGEMENT',
                        title: intl.formatMessage(messagesMap.CHANNEL_ENGAGEMENT),
                      },
                    ]}
                  />
                </FormFieldWrapper>
                <FormSliderField
                  name='weight'
                  component={FormSlider}
                  formItemProps={{
                    label: intl.formatMessage(messagesMap.weight),
                    required: true,
                    ...fieldGridConfig,
                  }}
                  inputProps={{
                    min: 0,
                    max: 100,
                    tipFormatter: (value: any) => {
                      return <span>{Math.round(value * 100) / 100}%</span>;
                    },
                    step: this.getSliderStep(formValues.selectedPartition.part_count),
                    disabled: !formValues.selectedPartition.part_count,
                  }}
                  helpToolTipProps={{
                    title: intl.formatMessage(messagesMap.tooltipWeight),
                  }}
                />
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    ) : (
      <PartitionSelector
        partitions={partitions}
        isLoading={loadingPartitions}
        onSelect={this.onSelectPartition}
        actionbarProps={{
          pathItems: [intl.formatMessage(messagesMap.partitionSelectorTitle)],
          onClose: close,
        }}
      />
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
