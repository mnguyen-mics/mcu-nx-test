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
      match: {
        params: { organisationId, identifierId, identifierType },
      },
      datamartId,
      identifier,
    } = this.props;
    if (identifier.id && identifier.type) {
      this.fetchProfileData(
        organisationId,
        datamartId,
        identifier.type,
        identifier.id,
      );
    } else if (identifierId && identifierType) {
      this.fetchProfileData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
      identifier: { id, type },
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      datamartId: prevDatamartId,
      identifier: { id: prevIdentifierId, type: prevIdentifierType },
    } = prevProps;
    if (
      organisationId !== prevOrganisationId ||
      id !== prevIdentifierId ||
      type !== prevIdentifierType ||
      datamartId !== prevDatamartId
    ) {
      this.fetchProfileData(organisationId, datamartId, type, id);
    }
  }

  fetchProfileData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {

    DatamartService.getUserAccountCompartments(datamartId).then(res => {
      return Promise.all(
        res.data.map(userCompartiment => {
          return UserDataService.getProfile(
            organisationId,
            datamartId,
            identifierType,
            identifierId,
            {
              compartment_id: userCompartiment.compartment_id,
            },
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
