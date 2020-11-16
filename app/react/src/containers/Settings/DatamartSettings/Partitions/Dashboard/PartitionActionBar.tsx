import * as React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';

const messages = defineMessages({
  edit: {
    id: 'audience.partitions.dashboard.actionbar.edit',
    defaultMessage: 'Edit Partition',
  },
  publish: {
    id: 'audience.partitions.dashboard.actionbar.publish',
    defaultMessage: 'Publish',
  },
  partitions: {
    id: 'audience.partitions.dashboard.actionbar.breadcrumb',
    defaultMessage: 'Partitions',
  },
  partitionOverview: {
    id: 'audience.partitions.dashboard.actionbar.breadcrumb.default',
    defaultMessage: 'Partion Overview',
  },
});

interface PartitionActionBarProps {
  partition?: AudiencePartitionResource;
  publishPartition: () => void;
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
      match: {
        params: { organisationId },
      },
      intl,
      partition,
      publishPartition,
    } = this.props;

    const partitionName =
      partition && partition.name
        ? partition.name
        : intl.formatMessage(messages.partitionOverview);

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.partitions),
        path: `/v2/o/${organisationId}/settings/datamart/audience/partitions`,
      },
      {
        name: partitionName,
      },
    ];
    return (
      <Actionbar paths={breadcrumbPaths}>
        {partition && partition.status !== 'PUBLISHED' && (
          <Button
            className="mcs-primary"
            type="primary"
            onClick={publishPartition}
          >
            <McsIcon type="bolt" /> <FormattedMessage {...messages.publish} />
          </Button>
        )}
        <Link
          to={
            partition
              ? `/v2/o/${organisationId}/settings/datamart/audience/partitions/${
                  partition.id
                }/edit`
              : ''
          }
        >
          <Button className="mcs-primary">
            <McsIcon type="pen" /> <FormattedMessage {...messages.edit} />
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
