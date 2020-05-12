import * as React from 'react';
import { Row } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from '../messages';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TimelinePageParams } from '../TimelinePage';
import ProfileInfo from './ProfileInfo';
import { UserProfileGlobal } from '../../../../models/timeline/timeline';
import cuid from 'cuid';
import SingleProfileInfo from './SingleProfileInfo';

interface ProfileCardProps {
  dataSource: UserProfileGlobal;
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

  renderProfile = (dataSource: UserProfileGlobal) => {
    if (dataSource.type === 'pionus' && Object.keys(dataSource.profile).length > 0) {
      return Object.keys(dataSource.profile).map(key => {
        return (
          <Row gutter={10} key={cuid()} className="table-line border-top">
            <div className="sub-title">{dataSource.profile[key].compartmentName}</div>
            <ProfileInfo profiles={dataSource.profile[key].profiles} />
          </Row>
        );
      })
    } else if (dataSource.type === 'legacy') {
      return (
        <Row gutter={10} key={cuid()} className="table-line border-top">
            <SingleProfileInfo profileGlobal={dataSource.profile} />
          </Row>)
    } else {
      return <span>
            <FormattedMessage {...messages.emptyProfile} />
          </span>
    }
    
  }

  render() {
    
    const { dataSource, intl, isLoading } = this.props;
    return (
      <Card
        title={intl.formatMessage(messages.profileTitle)}
        isLoading={isLoading}
        className={'mcs-profileCard'}
      >
        {this.renderProfile(dataSource)}
      </Card>
    );
  }
}

export default compose<Props, ProfileCardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(ProfileCard);
