import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { reduxForm, InjectedFormProps, Form, ConfigProps, getFormValues } from 'redux-form';
import {
  FormInputField,
  FormInput,
  FormSelectField,
  DefaultSelect,
  FormSliderField,
  FormSlider,
  withValidators,
  FormTitle,
  FormFieldWrapper,
  FormTextArea,
  FormTextAreaField,
} from '../../../../../components/Form';
import { injectDatamart } from '../../../../Datamart';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  Messages,
  FormattedMessage,
} from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import messages from '../messages';
import { Omit } from '../../../../../utils/Types';
import { Layout, Row, Spin, Alert, Col } from 'antd';
import {
  UserLookalikeByCohortsSegment,
  UserLookalikeSegment,
} from '../../../../../models/audiencesegment/AudienceSegmentResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { Loading } from '../../../../../components';
import { IAudiencePartitionsService } from '../../../../../services/AudiencePartitionsService';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { McsIcon, MenuList, MentionTag } from '@mediarithmics-private/mcs-components-library';
import { IQueryService } from '../../../../../services/QueryService';
import { connect } from 'react-redux';

const FORM_ID = 'lookalikeForm';
const { Content } = Layout;
type LookalikeType =
  | 'PARTITION_BASED_LOOKALIKE'
  | 'COHORT_BASED_LOOKALIKE'
  | 'SCORE_BASED_LOOKALIKE';

const messagesMap: {
  titles: Messages;
  subtitles: Messages;
} = {
  titles: defineMessages({
    PARTITION_BASED_LOOKALIKE: {
      id: 'audience.segments.lookaliketypeSelector.type.partitionBased.title',
      defaultMessage: 'Partition based lookalike',
    },
    COHORT_BASED_LOOKALIKE: {
      id: 'audience.segments.lookaliketypeSelector.type.cohortBased.title',
      defaultMessage: 'Cohort based lookalike',
    },
    SCORE_BASED_LOOKALIKE: {
      id: 'audience.segments.lookaliketypeSelector.type.scoreBased.title',
      defaultMessage: 'Score based lookalike',
    },
  }),
  subtitles: defineMessages({
    PARTITION_BASED_LOOKALIKE: {
      id: 'audience.segments.lookaliketypeSelector.type.partitionBased.subtitle',
      defaultMessage: 'Uses technical partitioning created in your environment',
    },
    COHORT_BASED_LOOKALIKE: {
      id: 'audience.segments.lookaliketypeSelector.type.cohortBased',
      defaultMessage: 'Uses cohorts calculated by our standard machine learning algorithm',
    },
    SCORE_BASED_LOOKALIKE: {
      id: 'audience.segments.lookaliketypeSelector.type.scoreBased',
      defaultMessage: 'Uses a specific machine learning function tailored to your needs',
    },
  }),
};

interface MapStateToProps {
  formValues: any;
}

export interface AudienceLookalikeCreationProps extends Omit<ConfigProps<any>, 'form'> {
  breadCrumbPaths: React.ReactNode[];
  close: () => void;
  datamartId: string;
}

interface AudienceLookalikeState {
  partitions: AudiencePartitionResource[];
  loading: boolean;
  lookalikeType?: LookalikeType;
  extensionRatio?: number;
  similarity: number;
  min?: number;
  max?: number;
}

type LookAlikeFormData = Partial<UserLookalikeSegment>;

type Props = AudienceLookalikeCreationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps &
  MapStateToProps &
  InjectedFormProps<any, AudienceLookalikeCreationProps> &
  InjectedNotificationProps &
  InjectedFeaturesProps &
  ValidatorProps;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 19, offset: 1 },
};

