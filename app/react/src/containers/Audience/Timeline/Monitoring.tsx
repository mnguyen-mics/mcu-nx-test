import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { Row, Col, Layout } from 'antd';
import MonitoringActionbar from './MonitoringActionBar';
import ProfileCard from './SingleView/ProfileCard';
import SegmentsCard from './SingleView/SegmentsCard';
import AccountIdCard from './SingleView/AccountIdCard';
import EmailCard from './SingleView/EmailCard';
import UserChoicesCard from './SingleView/UserChoicesCard';
import TimelineHeader from './TimelineHeader';
import ActivitiesTimeline from './ActivitiesTimeline';
import messages from './messages';
import { TimelinePageParams } from './TimelinePage';
import { MonitoringData } from '../../../models/timeline/timeline';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IMonitoringService } from './MonitoringService';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { Loading } from '../../../components';
import { EmptyTableView, DeviceCard } from '@mediarithmics-private/mcs-components-library';
import { deviceCardMessages, convertMessageDescriptorToString } from '../../../IntlMessages';
import { DeviceCardMessages } from '@mediarithmics-private/mcs-components-library/lib/components/timeline/single-view/device-card/DeviceCard';

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
  WrappedComponentProps &
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
        userChoices: { userChoices: [], processings: [] },
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
          queryString.parse(search).compartmentId as string,
        )
        .then(monitoringData => {
          this.setState({
            monitoringData: monitoringData,
            isLoading: false,
          });
        })
        .catch(() => {
          // we don't want to catch and notify 404 erros here
          this.setState({
            isLoading: false,
          });
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
            decodeURIComponent(identifierId),
            queryString.parse(search).compartmentId as string,
          )
          .then(monitoringData => {
            this.setState({
              monitoringData: monitoringData,
              isLoading: false,
            });
          })
          .catch(() => {
            // we don't want to catch and notify 404 erros here
            this.setState({
              monitoringData: {
                userAgentList: [],
                userEmailList: [],
                userAccountsByCompartmentId: {},
                userAccountCompartments: [],
                userPointList: [],
                userSegmentList: [],
                userChoices: { userChoices: [], processings: [] },
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
        identifier.compartmentId ? `&compartmentId=${identifier.compartmentId}` : ''
      }`,
    );
  };

  render() {
    const { selectedDatamart } = this.props;

    const { isModalVisible, monitoringData, isLoading } = this.state;
    const deviceCardMsg = convertMessageDescriptorToString(
      deviceCardMessages,
      this.props.intl,
    ) as DeviceCardMessages;
    return (
      <div className='ant-layout'>
        <MonitoringActionbar
          selectedDatamart={selectedDatamart}
          onIdentifierChange={this.onIdentifierChange}
          isModalVisible={isModalVisible}
          handleModal={this.handleModal}
        />
        <div className='ant-layout'>
          {!isLoading ? (
            <Content className='mcs-content-container'>
              {monitoringData.isUserFound ? (
                <div>
                  <TimelineHeader dataSource={monitoringData} isLoading={isLoading} />
                  <Row gutter={20} style={{ marginTop: '20px' }} className='mcs-monitoring'>
                    <Col span={6}>
                      <div className='mcs-subtitle'>
                        <FormattedMessage {...messages.visitor} />
                      </div>
                      <ProfileCard dataSource={monitoringData.userProfile} isLoading={isLoading} />
                      <SegmentsCard
                        dataSource={monitoringData.userSegmentList}
                        isLoading={isLoading}
                      />
                    </Col>
                    <Col span={12}>
                      <div className='mcs-subtitle'>
                        <FormattedMessage {...messages.activities} />
                      </div>

                      <ActivitiesTimeline
                        selectedDatamart={selectedDatamart}
                        userIdentifier={monitoringData.userIdentifier}
                      />
                    </Col>
                    <Col span={6}>
                      <div className='mcs-subtitle'>
                        <FormattedMessage {...messages.identifiers} />
                      </div>
                      <AccountIdCard
                        userAccountCompartments={monitoringData.userAccountCompartments}
                        userAccountsByCompartmentId={monitoringData.userAccountsByCompartmentId}
                        isLoading={isLoading}
                      />
                      <DeviceCard
                        messages={deviceCardMsg}
                        dataSource={monitoringData.userAgentList}
                        isLoading={isLoading}
                      />
                      <EmailCard dataSource={monitoringData.userEmailList} isLoading={isLoading} />
                      <UserChoicesCard
                        dataSource={monitoringData.userChoices}
                        isLoading={isLoading}
                      />
                    </Col>
                  </Row>
                </div>
              ) : (
                <EmptyTableView
                  iconType='user'
                  message={this.props.intl.formatMessage(messages.pleaseFillInformations)}
                />
              )}
            </Content>
          ) : (
            <Loading isFullScreen={true} />
          )}
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
  injectIntl,
  connect(mapStateToProps, undefined),
)(Monitoring);
