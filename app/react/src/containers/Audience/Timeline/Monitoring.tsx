import * as React from 'react';
import { compose } from 'recompose';
import lodash from 'lodash';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
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

const { Content } = Layout;

export interface Identifier {
  id: string;
  type: string;
}

interface MapStateToProps {
  isFechingCookies: boolean;
  cookies: Cookies;
}

interface State {
  isModalVisible: boolean;
  identifier: Identifier;
  identifiers: IdentifiersProps;
}

interface MonitoringProps {
  datamartId: string;
}

type Props = MonitoringProps &
  MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps &
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
      history,
      match: {
        params: { organisationId, identifierType, identifierId },
      },
      datamartId,
      cookies,
      isFechingCookies,
    } = this.props;
    const { identifier } = this.state;
    if (!identifierType || !identifierId) {
      if (cookies.mics_vid) {
        history.push(
          `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${
            cookies.mics_vid
          }`,
        );
      } else if (
        (cookies.mics_vid === '' || cookies.mics_uaid === '') &&
        isFechingCookies === false
      ) {
        // TODO HANDLE NO DATA FOR THIS USER
      } else if (
        (cookies.mics_vid === '' || cookies.mics_uaid === '') &&
        isFechingCookies === true
      ) {
        // TODO HANDLE NO DATA FOR THIS USER
      }
    } else if (identifier.type && identifier.id) {
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
      match: {
        params: { organisationId },
      },
      history,
      cookies,
      datamartId,
      location: { search, pathname },
    } = this.props;

    const { identifier } = this.state;

    const {
      match: {
        params: {
          identifierType: nextIdentifierType,
          identifierId: nextIdentifierId,
        },
      },
      location: { search: nextSearch, pathname: nextPathname },
    } = nextProps;

    if (!nextIdentifierType || !nextIdentifierId) {
      if (cookies.mics_vid) {
        history.push(
          `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${
            cookies.mics_vid
          }`,
        );
      }
    } else if (search !== nextSearch || pathname !== nextPathname) {
      if (identifier.id && identifier.type) {
        this.fetchIdentifiersData(
          organisationId,
          datamartId,
          identifier.type,
          identifier.id,
        );
      } else if (nextIdentifierType && nextIdentifierId) {
        this.fetchIdentifiersData(
          organisationId,
          datamartId,
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
          };
          return nextState;
        });
      })
      .catch(error => {
        this.setState(prevState => {
          const nextState = {
            identifiers: {
              ...prevState.identifiers,
              isLoading: false,
            },
          };
          return nextState;
        });
        this.props.notifyError(error);
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
      : '';
    history.push(
      `/v2/o/${organisationId}/audience/timeline/${identifier.type}/${
        identifier.id
      }?datamartId=${datamartId}`,
    );
    this.setState({
      identifier: {
        type: identifier.type,
        id: identifier.id,
      },
    });
  };

  render() {
    const { datamartId } = this.props;

    const { identifier, identifiers, isModalVisible } = this.state;

    return (
      <div className="ant-layout">
        <MonitoringActionbar
          onIdentifierChange={this.onIdentifierChange}
          isModalVisible={isModalVisible}
          handleModal={this.handleModal}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <Row>
              <TimelineHeader
                datamartId={datamartId}
                identifiers={identifiers}
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
                  <AccountIdCard identifiers={identifiers} />
                  <DeviceCard identifiers={identifiers} />
                  <EmailCard identifiers={identifiers} />
                </Col>
              </Row>
            </Row>
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  cookies: state.session.cookies,
  isFechingCookies: state.session.isFechingCookies,
});

export default compose<Props, MonitoringProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
)(Monitoring);
