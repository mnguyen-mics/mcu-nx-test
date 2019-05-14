import * as React from 'react';
import { Row, Spin } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Card } from '../../../../components/Card/index';
import UserDataService from '../../../../services/UserDataService';
import DatamartService from '../../../../services/DatamartService';
import { Identifier } from '../Monitoring';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TimelinePageParams } from '../TimelinePage';
import ProfileInfo from './ProfileInfo';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';

interface ProfileCardProps {
  selectedDatamart: DatamartResource;
  userPointId: string;
}

interface State {
  profileByCompartments?: any;
}

type Props = ProfileCardProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<TimelinePageParams>;

class ProfileCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const {
      selectedDatamart,
      userPointId
    } = this.props;

    this.fetchProfileData(
      selectedDatamart,
      userPointId
    );
  }

  componentDidUpdate(prevProps: Props) {
    const {
      selectedDatamart,
      userPointId,
    } = this.props;

    const {
      selectedDatamart: prevSelectedDatamart,
      userPointId: prevUserPointId,
    } = prevProps;

    if (
      userPointId !== prevUserPointId ||
      selectedDatamart !== prevSelectedDatamart
    ) {
      this.fetchProfileData(selectedDatamart, userPointId);
    }
  }

  fetchProfileData = (
    datamart: DatamartResource,
    userPointId: string,
  ) => {

    DatamartService.getUserAccountCompartments(datamart.id).then(res => {
      return Promise.all(
        res.data.map(userCompartiment => {
          const identifier: Identifier = {
            id: userPointId,
            type: 'user_point_id',
            compartmentId: userCompartiment.compartment_id
          };
          return UserDataService.getProfile(
            datamart.id,
            identifier
          )
            .then(r => ({ profile: r ? r.data : {}, compartment: userCompartiment }))
            .catch(() =>
              Promise.resolve({
                profile: undefined,
                compartment: userCompartiment,
              }),
            );
        }),
      ).then(profiles => {
        const formatedProfile: any = {};
        profiles.forEach(profile => {
          formatedProfile[
            profile.compartment.name
              ? profile.compartment.name
              : profile.compartment.token
          ] =
            profile.profile;
        });
        this.setState({ profileByCompartments: formatedProfile });
      });
    });
  };



  render() {
    const { intl } = this.props;
    return (
      <Card title={intl.formatMessage(messages.profileTitle)} isLoading={!this.state.profileByCompartments}>
        {!this.state.profileByCompartments ? (
          <Spin />
        ) : (
            Object.keys(this.state.profileByCompartments).map(key => {
              return (
                <Row gutter={10} key={key} className="table-line border-top">
                  <div className="sub-title">{key}</div>
                  <ProfileInfo profile={this.state.profileByCompartments[key]} />
                </Row>
              );
            })
          )}
      </Card>
    );
  }
}

export default compose<Props, ProfileCardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(ProfileCard);
