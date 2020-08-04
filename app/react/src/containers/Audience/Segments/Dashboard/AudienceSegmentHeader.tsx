import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Icon } from 'antd';
import moment from 'moment';

import ContentHeader from '../../../../components/ContentHeader';
import {
  AudienceSegmentShape,
  UserListSegment,
} from '../../../../models/audiencesegment';
import {
  InjectedIntlProps,
  FormattedMessage,
  injectIntl,
  defineMessages,
} from 'react-intl';
import { compose } from 'recompose';
import SegmentNameDisplay from '../../Common/SegmentNameDisplay';
import { isUserQuerySegment } from '../Edit/domain';
import {
  audienceSegmentTypeMessages,
  userQuerySegmentSubtypeMessages,
} from './messages';

const localMessages = defineMessages({
  createdOn: {
    id: 'components.segmentNameDisplay.createdOn',
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

    let iconType = '';

    if (segment) {
      if (segment.type === 'USER_ACTIVATION') {
        iconType = 'rocket';
      } else if (segment.type === 'USER_QUERY') {
        iconType = 'database';
      } else if (segment.type === 'USER_LIST') {
        iconType = 'solution';
      } else if (segment.type === 'USER_LOOKALIKE') {
        iconType = 'usergroup-add';
      } else if (segment.type === 'USER_PARTITION') {
        iconType = 'api';
      }
    }

    const renderName = () => {
      const edge = 'EDGE';
      const edgeMessage = (
        <FormattedMessage {...audienceSegmentTypeMessages[edge]} />
      );
      if (segment) {
        const subtype = (segment as UserListSegment).subtype;
        if (subtype === 'USER_CLIENT' || subtype === 'EDGE') return edgeMessage;
        return (
          <FormattedMessage {...audienceSegmentTypeMessages[segment.type]} />
        );
      }
      return;
    };

    const dateCreatedOn =
      segment && segment.creation_ts
        ? moment.unix(segment.creation_ts / 1000).toDate()
        : undefined;

    const createdOn = dateCreatedOn ? (
      <span className="mcs-audienceSegmentDashboard_createdOn">{`${formatMessage(
        localMessages.createdOn,
      )} ${dateCreatedOn.toLocaleDateString()} - ${dateCreatedOn.toLocaleTimeString()}`}</span>
    ) : (
      undefined
    );

    const segmentType = segment ? (
      <React.Fragment>
        <Icon type={iconType} /> {renderName()}
        {isUserQuerySegment(segment) &&
          segment.subtype &&
          segment.subtype === 'AB_TESTING_EXPERIMENT' && (
            <div className="mcs-audienceSegmentDashboard_subtype">
              <FormattedMessage
                {...userQuerySegmentSubtypeMessages[segment.subtype]}
              />
            </div>
          )}
        {createdOn}
      </React.Fragment>
    ) : (
      <span />
    );

    return (
      <ContentHeader
        title={<SegmentNameDisplay audienceSegmentResource={segment} />}
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
