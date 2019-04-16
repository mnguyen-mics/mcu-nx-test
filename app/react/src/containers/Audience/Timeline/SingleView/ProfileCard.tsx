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

interface ProfileCardProps {
  datamartId: string;
  identifier: Identifier;
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
      datamartId,
      identifier,
    } = this.props;
    if (identifier.id && identifier.type) {
      this.fetchProfileData(
        datamartId,
        identifier
      );
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      datamartId,
      identifier,
    } = this.props;
    const {
      datamartId: prevDatamartId,
      identifier: prevIdentifier,
    } = prevProps;
    if (
      identifier.id !== prevIdentifier.id ||
      identifier.type !== prevIdentifier.type ||
      datamartId !== prevDatamartId
    ) {
      if (identifier.id && identifier.type) {
        this.fetchProfileData(datamartId, identifier);
      }
    }
  }

  fetchProfileData = (
    datamartId: string,
    identifier: Identifier,
  ) => {

    DatamartService.getUserAccountCompartments(datamartId).then(res => {
      return Promise.all(
        res.data.map(userCompartiment => {
          return UserDataService.getProfile(
            datamartId,
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
