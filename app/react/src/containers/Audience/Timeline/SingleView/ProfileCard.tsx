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

interface ProfileCardProps {
  dataSource: any;
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
    const { dataSource: profileByCompartments, intl, isLoading } = this.props;
    return (
      <Card
        title={intl.formatMessage(messages.profileTitle)}
        isLoading={isLoading}
      >
        {Object.keys(profileByCompartments).map(key => {
          return (
            <Row gutter={10} key={key} className="table-line border-top">
              <div className="sub-title">{key}</div>
              <ProfileInfo profile={profileByCompartments[key]} />
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
