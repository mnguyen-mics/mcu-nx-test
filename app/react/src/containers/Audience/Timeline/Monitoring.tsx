import * as React from 'react';
import { compose } from 'recompose';
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
import { isUserPointIdentifier } from '../../../models/timeline/timeline';
import UserDataService from '../../../services/UserDataService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { EmptyTableView } from '../../../components/TableView';
import { DatamartResource } from '../../../models/datamart/DatamartResource';

const { Content } = Layout;

export interface Identifier {
  id: string;
  type: string;
  compartmentId?: string;
}

interface MapStateToProps {
  isFechingCookies: boolean;
}

interface State {
  isModalVisible: boolean;
  userPointId?: string;
  isLoading?: boolean;
}

interface MonitoringProps {
  selectedDatamart: DatamartResource;
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
    };
  }

  componentDidMount() {
    const {
      location,
      match: {
        params: { organisationId, identifierType, identifierId },
      },
      selectedDatamart,
    } = this.props;

    if (identifierType && identifierId) {
      this.fetchIdentifiersData(
        organisationId,
        selectedDatamart.id,
        identifierType,
        identifierId,
        queryString.parse(location.search).compartmentId,
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
      selectedDatamart: nextSelectedDatamart,
    } = nextProps;

    if (search !== nextSearch || pathname !== nextPathname) {
      if (nextIdentifierType && nextIdentifierId) {
        this.fetchIdentifiersData(
          nextOrganisationId,
          nextSelectedDatamart.id,
          nextIdentifierType,
          nextIdentifierId,
          queryString.parse(nextSearch).compartmentId,
        );
      }
    }
  }

  fetchIdentifiersData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
  ) => {
    this.setState(prevState => {
      const nextState = {
        isLoading: true,
      };
      return nextState;
    });
    UserDataService.getIdentifiers(
      organisationId,
      datamartId,
      identifierType,
      identifierId,
      compartmentId,
    )
      .then(response => {
        const userPointIdentifierInfo = response.data.find(isUserPointIdentifier);
        if (userPointIdentifierInfo) {
          this.setState({
            userPointId: userPointIdentifierInfo.user_point_id
          });
        }
        this.setState({
          isLoading: false
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false
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
      : this.props.selectedDatamart.id;

    history.push(
      `/v2/o/${organisationId}/audience/timeline/${identifier.type}/${
      identifier.id
      }?datamartId=${datamartId}${identifier.compartmentId ? `&compartmentId=${identifier.compartmentId}` : ''}`,
    );
  };

  render() {
    const { selectedDatamart } = this.props;

    const { isModalVisible, userPointId } = this.state;

    return (
      <div className="ant-layout">
        <MonitoringActionbar
          selectedDatamart={selectedDatamart}
          onIdentifierChange={this.onIdentifierChange}
          isModalVisible={isModalVisible}
          handleModal={this.handleModal}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            { userPointId ? (
              <Row>
                <TimelineHeader
                  selectedDatamart={selectedDatamart}
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
                      selectedDatamart={selectedDatamart}
                      userPointId={userPointId}
                    />
                    <SegmentsCard
                      selectedDatamart={selectedDatamart}
                      userPointId={userPointId}
                    />
                  </Col>
                  <Col span={12}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.activities} />
                    </div>

                    <ActivitiesTimeline
                      selectedDatamart={selectedDatamart}
                      userPointId={userPointId}
                    />
                  </Col>
                  <Col span={6}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.identifiers} />
                    </div>
                    <AccountIdCard
                      selectedDatamart={selectedDatamart}
                      userPointId={userPointId}
                    />
                    <DeviceCard
                      selectedDatamart={selectedDatamart}
                      userPointId={userPointId}
                    />
                    <EmailCard
                      selectedDatamart={selectedDatamart}
                      userPointId={userPointId}
                    />
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
