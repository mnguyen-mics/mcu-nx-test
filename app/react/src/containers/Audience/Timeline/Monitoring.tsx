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
import UserChoicesCard from './SingleView/UserChoicesCard';
import TimelineHeader from './TimelineHeader';
import ActivitiesTimeline from './ActivitiesTimeline';
import messages from './messages';
import { TimelinePageParams } from './TimelinePage';
import { MonitoringData } from '../../../models/timeline/timeline';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { EmptyTableView } from '../../../components/TableView';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IMonitoringService } from './MonitoringService';
import { MicsReduxState } from '../../../utils/ReduxHelper';

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
  monitoringData: MonitoringData;
  isLoading: boolean;
}

interface MonitoringProps {
  selectedDatamart: DatamartResource;
}

type Props = MonitoringProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<TimelinePageParams>;

class Monitoring extends React.Component<Props, State> {
  @lazyInject(TYPES.IMonitoringService)
  private _monitoringService: IMonitoringService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isModalVisible: false,
      monitoringData: {
        userAgentList: [],
        userEmailList: [],
        userAccountsByCompartmentId: {},
        userAccountCompartments: [],
        userPointList: [],
        userSegmentList: [],
        userChoices: { userConsents: [], processings: [] },
        userProfile: { type: undefined, profile: {} },
        lastSeen: 0,
        userIdentifier: {
          type: '',
          id: '',
        },
        isUserFound: false,
      },
      isLoading: false,
    };
  }

  componentDidMount() {
    const {
      location: { search },
      match: {
        params: { organisationId, identifierType, identifierId },
      },
      selectedDatamart,
    } = this.props;

    if (identifierType && identifierId) {
      this.setState({
        isLoading: true,
      });
      this._monitoringService
        .fetchMonitoringData(
          organisationId,
          selectedDatamart,
          identifierType,
          identifierId,
          queryString.parse(search).compartmentId,
        )
        .then(monitoringData => {
          this.setState({
            monitoringData: monitoringData,
            isLoading: false,
          });
        })
        .catch(error => {
          this.setState({
            isLoading: false,
          });
          this.props.notifyError(error);
        });
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { search, pathname },
      match: {
        params: { identifierType, identifierId, organisationId },
      },
      selectedDatamart,
    } = this.props;

    const {
      location: { search: previousSearch, pathname: previousPathname },
      selectedDatamart: previousSelectedDatamart,
    } = previousProps;

    if (
      search !== previousSearch ||
      pathname !== previousPathname ||
      selectedDatamart.id !== previousSelectedDatamart.id
    ) {
      if (identifierType && identifierId) {
        this.setState({
          isLoading: true,
        });
        this._monitoringService
          .fetchMonitoringData(
            organisationId,
            selectedDatamart,
            identifierType,
            identifierId,
            queryString.parse(search).compartmentId,
          )
          .then(monitoringData => {
            this.setState({
              monitoringData: monitoringData,
              isLoading: false,
            });
          })
          .catch(error => {
            this.setState({
              monitoringData: {
                userAgentList: [],
                userEmailList: [],
                userAccountsByCompartmentId: {},
                userAccountCompartments: [],
                userPointList: [],
                userSegmentList: [],
                userChoices: { userConsents: [], processings: [] },
                userProfile: { type: undefined, profile: {} },
                lastSeen: 0,
                userIdentifier: {
                  type: '',
                  id: '',
                },
                isUserFound: false,
              },
              isLoading: false,
            });
            this.props.notifyError(error);
          });
      }
    }
  }

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
      }?datamartId=${datamartId}${
        identifier.compartmentId
          ? `&compartmentId=${identifier.compartmentId}`
          : ''
      }`,
    );
  };

  render() {
    const { selectedDatamart } = this.props;

    const { isModalVisible, monitoringData, isLoading } = this.state;

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
            {monitoringData.isUserFound ? (
              <Row>
                <TimelineHeader
                  dataSource={monitoringData}
                  isLoading={isLoading}
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
                      dataSource={monitoringData.userProfile}
                      isLoading={isLoading}
                    />
                    <SegmentsCard
                      dataSource={monitoringData.userSegmentList}
                      isLoading={isLoading}
                    />
                  </Col>
                  <Col span={12}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.activities} />
                    </div>

                    <ActivitiesTimeline
                      selectedDatamart={selectedDatamart}
                      userIdentifier={monitoringData.userIdentifier}
                    />
                  </Col>
                  <Col span={6}>
                    <div className="mcs-subtitle">
                      <FormattedMessage {...messages.identifiers} />
                    </div>
                    <AccountIdCard
                      userAccountCompartments={
                        monitoringData.userAccountCompartments
                      }
                      userAccountsByCompartmentId={
                        monitoringData.userAccountsByCompartmentId
                      }
                      isLoading={isLoading}
                    />
                    <DeviceCard
                      dataSource={monitoringData.userAgentList}
                      isLoading={isLoading}
                    />
                    <EmailCard
                      dataSource={monitoringData.userEmailList}
                      isLoading={isLoading}
                    />
                    <UserChoicesCard
                      dataSource={monitoringData.userChoices}
                      isLoading={isLoading}
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

const mapStateToProps = (state: MicsReduxState) => ({
  isFechingCookies: state.session.isFechingCookies,
});

export default compose<Props, MonitoringProps>(
  withRouter,
  injectNotifications,
  connect(mapStateToProps, undefined),
)(Monitoring);
