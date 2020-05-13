import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import { DatamartReplicationRouteMatchParam } from './domain';
import { ButtonStyleless } from '../../../../../components';
import { Card } from '@mediarithmics-private/mcs-components-library';

const messagesMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  GOOGLE_PUBSUB: {
    id:
      'settings.datamart.datamartReplication.create.replicationType.googlePubSub',
    defaultMessage: 'Google Pub/Sub',
  },
  selectButton: {
    id:
      'settings.datamart.datamartReplication.create.replicationType.selectButton',
    defaultMessage: 'Select',
  },
  selectButtonTooltip: {
    id:
      'settings.datamart.datamartReplication.create.replicationType.selectButton.tooltip',
    defaultMessage: 'Click here to select this replication type.',
  },
});

export interface DatamartReplicationCardProps {
  type: string;
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

  render() {
    const {
      type,
      intl: { formatMessage },
    } = this.props;
    const onClickSelect = () => {
      this.props.onClick(type);
    };
    return (
      <div key={type} className="replication-card" onClick={onClickSelect}>
        <Card className="replication-card hoverable" type="flex">
          <div className="image-placeholder">
            {/* TO DO: <img src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${replication.assetUrl}`} /> */}
            {type === 'GOOGLE_PUBSUB' ? (
              <img
                alt="logo-google-pubsub"
                className="replication-logo"
                src={`https://assets.mediarithmics.com/1/public/assets/1580747629223-sdjBhPFh/google-pubsub-logo.svg`}
              />
            ) : (
              <div className="placeholder" />
            )}
          </div>
          <div className="replication-title">
            {formatMessage(messagesMap[type])}
          </div>

          <div className="select-button">
            <ButtonStyleless
              className="button"
              onClick={onClickSelect}
              onMouseEnter={this.showTooltip}
              onMouseLeave={this.hideTooltip}
            >
              {formatMessage(messagesMap.selectButton)}
            </ButtonStyleless>
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