class AudienceLookalikeCreation extends React.Component<Props, AudienceLookalikeState> {
  @lazyInject(TYPES.IAudiencePartitionsService)
  private _audiencePartitionsService: IAudiencePartitionsService;
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      partitions: [],
      loading: true,
      lookalikeType: undefined,
      similarity: 0,
    };
  }

  componentDidMount() {
    this.fetchAudiencePartition();
    this.getMinValue();
    this.getMaxValue();
  }

  fetchAudiencePartition = () => {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
      notifyError,
    } = this.props;
    this._audiencePartitionsService
      .getPartitions(organisationId, {
        first_result: 0,
        max_results: 500,
        status: ['PUBLISHED'],
        datamart_id: datamartId,
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
      datamartId,
      formValues,
    } = this.props;
    const { lookalikeType, similarity } = this.state;

    if (lookalikeType) {
      return this.setState({ loading: true }, () => {
        const { extension_factor, ...rest } = formData;
        const formattedFormData = extension_factor
          ? { ...rest, extension_factor: extension_factor }
          : { ...rest };

        const getPromise = () => {
          if (lookalikeType === 'PARTITION_BASED_LOOKALIKE')
            return this._audienceSegmentService.createAudienceSegment(
              organisationId,
              formattedFormData,
            );
          else if (lookalikeType === 'SCORE_BASED_LOOKALIKE')
            return this._queryService
              .createQuery(datamartId, {
                datamart_id: datamartId,
                query_language: 'OTQL',
                query_text: `SELECT @count{} FROM UserPoint WHERE segments { id = "${
                  formValues.source_segment_id
                }" } OR segment_scores { scores { score >=  ${-similarity}} } `,
              })
              .then(resp => {
                return resp.data;
              })
              .then(queryResource => {
                return this._audienceSegmentService.createAudienceSegment(organisationId, {
                  ...rest,
                  type: 'USER_QUERY',
                  query_id: queryResource.id,
                  extension_factor: similarity / 100,
                });
              });
          else {
            // if (lookalikeType === 'COHORT_BASED_LOOKALIKE')
            const cohortResource: Partial<UserLookalikeByCohortsSegment> = {
              source_segment_id: formData.source_segment_id,
              type: 'USER_LOOKALIKE_BY_COHORTS',
              short_description: formData.short_description,
              lookalike_algorithm: 'COHORT_OVERLAP',
              datamart_id: datamartId,
              organisation_id: organisationId,
              name: formData.name,
              include_seed_segment: true,
            };
            return this._audienceSegmentService.createAudienceSegment(
              organisationId,
              cohortResource,
            );
          }
        };
        getPromise()
          .then(res => res.data)
          .then(res => {
            this.setState({ loading: false }, () => {
              this.props.close();
              history.push({
                pathname: `/v2/o/${organisationId}/audience/segments/${res.id}`,
                state: { tab: 'COHORT' },
              });
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState({ loading: false });
          });
      });
    }
  };

  onSelectLookalikeType = (type: LookalikeType) => {
    this.setState({
      lookalikeType: type,
    });
  };

  getMinValue = () => {
    const { datamartId } = this.props;

    const q = 'SELECT { segment_scores { scores { score @min } } } FROM UserPoint';

    return this._queryService
      .runOTQLQuery(datamartId, q, 'DASHBOARD', 'STANDARD_SEGMENT_BUILDER_DASHBOARD', {
        use_cache: true,
      })
      .then(otqlResultResp => {
        return otqlResultResp.data.rows[0].aggregations.metric_aggregations[0].value;
      })
      .then(result => {
        this.setState({
          min: result,
        });
      });
  };

  getMaxValue = () => {
    const { datamartId } = this.props;

    const q = 'SELECT { segment_scores { scores { score @max } } } FROM UserPoint';

    return this._queryService
      .runOTQLQuery(datamartId, q, 'DASHBOARD', 'STANDARD_SEGMENT_BUILDER_DASHBOARD', {
        use_cache: true,
      })
      .then(otqlResultResp => {
        return otqlResultResp.data.rows[0].aggregations.metric_aggregations[0].value;
      })
      .then(result => {
        this.setState({
          max: result,
          similarity: -result,
        });
      });
  };

  onChange = (value: number) => {
    this.setState({
      similarity: value,
    });
  };

  onAfterChange = (value: number) => {
    const { datamartId, formValues } = this.props;
    const q1 = `SELECT @count{} FROM UserPoint WHERE segments { id = "${formValues.source_segment_id}" }`;

    const q2 = `SELECT @count{} FROM UserPoint WHERE segments { id = "${
      formValues.source_segment_id
    }" } OR segment_scores { scores { score >=  ${-value}} } `;

    this._queryService
      .runOTQLQuery(datamartId, q1, 'DASHBOARD', 'STANDARD_SEGMENT_BUILDER_DASHBOARD', {
        use_cache: true,
      })
      .then(otqlResultResp => {
        return otqlResultResp.data.rows[0].count;
      })
      .then(result1 => {
        this._queryService
          .runOTQLQuery(datamartId, q2, 'DASHBOARD', 'STANDARD_SEGMENT_BUILDER_DASHBOARD', {
            use_cache: true,
          })
          .then(otqlResultResp => {
            return otqlResultResp.data.rows[0].count;
          })
          .then(result2 => {
            this.setState({
              extensionRatio: ((result2 - result1) * 100) / result1,
            });
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
      hasFeature,
    } = this.props;

    const { lookalikeType, extensionRatio, similarity, max, min } = this.state;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.lookAlikeCreation,
      onClose: close,
    };

    if (this.state.loading) {
      return <Loading isFullScreen={true} />;
    }

    if (lookalikeType) {
      if (lookalikeType === 'PARTITION_BASED_LOOKALIKE') {
        return (
          <Layout className='edit-layout'>
            <FormLayoutActionbar {...actionBarProps} />
            <Layout>
              <Form onSubmit={handleSubmit(this.save) as any} className={'edit-layout ant-layout'}>
                <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
                  <div className='m-t-20 m-b-20'>
                    {intl.formatMessage(messages.lookAlikeModalHelper)}
                  </div>
                  <div>
                    <FormInputField
                      name='name'
                      component={FormInput}
                      validate={[isRequired]}
                      props={{
                        formItemProps: {
                          label: intl.formatMessage(messages.lookAlikeModalNameLabel),
                          required: true,
                          ...fieldGridConfig,
                        },
                        inputProps: {
                          className: 'mcs-audienceLookAlikeCreation_segmentName',
                          placeholder: intl.formatMessage(messages.lookAlikeModalNameLabel),
                        },
                      }}
                    />
                  </div>
                  <div>
                    <FormSelectField
                      name='audience_partition_id'
                      component={DefaultSelect}
                      options={this.state.partitions.map(i => {
                        return { title: i.name || i.id, value: i.id };
                      })}
                      validate={[isRequired]}
                      formItemProps={{
                        label: intl.formatMessage(messages.lookAlikeModalPartitionLabel),
                        required: true,
                        ...fieldGridConfig,
                      }}
                    />
                  </div>

                  <div>
                    {this.props.formValues.audience_partition_id ? (
                      <FormSliderField
                        name='extension_factor'
                        component={FormSlider}
                        validate={[isRequired]}
                        formItemProps={{
                          label: intl.formatMessage(messages.lookAlikeModalExtentionFactorLabel),
                          required: true,
                          ...fieldGridConfig,
                        }}
                        inputProps={{
                          min: 1,
                          max: this.state.partitions
                            .filter(
                              partition =>
                                partition.id === this.props.formValues.audience_partition_id,
                            )
                            .map(p => p.part_count)[0],
                        }}
                        helpToolTipProps={{
                          title: intl.formatMessage(messages.tooltipExtensionFactor),
                        }}
                      />
                    ) : (
                      <Row>
                        <Col offset={4} style={{ width: '66%' }}>
                          <Alert
                            message={
                              <div>
                                <McsIcon type={'warning'} />
                                {intl.formatMessage(messages.extensionFactorError)}
                              </div>
                            }
                            type={'error'}
                          />
                        </Col>
                      </Row>
                    )}
                  </div>
                </Content>
              </Form>
            </Layout>
          </Layout>
        );
      } else if (lookalikeType === 'SCORE_BASED_LOOKALIKE') {
        return (
          <Layout className='edit-layout'>
            <FormLayoutActionbar {...actionBarProps} />
            <Layout>
              <Form onSubmit={handleSubmit(this.save) as any} className={'edit-layout ant-layout'}>
                <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
                  <div className='m-t-20 m-b-20'>
                    {intl.formatMessage(messages.lookAlikeModalHelper)}
                  </div>
                  <div>
                    <FormInputField
                      name='name'
                      component={FormInput}
                      validate={[isRequired]}
                      props={{
                        formItemProps: {
                          label: intl.formatMessage(messages.lookAlikeModalNameLabel),
                          required: true,
                          ...fieldGridConfig,
                        },
                        inputProps: {
                          placeholder: intl.formatMessage(messages.lookAlikeModalNameLabel),
                        },
                      }}
                    />
                  </div>

                  <div>
                    {min && max ? (
                      <FormSliderField
                        name='extension_factor'
                        component={FormSlider}
                        validate={[isRequired]}
                        formItemProps={{
                          label: intl.formatMessage(messages.similarity),
                          required: true,
                          ...fieldGridConfig,
                        }}
                        inputProps={{
                          value: similarity,
                          min: -Math.round(max),
                          max: -Math.round(min),
                          onChange: this.onChange,
                          onAfterChange: this.onAfterChange,
                          tooltipVisible: false,
                        }}
                      />
                    ) : (
                      <Spin />
                    )}
                  </div>
                  <div>
                    <FormFieldWrapper
                      label={intl.formatMessage(messages.extensionFactor)}
                      {...fieldGridConfig}
                    >
                      <span className='lookalike-form-extensionFactor'>
                        {`${extensionRatio ? extensionRatio.toFixed(2) : '-'} %`}
                      </span>
                    </FormFieldWrapper>
                  </div>
                  {extensionRatio && extensionRatio > 100 && (
                    <Alert
                      className={'m-b-20'}
                      message={intl.formatMessage(messages.lookalikeTooBroad)}
                      type='warning'
                    />
                  )}
                </Content>
              </Form>
            </Layout>
          </Layout>
        );
      } else {
        // Cohort based lookalike case
        return (
          <Layout className='edit-layout'>
            <FormLayoutActionbar {...actionBarProps} />
            <Layout>
              <Form onSubmit={handleSubmit(this.save) as any} className={'edit-layout ant-layout'}>
                <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
                  <div className='m-t-20 m-b-20'>
                    {intl.formatMessage(messages.cohortLookAlikeModalHelper)}
                  </div>
                  <div>
                    <FormInputField
                      name='name'
                      component={FormInput}
                      validate={[isRequired]}
                      props={{
                        formItemProps: {
                          label: intl.formatMessage(messages.lookAlikeModalNameLabel),
                          required: true,
                          ...fieldGridConfig,
                        },
                        inputProps: {
                          className: 'mcs-audienceLookAlikeCreation_segmentName',
                          placeholder: intl.formatMessage(messages.lookAlikeModalNameLabel),
                        },
                      }}
                    />
                  </div>
                  <div>
                    <FormTextAreaField
                      name='short_description'
                      component={FormTextArea}
                      props={{
                        formItemProps: {
                          label: intl.formatMessage(messages.lookAlikeModalDescriptionLabel),
                          ...fieldGridConfig,
                        },
                        inputProps: {
                          className: 'mcs-audienceLookAlikeCreation_description',
                          placeholder: intl.formatMessage(messages.lookAlikeModalDescriptionLabel),
                        },
                      }}
                    />
                  </div>
                </Content>
              </Form>
            </Layout>
          </Layout>
        );
      }
    } else {
      const { message, ...restActionBarProps } = actionBarProps;

      const authorizedLookalikeTypes: LookalikeType[] = ['PARTITION_BASED_LOOKALIKE'];

      // COHORT_BASED_LOOKALIKE need to be the second option if available
      if (hasFeature('audience-segments-cohort-lookalike'))
        authorizedLookalikeTypes.push('COHORT_BASED_LOOKALIKE');

      // see comment above
      authorizedLookalikeTypes.push('SCORE_BASED_LOOKALIKE');

      const subtitleMessage: FormattedMessage.Props = {
        values: { nbOfTypes: authorizedLookalikeTypes.length },
        ...messages.lookalikeTypeSelectorsubTitle,
      };

      return (
        <Layout className='edit-layout'>
          <FormLayoutActionbar {...restActionBarProps} />
          <Layout.Content className='mcs-content-container mcs-form-container text-center'>
            <FormTitle title={messages.lookalikeTypeSelectorTitle} subtitle={subtitleMessage} />
            <Row className='mcs-selector_container'>
              <Row className='menu'>
                {authorizedLookalikeTypes.map(type => {
                  const handleSelect = () => this.onSelectLookalikeType(type);
                  const title: React.ReactChild = (
                    <div className='algorithmSelectorTitle'>
                      {intl.formatMessage(messagesMap.titles[type])}
                      {type === 'COHORT_BASED_LOOKALIKE' ? (
                        <MentionTag mention={'ALPHA'} className='algorithmSelectorTag' />
                      ) : null}
                    </div>
                  );
                  return (
                    <MenuList
                      key={type}
                      title={title}
                      subtitles={[intl.formatMessage(messagesMap.subtitles[type])]}
                      select={handleSelect}
                    />
                  );
                })}
              </Row>
            </Row>
          </Layout.Content>
        </Layout>
      );
    }
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AudienceLookalikeCreationProps>(
  withRouter,
  injectDatamart,
  injectFeatures,
  withValidators,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
  reduxForm<{}, AudienceLookalikeCreationProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AudienceLookalikeCreation);
