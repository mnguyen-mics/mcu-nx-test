import * as React from 'react';
import { Row, Col, Tooltip } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import cuid from 'cuid';
import messages from '../messages';
import { Card } from '../../../../components/Card/index';
import UserDataService from '../../../../services/UserDataService';
import { Identifier } from '../Monitoring';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TimelinePageParams } from '../TimelinePage';

interface ProfileCardProps {
  datamartId: string;
  identifier: Identifier;
}

interface State {
  showMore: boolean;
  profile: {
    isLoading: boolean;
    hasItems: boolean;
    items: any;
  };
}

type Props = ProfileCardProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<TimelinePageParams>;

class ProfileCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
      profile: {
        isLoading: false,
        hasItems: false,
        items: {},
      },
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

  fetchProfileData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {
    this.setState(prevState => {
      const nextState = {
        profile: {
          ...prevState.profile,
          isLoading: true,
        },
      };
      return nextState;
    });
    UserDataService.getProfile(
      organisationId,
      datamartId,
      identifierType,
      identifierId,
    )
      .then(response => {
        this.setState(prevState => {
          const nextState = {
            profile: {
              ...prevState.profile,
              isLoading: false,
              hasItems: Object.keys(response.data).length > 0,
              items: response.data,
            },
          };
          return nextState;
        });
      })
      .catch(err => {
        this.setState(prevState => {
          const nextState = {
            profile: {
              ...prevState.profile,
              isLoading: false,
            },
          };
          return nextState;
        });
        this.props.notifyError(err);
      });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const { profile } = this.state;

    const convertedObjectToArray = Object.keys(profile.items).map(key => {
      return [key, profile.items[key]];
    });

    const profileFormatted =
      convertedObjectToArray.length > 5 && !this.state.showMore
        ? convertedObjectToArray.splice(0, 5)
        : convertedObjectToArray;
    const canViewMore = convertedObjectToArray.length > 5 ? true : false;

    const onViewMoreClick = (e: any) => {
      e.preventDefault();
      this.setState({ showMore: true });
    };

    const onViewLessClick = (e: any) => {
      e.preventDefault();
      this.setState({ showMore: false });
    };

    return (
      <Card
        title={formatMessage(messages.profileTitle)}
        isLoading={profile.isLoading}
      >
        {profileFormatted &&
          profileFormatted.map(profil => {
            return (
              <Row gutter={10} key={cuid()} className="table-line">
                <Col className="table-left" span={12}>
                  <Tooltip title={profil[0]}>{profil[0]}</Tooltip>
                </Col>
                <Col className="table-right" span={12}>
                  <Tooltip title={profil[1]}>{profil[1]}</Tooltip>
                </Col>
              </Row>
            );
          })}
        {(profileFormatted.length === 0 || profile.hasItems === false) && (
          <span>
            <FormattedMessage {...messages.emptyProfile} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={onViewMoreClick}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={onViewLessClick}
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

export default compose<Props, ProfileCardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(ProfileCard);
