import * as React from 'react';
import { compose } from 'recompose';
import lodash from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Layout } from 'antd';
import MonitoringActionbar from './MonitoringActionBar';
import ProfileCard from './SingleView/ProfileCard';
import SegmentsCard from './SingleView/SegmentsCard';
import AccountIdCard from './SingleView/AccountIdCard';
import DeviceCard from './SingleView/DeviceCard';
import EmailCard from './SingleView/EmailCard';
import TimelineHeader from './TimelineHeader';
import ActivitiesTimeline from './ActivitiesTimeline';
import messages from './messages';
import { TimelinePageParams } from './TimelinePage';
import { IdentifiersProps, Cookies } from '../../../models/timeline/timeline';
import UserDataService from '../../../services/UserDataService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { EmptyTableView } from '../../../components/TableView';

const { Content } = Layout;

export interface Identifier {
  id: string;
  type: string;
}

interface MapStateToProps {
  isFechingCookies: boolean;
}

interface State {
  isModalVisible: boolean;
  identifier: Identifier;
  identifiers: IdentifiersProps;
}

interface MonitoringProps {
  datamartId: string;
  cookies: Cookies;
}

type Props = MonitoringProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<TimelinePageParams>;

class Monitoring extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isModalVisible: false,
      identifier: {
        id: '',
        type: '',
      },
      identifiers: {
        isLoading: false,
        hasItems: false,
        items: {
          USER_ACCOUNT: [],
          USER_AGENT: [],
          USER_EMAIL: [],
          USER_POINT: [],
        },
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, identifierType, identifierId },
      },
      datamartId,
    } = this.props;
    const { identifier } = this.state;
    if (identifier.type && identifier.id) {
      this.fetchIdentifiersData(
        organisationId,
        datamartId,
        identifier.type,
        identifier.id,
      );
    } else if (identifierType && identifierId) {
      this.fetchIdentifiersData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search, pathname },
    } = this.props;

    const {
      match: {
        params: {
          identifierType: nextIdentifierType,
          identifierId: nextIdentifierId,
          organisationId: nextOrganisationId,
        },
      },
      location: { search: nextSearch, pathname: nextPathname },
      datamartId: nextDatamartId,
    } = nextProps;

    if (search !== nextSearch || pathname !== nextPathname) {
      if (nextIdentifierType && nextIdentifierId) {
        this.fetchIdentifiersData(
          nextOrganisationId,
          nextDatamartId,
          nextIdentifierType,
          nextIdentifierId,
        );
      }
    }
  }

  fetchIdentifiersData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {
    this.setState(prevState => {
      const nextState = {
        identifiers: {
          ...prevState.identifiers,
          isLoading: true,
        },
      };
      return nextState;
    });
    UserDataService.getIdentifiers(
      organisationId,
      datamartId,
      identifierType,
      identifierId,
    )
      .then(response => {
        this.setState((prevState: any) => {
          const nextState = {
            identifiers: {
              ...prevState.identifiers,
              isLoading: false,
              hasItems: Object.keys(response.data).length > 0,
              items: lodash.groupBy(response.data, 'type'),
            },
            identifier: {
              id: identifierId,
              type: identifierType,
            },
          };
          return nextState;
        });
      })
      .catch(error => {
        this.setState((prevState: any) => {
          const nextState = {
            identifiers: {
              ...prevState.identifiers,
              items: {},
              isLoading: false,
            },
            identifier: {
              id: identifierId,
              type: identifierType,
            },
          };
          return nextState;
        });
      });
  };

  handleModal = (visible: boolean) => {
    this.setState({
      isModalVisible: visible,
    });
  };

  onIdentifierChange = (identifier: Identifier) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
      location,
    } = this.props;
    const datamartId = queryString.parse(location.search).datamartId
      ? queryString.parse(location.search).datamartId
      : this.props.datamartId;
    history.push(
      `/v2/o/${organisationId}/audience/timeline/${identifier.type}/${
        identifier.id
      }?datamartId=${datamartId}`,
    );
  };

  render() {
    const { datamartId, cookies } = this.props;

    const { identifier, identifiers, isModalVisible } = this.state;

    const userPointId =
      identifiers.items.USER_POINT && identifiers.items.USER_POINT[0]
        ? identifiers.items.USER_POINT[0].user_point_id
        : '';

    return (
      <div className="ant-layout">
        <MonitoringActionbar
          onIdentifierChange={this.onIdentifierChange}
          isModalVisible={isModalVisible}
          handleModal={this.handleModal}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            {cookies.mics_vid || identifier.id ? (
              <Row>
                <TimelineHeader
                  datamartId={datamartId}
                  identifiers={identifiers}
                  userPointId={userPointId}
                />
                <Row
                  gutter={20}
                  style={{ marginTop: '20px' }}
                  className="mcs-monitoring"
                >
                  <Col span={6}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.visitor} />
                    </div>
                    <ProfileCard
                      datamartId={datamartId}
                      identifier={identifier}
                    />
                    <SegmentsCard
                      datamartId={datamartId}
                      identifier={identifier}
                    />
                  </Col>
                  <Col span={12}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.activities} />
                    </div>

                    <ActivitiesTimeline
                      datamartId={datamartId}
                      identifier={identifier}
                      identifiers={identifiers}
                    />
                  </Col>
                  <Col span={6}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.identifiers} />
                    </div>
                    <AccountIdCard
                      identifiers={identifiers}
                      datamartId={datamartId}
                    />
                    <DeviceCard identifiers={identifiers} />
                    <EmailCard identifiers={identifiers} />
                  </Col>
                </Row>
              </Row>
            ) : (
              <EmptyTableView
                iconType="user"
                intlMessage={messages.pleaseFillInformations}
              />
            )}
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  isFechingCookies: state.session.isFechingCookies,
});

export default compose<Props, MonitoringProps>(
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
)(Monitoring);
