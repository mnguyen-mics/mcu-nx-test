import * as React from 'react';
import { compose } from 'recompose';
import { message } from 'antd';

import AudiencePartitionForm from './AudiencePartitionForm';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, StaticContext, withRouter } from 'react-router';
import { Loading } from '../../../../../components/index';
import { AudiencePartitionFormData, INITIAL_AUDIENCE_PARTITION_FORM_DATA } from './domain';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import DatamartSelector from './../../../../Datamart/DatamartSelector';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { IAudiencePartitionsService } from '../../../../../services/AudiencePartitionsService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { Link } from 'react-router-dom';

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

interface AudiencePartitionPageState {
  partitionFormData?: AudiencePartitionFormData;
  isLoading: boolean;
  selectedDatamart?: DatamartResource;
}

type JoinedProps = InjectedWorkspaceProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<
    { organisationId: string; partitionId: string },
    StaticContext,
    { from?: string }
  >;

class AudiencePartitionPage extends React.Component<JoinedProps, AudiencePartitionPageState> {
  @lazyInject(TYPES.IAudiencePartitionsService)
  private _audiencePartitionsService: IAudiencePartitionsService;
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { partitionId },
      },
    } = this.props;
    if (partitionId) {
      this._audiencePartitionsService
        .getPartition(partitionId)
        .then(resp => resp.data)
        .then(partitionRes => {
          this.setState({
            partitionFormData: partitionRes,
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
      match: {
        params: { partitionId, organisationId },
      },
      history,
      location,
      intl,
      workspace,
    } = this.props;
    const { selectedDatamart } = this.state;
    this.setState({
      isLoading: true,
    });
    formData.type = 'AUDIENCE_PARTITION';
    if (partitionId) {
      this._audiencePartitionsService
        .savePartition(partitionId, formData)
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
      const datamartId = selectedDatamart ? selectedDatamart.id : workspace.datamarts[0].id;
      this._audiencePartitionsService
        .createPartition(organisationId, datamartId, formData)
        .then(newAudiencePartition => {
          const url = `/v2/o/${organisationId}/settings/datamart/audience/partitions/${newAudiencePartition.data.id}`;
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
      match: {
        params: { organisationId, partitionId },
      },
      location,
    } = this.props;
    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/audience/partitions${
      partitionId ? `/${partitionId}` : ''
    }`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamart: datamart,
    });
  };

  render() {
    const {
      intl,
      match: {
        params: { partitionId, organisationId },
      },
      workspace,
    } = this.props;
    const { partitionFormData, isLoading, selectedDatamart } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    } else {
      const breadcrumbPaths = [
        <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/audience/partitions`}>
          {intl.formatMessage(messages.partitions)}
        </Link>,
      ];
      const actionbarProps = {
        onClose: this.redirect,
        formId: 'audienceSegmentForm',
        pathItems: breadcrumbPaths,
      };
      return partitionId || workspace.datamarts.length === 1 || selectedDatamart ? (
        <AudiencePartitionForm
          initialValues={partitionFormData}
          onSubmit={this.save}
          close={this.redirect}
          breadCrumbPaths={breadcrumbPaths}
        />
      ) : (
        <DatamartSelector onSelect={this.onDatamartSelect} actionbarProps={actionbarProps} />
      );
    }
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
  injectWorkspace,
  injectNotifications,
)(AudiencePartitionPage);
