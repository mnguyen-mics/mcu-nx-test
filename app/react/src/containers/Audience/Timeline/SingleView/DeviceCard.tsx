import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import Device from './Device';
import messages from '../messages';
import { UserAgentIdentifierInfo } from '../../../../models/timeline/timeline';

interface DeviceCardProps {
  dataSource: UserAgentIdentifierInfo[];
  isLoading: boolean;
}

interface State {
  showMore: boolean;
}

type Props = DeviceCardProps & InjectedIntlProps;

class DeviceCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  render() {
    const {
      intl: { formatMessage },
      dataSource,
      isLoading,
    } = this.props;

    const userAgents = dataSource || [];
    let accountsFormatted: any[] = [];
    if (userAgents.length > 5 && !this.state.showMore) {
      accountsFormatted = accountsFormatted.concat(userAgents).splice(0, 5);
    } else {
      accountsFormatted = accountsFormatted.concat(userAgents);
    }
    const canViewMore = userAgents.length > 5 ? true : false;

    const handleViewMore = (visible: boolean) => () => {
      this.setState({ showMore: visible });
    };

    return (
      <Card title={formatMessage(messages.deviceTitle)} isLoading={isLoading} className={'mcs-deviceCard'}>
        {accountsFormatted &&
          accountsFormatted.map(agent => {
            return agent.device ? (
              <Device
                key={agent.vector_id}
                vectorId={agent.vector_id}
                device={agent.device}
              />
            ) : (
              <div key={agent.vector_id}>{agent.vector_id}</div>
            );
          })}
        {(accountsFormatted.length === 0 || dataSource.length === 0) && (
          <span>
            <FormattedMessage {...messages.emptyDevice} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link mcs-deviceCard_viewMoreLink"
                onClick={handleViewMore(true)}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link mcs-deviceCard_viewLessLink"
                onClick={handleViewMore(false)}
              >
                <FormattedMessage {...messages.viewLess} />
              </button>
            </div>
          )
        ) : null}
      </Card>
    );
  }
}

export default injectIntl(DeviceCard);
