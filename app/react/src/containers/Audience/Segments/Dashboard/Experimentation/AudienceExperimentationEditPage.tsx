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
// import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import AudienceExperimentationForm, {
  messagesMap,
} from './AudienceExperimentationForm';
import { SearchFilter } from '../../../../../components/ElementSelector';
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

  fetchAudiencePartitions = (filter?: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: GetPartitionOption = {
      first_result: 0,
      max_results: 10,
      status: ['PUBLISHED'],
    };
    if (filter && filter.pageSize) {
      options.max_results = filter.pageSize;
    }
    if (filter && filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (filter && filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (filter && filter.datamartId) {
      options.datamart_id = filter.datamartId;
    }

    return this._audiencePartitionService.getPartitions(
      organisationId,
      options,
    );
  };

  fetchAudiencePartition = (id: string) => {
    return this._audiencePartitionService.getPartition(id);
  };

  save = (formData: ExperimentationFormData) => {
    const {
      match: {
        params: { organisationId },
      },
      segment,
      intl,
      notifyError,
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
      try {
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
                    query_language: 'OTQL',
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
                              });
                          });
                      });
                  });
              });
          });
      } catch (error) {
        notifyError(error);
        hideSaveInProgress();
      }
    }
  };

  render() {
    const { breadCrumbPaths, close } = this.props;
    const { formData } = this.state;

    return (
      <AudienceExperimentationForm
        initialValues={formData}
        close={close}
        onSubmit={this.save}
        breadCrumbPaths={breadCrumbPaths}
        fetchAudiencePartitions={this.fetchAudiencePartitions}
        fetchAudiencePartition={this.fetchAudiencePartition}
      />
    );
  }
}

export default compose<Props, AudienceExperimentationEditPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(AudienceExperimentationEditPage);
