import * as React from 'react';
import { Row } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from '../messages';
import { Card } from '../../../../components/Card/index';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TimelinePageParams } from '../TimelinePage';
import ProfileInfo from './ProfileInfo';
import { UserProfileGlobal } from '../../../../models/timeline/timeline';
import cuid from 'cuid';
import SingleProfileInfoLegacy from './SingleProfileInfoLegacy';

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

  render() {
    
    const { dataSource, intl, isLoading } = this.props;
    return (
      <Card
        title={intl.formatMessage(messages.profileTitle)}
        isLoading={isLoading}
      >
        {dataSource.type === 'pionus' && Object.keys(dataSource.profileType).map(key => {
          return (
            <Row gutter={10} key={cuid()} className="table-line border-top">
              <div className="sub-title">{dataSource.profileType[key].compartmentName}</div>
              <ProfileInfo profiles={dataSource.profileType[key].profiles} />
            </Row>
          );
        })}
        {dataSource.type === 'legacy' && (
            <Row gutter={10} key={cuid()} className="table-line border-top">
              <SingleProfileInfoLegacy profile={dataSource.profileType} />
            </Row>
        )}
        {dataSource.type === undefined && (
          <span>
            <FormattedMessage {...messages.emptyProfile} />
          </span>
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
