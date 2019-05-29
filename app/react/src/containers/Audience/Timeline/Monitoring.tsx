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
import { IdentifiersProps } from '../../../models/timeline/timeline';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { EmptyTableView } from '../../../components/TableView';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IMonitoringService } from './MonitoringService';

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
  identifiers: IdentifiersProps;
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
      identifiers: {
        hasItems: false,
        items: {
          USER_ACCOUNT: [],
          USER_AGENT: [],
          USER_EMAIL: [],
          USER_POINT: [],
        },
        userPointId: '',
      },
      isLoading: false,
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
      this.setState({
        isLoading: true,
      });
      this._monitoringService
        .fetchMonitoringData(
          organisationId,
          selectedDatamart,
          identifierType,
          identifierId,
          queryString.parse(location.search).compartmentId,
        )
        .then(identifiers => {
          this.setState({
            identifiers: identifiers,
            isLoading: false,
          });
        });
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
        this.setState({
          isLoading: true,
        });
        this._monitoringService
          .fetchMonitoringData(
            nextOrganisationId,
            nextSelectedDatamart,
            nextIdentifierType,
            nextIdentifierId,
            queryString.parse(nextSearch).compartmentId,
          )
          .then(identifiers => {
            this.setState({
              identifiers: identifiers,
              isLoading: false,
            });
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

    const { isModalVisible, identifiers, isLoading } = this.state;

    const userPointId = identifiers.userPointId;

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
            {userPointId ? (
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
                      dataSource={identifiers.items.USER_AGENT}
                      isLoading={isLoading}
                    />
                    <EmailCard
                      dataSource={identifiers.items.USER_EMAIL}
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
