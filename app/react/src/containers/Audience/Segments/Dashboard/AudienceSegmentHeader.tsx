import * as React from 'react';
import { withRouter } from 'react-router-dom';

import moment from 'moment';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { AudienceSegmentShape, UserListSegment } from '../../../../models/audiencesegment';
import { InjectedIntlProps, FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { SegmentNameDisplay } from '../../Common/SegmentNameDisplay';
import { isUserQuerySegment } from '../Edit/domain';
import { audienceSegmentTypeMessages, userQuerySegmentSubtypeMessages } from './messages';
import {
  ApiOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  RocketOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

const localMessages = defineMessages({
  createdOn: {
    id: 'audience.segments.dashboard.createdOn',
    defaultMessage: 'Created on',
  },
});

export interface AudienceSegmentHeaderProps {
  segment?: AudienceSegmentShape;
  isLoading: boolean;
}

type Props = AudienceSegmentHeaderProps & InjectedIntlProps;

class AudienceSegmentHeader extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      segment,
      isLoading,
    } = this.props;

    let iconType = null;

    if (segment) {
      if (segment.type === 'USER_ACTIVATION') {
        iconType = <RocketOutlined />;
      } else if (segment.type === 'USER_QUERY') {
        iconType = <DatabaseOutlined />;
      } else if (segment.type === 'USER_LIST') {
        iconType = <SolutionOutlined />;
      } else if (segment.type === 'USER_LOOKALIKE') {
        iconType = <UsergroupAddOutlined />;
      } else if (segment.type === 'USER_PARTITION') {
        iconType = <ApiOutlined />;
      }
    }

    const renderName = () => {
      const edge = 'EDGE';
      const edgeMessage = <FormattedMessage {...audienceSegmentTypeMessages[edge]} />;
      if (segment) {
        const subtype = (segment as UserListSegment).subtype;
        if (subtype === 'USER_CLIENT' || subtype === 'EDGE') return edgeMessage;
        return <FormattedMessage {...audienceSegmentTypeMessages[segment.type]} />;
      }
      return;
    };

    const dateCreatedOn =
      segment && segment.creation_ts ? moment.unix(segment.creation_ts / 1000).toDate() : undefined;

    const createdOn = dateCreatedOn ? (
      <span className='mcs-audienceSegmentDashboard_createdOn'>
        <CalendarOutlined />
        <span className='mcs-audienceSegmentHeader_created_on_message'>
          {`${formatMessage(
            localMessages.createdOn,
          )} ${dateCreatedOn.toLocaleDateString()} - ${dateCreatedOn.toLocaleTimeString()}`}
        </span>
      </span>
    ) : undefined;

    const segmentType = segment ? (
      <React.Fragment>
        <div className='mcs-audienceSegmentHeader_segment_type'>
          {iconType} {renderName()}
          {isUserQuerySegment(segment) &&
            segment.subtype &&
            segment.subtype === 'AB_TESTING_EXPERIMENT' && (
              <div className='mcs-audienceSegmentDashboard_subtype'>
                <FormattedMessage {...userQuerySegmentSubtypeMessages[segment.subtype]} />
              </div>
            )}
          {createdOn}
        </div>
      </React.Fragment>
    ) : (
      <span />
    );

    return (
      <ContentHeader
        title={
          <SegmentNameDisplay
            audienceSegmentResource={segment}
            className='mcs-segmentNameDisplay'
          />
        }
        className='mcs-audienceSegmentHeader'
        subTitle={segmentType}
        loading={isLoading}
      />
    );
  }
}

export default compose<Props, AudienceSegmentHeaderProps>(
  withRouter,
  injectIntl,
)(AudienceSegmentHeader);
