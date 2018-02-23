import * as React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import McsIcon from '../../../../components/McsIcon';
import { Actionbar } from '../../../Actionbar';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { AudiencePartitionResource } from '../../../../models/audiencePartition/AudiencePartitionResource';

const messages = defineMessages({
  edit: {
    id: 'partition.dashboard.actionbar.edit',
    defaultMessage: 'Edit Partition',
  },
  partitions: {
    id: 'partition.dashboard.actionbar.breadcrumb',
    defaultMessage: 'Partitions',
  },
  partitionOverview: {
    id: 'partition.dashboard.actionbar.breadcrumb.default',
    defaultMessage: 'Partion Overview',
  },
});

interface PartitionActionBarProps {
  partition: AudiencePartitionResource;
}

interface PartitionActionBarState {}

type JoinedProps = PartitionActionBarProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; datamart: string }>;

class PartitionActionBar extends React.Component<
  JoinedProps,
  PartitionActionBarState
> {
  render() {
    const {
      match: { params: { organisationId } },
      intl,
      partition,
    } = this.props;

    const partitionName = partition.name
      ? partition.name
      : intl.formatMessage(messages.partitionOverview);

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.partitions),
        url: `/v2/o/${organisationId}/audience/partitions`,
      },
      {
        name: partitionName,
      },
    ];
    return (
      <Actionbar path={breadcrumbPaths}>
        <Link
          to={`/v2/o/${organisationId}/audience/partition/${partition.id}/edit`}
        >
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage {...messages.edit} />
          </Button>
        </Link>
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, PartitionActionBarProps>(
  injectIntl,
  withRouter,
)(PartitionActionBar);
