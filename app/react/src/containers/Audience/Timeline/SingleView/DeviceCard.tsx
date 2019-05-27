import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '../../../../components/Card/index';
import Device from './Device';
import messages from '../messages';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import {
  isUserAgentIdentifier,
  UserAgentIdentifierInfo,
} from '../../../../models/timeline/timeline';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IUserDataService } from '../../../../services/UserDataService';

interface DeviceCardProps {
  selectedDatamart: DatamartResource;
  userPointId: string;
}

interface State {
  showMore: boolean;
  userAgentsIdentifierInfo?: UserAgentIdentifierInfo[];
  hasItems?: boolean;
}

type Props = DeviceCardProps & InjectedIntlProps;

class DeviceCard extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  componentDidMount() {
    const { selectedDatamart, userPointId } = this.props;

    this.fetchUserAgents(selectedDatamart, userPointId);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { selectedDatamart, userPointId } = this.props;

    const {
      selectedDatamart: nextSelectedDatamart,
      userPointId: nextUserPointId,
    } = nextProps;

    if (
      selectedDatamart !== nextSelectedDatamart ||
      userPointId !== nextUserPointId
    ) {
      this.fetchUserAgents(nextSelectedDatamart, nextUserPointId);
    }
  }

  fetchUserAgents = (datamart: DatamartResource, userPointId: string) => {
    const identifierType = 'user_point_id';

    this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userPointId,
      )
      .then(response => {
        const userAgentsIdentifierInfo = response.data.filter(
          isUserAgentIdentifier,
        );

        const hasItems = Object.keys(response.data).length > 0;

        this.setState({
          userAgentsIdentifierInfo: userAgentsIdentifierInfo,
          hasItems: hasItems,
        });
      });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const { userAgentsIdentifierInfo, hasItems } = this.state;

    const userAgents = userAgentsIdentifierInfo || [];
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

    const isLoading =
      userAgentsIdentifierInfo === undefined || hasItems === undefined;

    return (
      <Card title={formatMessage(messages.deviceTitle)} isLoading={isLoading}>
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
        {(accountsFormatted.length === 0 || hasItems === false) && (
          <span>
            <FormattedMessage {...messages.emptyDevice} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={handleViewMore(true)}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
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
