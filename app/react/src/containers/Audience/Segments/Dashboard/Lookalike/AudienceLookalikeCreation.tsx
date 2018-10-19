import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { reduxForm, InjectedFormProps, Form, ConfigProps } from 'redux-form';
import {
  FormInputField,
  FormInput,
  FormSelectField,
  DefaultSelect,
  FormSliderField,
  FormSlider,
  withValidators,
} from '../../../../../components/Form';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import messages from '../messages';
import { Omit } from '../../../../../utils/Types';
import { Layout } from 'antd';
import { Path } from '../../../../../components/ActionBar';
import { UserLookalikeSegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { Loading } from '../../../../../components';
import { injectable } from 'inversify';
import {
  SERVICE_IDENTIFIER,
  lazyInject,
} from '../../../../../services/inversify.config';
import { IAudiencePartitionsService } from '../../../../../services/AudiencePartitionsService';

const FORM_ID = 'lookalikeForm';
const { Content } = Layout;

export interface AudienceLookalikeCreationProps
  extends Omit<ConfigProps<any>, 'form'> {
  breadCrumbPaths: Path[];
  close: () => void;
}

interface AudienceLookalikeState {
  partitions: AudiencePartitionResource[];
  loading: boolean;
}

type LookAlikeFormData = Partial<UserLookalikeSegment>;

type Props = AudienceLookalikeCreationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedDatamartProps &
  InjectedIntlProps &
  InjectedFormProps<any, AudienceLookalikeCreationProps> &
  InjectedNotificationProps &
  ValidatorProps;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 19, offset: 1 },
};

@injectable()
class AudienceLookalikeCreation extends React.Component<
  Props,
  AudienceLookalikeState
> {
  @lazyInject(SERVICE_IDENTIFIER.IAudiencePartitionsService)
  private _audiencePartitionsService: IAudiencePartitionsService;
  constructor(props: Props) {
    super(props);
    this.state = {
      partitions: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchAudiencePartition();
  }

  fetchAudiencePartition = () => {
    const {
      match: {
        params: { organisationId },
      },
      datamart,
      notifyError,
    } = this.props;
    this._audiencePartitionsService
      .getPartitions(organisationId, {
        first_result: 0,
        max_results: 500,
        status: ['PUBLISHED'],
        datamart_id: datamart.id,
      })
      .then(res => res.data)
      .then(res => this.setState({ partitions: res, loading: false }))
      .catch(err => {
        notifyError(err);
        this.setState({ loading: false });
      });
  };

  save = (formData: LookAlikeFormData): any => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      notifyError,
    } = this.props;
    return this.setState({ loading: true }, () => {
      const { extension_factor, ...rest } = formData;
      const formattedFormData = extension_factor
        ? { ...rest, extension_factor: extension_factor / 100 }
        : { ...rest };
      AudienceSegmentService.createAudienceSegment(
        organisationId,
        formattedFormData,
      )
        .then(res => res.data)
        .then(res => {
          this.setState({ loading: false }, () => {
            this.props.close();
            history.push(`/v2/o/${organisationId}/audience/segments/${res.id}`);
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ loading: false });
        });
    });
  };

  render() {
    const {
      intl,
      handleSubmit,
      breadCrumbPaths,
      fieldValidators: { isRequired },
      close,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.lookAlikeCreation,
      onClose: close,
    };

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
    }
    // const defaultValue = this.state.partitions.length && this.state.partitions[0].id ? this.state.partitions[0].id : '';

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout>
          <Form
            onSubmit={handleSubmit(this.save) as any}
            className={'edit-layout ant-layout'}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div className="m-t-20 m-b-20">
                {intl.formatMessage(messages.lookAlikeModalHelper)}
              </div>
              <div>
                <FormInputField
                  name="name"
                  component={FormInput}
                  validate={[isRequired]}
                  props={{
                    formItemProps: {
                      label: intl.formatMessage(
                        messages.lookAlikeModalNameLabel,
                      ),
                      required: true,
                      ...fieldGridConfig,
                    },
                    inputProps: {
                      placeholder: intl.formatMessage(
                        messages.lookAlikeModalNameLabel,
                      ),
                    },
                  }}
                />
              </div>
              <div>
                <FormSelectField
                  name="audience_partition_id"
                  component={DefaultSelect}
                  options={this.state.partitions.map(i => {
                    return { title: i.name, value: i.id };
                  })}
                  validate={[isRequired]}
                  formItemProps={{
                    label: intl.formatMessage(
                      messages.lookAlikeModalPartitionLabel,
                    ),
                    required: true,
                    ...fieldGridConfig,
                  }}
                />
              </div>

              <div>
                <FormSliderField
                  name="extension_factor"
                  component={FormSlider}
                  validate={[isRequired]}
                  formItemProps={{
                    label: intl.formatMessage(
                      messages.lookAlikeModalExtentionFactorLabel,
                    ),
                    required: true,
                    ...fieldGridConfig,
                  }}
                  inputProps={{
                    defaultValue: 30,
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

export default compose<Props, AudienceLookalikeCreationProps>(
  withRouter,
  injectDatamart,
  withValidators,
  injectIntl,
  injectNotifications,
  reduxForm<{}, AudienceLookalikeCreationProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AudienceLookalikeCreation);
