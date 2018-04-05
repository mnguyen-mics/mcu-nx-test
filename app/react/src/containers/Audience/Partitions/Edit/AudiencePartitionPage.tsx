import * as React from 'react';
import { compose } from 'recompose';
import { message } from 'antd';
import queryString from 'query-string';

import AudiencePartitionForm from './AudiencePartitionForm';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import AudiencePartitionsService from '../../../../services/AudiencePartitionsService';
import { Loading } from '../../../../components/index';
import {
  AudiencePartitionFormData,
  INITIAL_AUDIENCE_PARTITION_FORM_DATA,
} from './domain';
import { injectDatamart } from '../../../Datamart/index';
import { InjectedDatamartProps } from '../../../Datamart/injectDatamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const messages = defineMessages({
  editPartition: {
    id: 'edit.partition.form.button.save',
    defaultMessage: 'Edit Partition',
  },
  partition: {
    id: 'edit.partition.form.default.name.partition',
    defaultMessage: 'partition',
  },
  newPartition: {
    id: 'edit.partition.form.button.new.partition.',
    defaultMessage: 'New Partition',
  },
  partitions: {
    id: 'edit.partition.form.breadcrumb.partitions',
    defaultMessage: 'Partitions',
  },
  partitionSaved: {
    id: 'edit.partition.form.save.success',
    defaultMessage: 'Partition successfully saved.',
  },
});

interface AudiencePartitionPageProps {}

interface AudiencePartitionPageState {
  partitionFormData?: AudiencePartitionFormData;
  isLoading: boolean;
}

type JoinedProps = AudiencePartitionPageProps &
  InjectedDatamartProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

class AudiencePartitionPage extends React.Component<
  JoinedProps,
  AudiencePartitionPageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    const { match: { params: { partitionId } } } = this.props;
    if (partitionId) {
      AudiencePartitionsService.getPartition(partitionId)
        .then(resp => resp.data)
        .then(partitionFormdata => {
          this.setState({
            partitionFormData: {
              name: partitionFormdata.name,
              type: partitionFormdata.type,
              part_count: partitionFormdata.part_count,
              clustering_model_data_file_uri:
                partitionFormdata.clustering_model_data_file_uri,
              status: partitionFormdata.status,
            },
            isLoading: false,
          });
        });
    } else {
      this.setState({
        partitionFormData: INITIAL_AUDIENCE_PARTITION_FORM_DATA,
        isLoading: false,
      });
    }
  }

  save = (formData: AudiencePartitionFormData) => {
    const {
      match: { params: { partitionId, organisationId } },
      location: { search },
      history,
      location,
      intl,
    } = this.props;
    this.setState({
      isLoading: true,
    });
    formData.type = 'AUDIENCE_PARTITION';
    if (partitionId) {
      AudiencePartitionsService.savePartition(partitionId, formData)
        .then(() => {
          this.redirect();
          message.success(intl.formatMessage(messages.partitionSaved));
          this.setState({
            isLoading: false,
          });
        })
        .catch(error => {
          this.props.notifyError(error);
          this.setState({
            isLoading: false,
          });
        });
    } else {
      const query = queryString.parse(search);
      const datamartId = query.datamart
        ? query.datamart
        : this.props.datamart.id;
      AudiencePartitionsService.createPartition(
        organisationId,
        datamartId,
        formData,
      )
        .then(newAudiencePartition => {
          const url = `/v2/o/${organisationId}/audience/partitions/${
            newAudiencePartition.data.id
          }`;
          location.pathname
            ? history.push({
                pathname: url,
                state: { from: `${location.pathname}` },
              })
            : history.push(url);
          message.success(intl.formatMessage(messages.partitionSaved));
          this.setState({
            isLoading: false,
          });
        })
        .catch(error => {
          this.props.notifyError(error);
          this.setState({
            isLoading: false,
          });
        });
    }
  };

  redirect = () => {
    const {
      history,
      location,
      match: { params: { organisationId, partitionId } },
    } = this.props;
    const url = partitionId
      ? `/v2/o/${organisationId}/audience/partitions/${partitionId}`
      : `/v2/o/${organisationId}/audience/partitions`;

    return location.pathname
      ? history.push({
          pathname: url,
          state: { from: `${location.pathname}` },
        })
      : history.push(url);
  };

  render() {
    const {
      intl,
      match: { params: { partitionId, organisationId } },
    } = this.props;
    const { partitionFormData, isLoading } = this.state;
    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    } else {
      const placementListName =
        partitionId && partitionFormData
          ? intl.formatMessage(messages.editPartition, {
              name: partitionFormData.name
                ? partitionFormData.name
                : intl.formatMessage(messages.partition),
            })
          : intl.formatMessage(messages.newPartition);
      const breadcrumbPaths = [
        {
          name: intl.formatMessage(messages.partitions),
          url: `/v2/o/${organisationId}/audience/partitions`,
        },
        {
          name: placementListName,
        },
      ];
      return (
        <AudiencePartitionForm
          initialValues={this.state.partitionFormData}
          onSubmit={this.save}
          close={this.redirect}
          breadCrumbPaths={breadcrumbPaths}
        />
      );
    }
  }
}

export default compose<JoinedProps, AudiencePartitionPageProps>(
  injectIntl,
  withRouter,
  injectDatamart,
  injectNotifications,
)(AudiencePartitionPage);
