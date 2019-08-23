import * as React from 'react';
import { Row } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Card } from '../../../../components/Card/index';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TimelinePageParams } from '../TimelinePage';
import ProfileInfo from './ProfileInfo';
import { UserProfilePerCompartmentAndUserAccountId } from '../../../../models/timeline/timeline';
import cuid from 'cuid';

interface ProfileCardProps {
  dataSource: UserProfilePerCompartmentAndUserAccountId;
  isLoading: boolean;
}

type Props = ProfileCardProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<TimelinePageParams>;

class ProfileCard extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { dataSource: userProfilePerCompartmentAndUserAccountId, intl, isLoading } = this.props;
    return (
      <Card
        title={intl.formatMessage(messages.profileTitle)}
        isLoading={isLoading}
      >
        {Object.keys(userProfilePerCompartmentAndUserAccountId).map(key => {
          return (
            <Row gutter={10} key={cuid()} className="table-line border-top">
              <div className="sub-title">{userProfilePerCompartmentAndUserAccountId[key].compartmentName}</div>
              <ProfileInfo profiles={userProfilePerCompartmentAndUserAccountId[key].profiles} />
            </Row>
          );
        })}
      </Card>
    );
  }
}

export default compose<Props, ProfileCardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(ProfileCard);
