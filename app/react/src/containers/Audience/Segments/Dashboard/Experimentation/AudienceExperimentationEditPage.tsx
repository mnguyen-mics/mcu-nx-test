import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Path } from '../../../../../components/ActionBar';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import {
  IAudiencePartitionsService,
  GetPartitionOption,
} from '../../../../../services/AudiencePartitionsService';
import { Omit } from '../../../../../utils/Types';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import AudienceExperimentationForm, {
  messagesMap,
} from './AudienceExperimentationForm';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { IQueryService } from '../../../../../services/QueryService';
import {
  UserQuerySegment,
  UserPartitionSegment,
} from '../../../../../models/audiencesegment/AudienceSegmentResource';
import { message } from 'antd';

type Engagement = 'E_COMMERCE_ENGAGEMENT' | 'CHANNEL_ENGAGEMENT';

export const INITIAL_EXPERIMENTATION_FORM_DATA = {
  engagement: 'E_COMMERCE_ENGAGEMENT' as Engagement,
  control: 0,
};

export interface AudienceExperimentationEditPageProps
  extends Omit<ConfigProps<any>, 'form'> {
  breadCrumbPaths: Path[];
  close: () => void;
  segment: UserQuerySegment;
}

export interface ExperimentationFormData {
  selectedPartition?: AudiencePartitionResource;
  engagement: Engagement;
  control: number;
}

interface State {
  loadingPartitions: boolean;
  partitions: AudiencePartitionResource[];
  formData: ExperimentationFormData;
  isSaving: boolean;
}

type Props = AudienceExperimentationEditPageProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps &
  ReduxFormChangeProps &
  InjectedFormProps<any, AudienceExperimentationEditPageProps> &
  InjectedNotificationProps &
  ValidatorProps;

class AudienceExperimentationEditPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudiencePartitionsService)
  private _audiencePartitionService: IAudiencePartitionsService;
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loadingPartitions: true,
      partitions: [],
      formData: INITIAL_EXPERIMENTATION_FORM_DATA,
      isSaving: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      segment,
    } = this.props;
    const options: GetPartitionOption = {
      first_result: 0,
      max_results: 100,
      status: ['PUBLISHED'],
      datamart_id: segment.datamart_id,
    };
    this.setState({
      loadingPartitions: true,
    });
    return this._audiencePartitionService
      .getPartitions(organisationId, options)
      .then(res => {
        this.setState({
          partitions: res.data,
          loadingPartitions: false,
        });
      })

      .catch(error => {
        this.setState({
          loadingPartitions: false,
        });
      });
  }

  save = (formData: ExperimentationFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      segment,
      intl,
      notifyError,
      history,
    } = this.props;
    this.setState({
      isSaving: true,
    });
    const hideSaveInProgress = message.loading(
      intl.formatMessage(messagesMap.savingInProgress),
      0,
    );

    const excludingQuery = (exclude: boolean) => (
      acc: string,
      val: UserPartitionSegment,
      index: number,
    ) => {
      const not = exclude ? 'NOT ' : '';
      const and = index !== 0 ? 'AND ' : '';
      return acc.concat(`${and}${not}segments { id = "${val.id}"} `);
    };

    const datamartId = segment.datamart_id;
    const partitionId =
      formData.selectedPartition && formData.selectedPartition.id;
    const queryId = segment.query_id;
    if (partitionId && queryId) {
      this._audienceSegmentService
        .getSegments(organisationId, {
          audience_partition_id: partitionId,
          type: 'USER_PARTITION',
          max_results: 500,
        })
        .then(segmentsRes => {
          const controlGroupQuery = segmentsRes.data.reduce(
            excludingQuery(false),
            'WHERE ',
          );
          const experimentationQuery = segmentsRes.data.reduce(
            excludingQuery(true),
            'WHERE ',
          );
          this._queryService
            .getQuery(datamartId, queryId)
            .then(querySegmentRes => {
              this._queryService
                .createQuery(datamartId, {
                  datamart_id: datamartId,
                  query_language: querySegmentRes.data.query_language,
                  query_text: `${querySegmentRes.data.query_text} ${controlGroupQuery}`,
                })
                .then(queryRes => {
                  // Control Group Segment Creation
                  this._audienceSegmentService
                    .createAudienceSegment(organisationId, {
                      name: `${segment.name}-control-group`,
                      type: 'USER_QUERY',
                      datamart_id: datamartId,
                      subtype: 'AB_TESTING_CONTROL_GROUP',
                      weight: formData.control,
                      query_id: queryRes.data.id,
                    })
                    .then(segmentRes => {
                      // Experimentation Creation
                      this._queryService
                        .updateQuery(datamartId, queryId, {
                          query_text: `${querySegmentRes.data.query_text} ${experimentationQuery}`,
                        })
                        .then(queryResponse => {
                          this._audienceSegmentService
                            .updateAudienceSegment(segment.id, {
                              ...segment,
                              query_id: queryResponse.data.id,
                              weight: formData.control,
                              target_metric: formData.engagement,
                              control_group_id: segmentRes.data.id,
                              subtype: 'AB_TESTING_EXPERIMENT',
                            })
                            .then(res => {
                              hideSaveInProgress();
                              message.success(
                                intl.formatMessage(
                                  messagesMap.successfullyCreated,
                                ),
                                3,
                              );
                              history.push(
                                `v2/o/${organisationId}/audience/segments`,
                              );
                            })
                            .catch(error => {
                              notifyError(error);
                              hideSaveInProgress();
                            });
                        })
                        .catch(error => {
                          notifyError(error);
                          hideSaveInProgress();
                        });
                    })
                    .catch(error => {
                      notifyError(error);
                      hideSaveInProgress();
                    });
                })
                .catch(error => {
                  notifyError(error);
                  hideSaveInProgress();
                });
            })
            .catch(error => {
              notifyError(error);
              hideSaveInProgress();
            });
        })
        .catch(error => {
          notifyError(error);
          hideSaveInProgress();
        });
    }
  };

  render() {
    const { breadCrumbPaths, close } = this.props;
    const { formData, partitions, loadingPartitions } = this.state;

    return (
      <AudienceExperimentationForm
        initialValues={formData}
        close={close}
        onSubmit={this.save}
        breadCrumbPaths={breadCrumbPaths}
        partitions={partitions}
        loadingPartitions={loadingPartitions}
      />
    );
  }
}

export default compose<Props, AudienceExperimentationEditPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(AudienceExperimentationEditPage);
