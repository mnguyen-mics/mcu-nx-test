import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage, defineMessages } from 'react-intl';
import { DatamartReplicationRouteMatchParam } from './domain';
import { Card, Button } from '@mediarithmics-private/mcs-components-library';
import { ReplicationType } from '../../../../../models/settings/settings';

const messagesMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  GOOGLE_PUBSUB: {
    id: 'settings.datamart.datamartReplication.create.replicationType.googlePubSub',
    defaultMessage: 'Google Pub/Sub',
  },
  AZURE_EVENT_HUBS: {
    id: 'settings.datamart.datamartReplication.create.replicationType.azureEventHubs',
    defaultMessage: 'Microsoft Azure Event Hubs',
  },
  selectButton: {
    id: 'settings.datamart.datamartReplication.create.replicationType.selectButton',
    defaultMessage: 'Select',
  },
  selectButtonTooltip: {
    id: 'settings.datamart.datamartReplication.create.replicationType.selectButton.tooltip',
    defaultMessage: 'Click here to select this replication type.',
  },
});

export interface DatamartReplicationCardProps {
  type: ReplicationType;
  onClick: (type: string) => void;
}

type Props = DatamartReplicationCardProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam> &
  InjectedIntlProps;

class DatamartReplicationCard extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isTooltipVisible: false,
    };
  }
  showTooltip = () => {
    this.setState({ isTooltipVisible: true });
  };

  hideTooltip = () => {
    this.setState({ isTooltipVisible: false });
  };

  renderImage = (type: ReplicationType) => {
    switch (type) {
      case 'GOOGLE_PUBSUB':
        return (
          <img
            alt='logo-google-pubsub'
            className='replication-logo'
            src={`https://assets.mediarithmics.com/1/public/assets/1580747629223-sdjBhPFh/google-pubsub-logo.svg`}
          />
        );
      case 'AZURE_EVENT_HUBS':
        return (
          <img
            alt='logo-microsoft-azure-event-hubs'
            className='replication-logo'
            src={`https://assets.mediarithmics.io/1/public/assets/1608210980698-rLbvZaLF/azure-event-hub.png`}
          />
        );
      default:
        return <div className='placeholder' />;
    }
  };

  render() {
    const {
      type,
      intl: { formatMessage },
    } = this.props;
    const onClickSelect = () => {
      this.props.onClick(type);
    };
    return (
      <div key={type} className='replication-card' onClick={onClickSelect}>
        <Card className='replication-card hoverable' type='flex'>
          <div className='image-placeholder'>{this.renderImage(type)}</div>
          <div className='replication-title'>{formatMessage(messagesMap[type])}</div>
          <div className='select-button'>
            <Button
              className='button'
              onClick={onClickSelect}
              onMouseEnter={this.showTooltip}
              onMouseLeave={this.hideTooltip}
            >
              {formatMessage(messagesMap.selectButton)}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}

export default compose<Props, DatamartReplicationCardProps>(
  withRouter,
  injectIntl,
)(DatamartReplicationCard);
