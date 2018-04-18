import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Icon } from 'antd';

import ContentHeader from '../../../../components/ContentHeader';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import {
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { compose } from 'recompose';

export interface AudienceSegmentHeaderProps {
  segment: AudienceSegmentResource | null;
  isLoading: boolean
}

type Props = AudienceSegmentHeaderProps & InjectedIntlProps;

export const messages = defineMessages({
  USER_ACTIVATION: {
    id: 'segment.type.USER_ACTIVATION',
    defaultMessage: 'User Activation',
  },
  USER_QUERY: {
    id: 'segment.type.USER_QUERY',
    defaultMessage: 'User Query',
  },
  USER_LIST: {
    id: 'segment.type.USER_LIST',
    defaultMessage: 'User List',
  },
  USER_PIXEL: {
    id: 'segment.type.USER_PIXEL',
    defaultMessage: 'User Pixel',
  },
  USER_PARTITION: {
    id: 'segment.type.USER_PARTITION',
    defaultMessage: 'User Partition',
  },
  USER_LOOKALIKE: {
    id: 'segment.type.USER_LOOKALIKE',
    defaultMessage: 'User Lookalike',
  },
});

class AudienceSegmentHeader extends React.Component<Props> {
  render() {
    const { segment, isLoading } = this.props;

    let iconType = '';

    if (segment) {
      if ((segment as AudienceSegmentResource).type === 'USER_ACTIVATION') {
        iconType = 'rocket';
      } else if ((segment as AudienceSegmentResource).type === 'USER_QUERY') {
        iconType = 'database';
      } else if ((segment as AudienceSegmentResource).type === 'USER_LIST') {
        iconType = 'solution';
      } else if ((segment as AudienceSegmentResource).type === 'USER_PIXEL') {
        iconType = 'global';
      } else if (
        (segment as AudienceSegmentResource).type === 'USER_LOOKALIKE'
      ) {
        iconType = 'usergroup-add';
      } else if (
        (segment as AudienceSegmentResource).type === 'USER_PARTITION'
      ) {
        iconType = 'api';
      }
    }

    const segmentType = segment ? (
      <span>
        <Icon type={iconType} />{' '}
        <FormattedMessage
          {...messages[(segment as AudienceSegmentResource).type]}
        />
      </span>
    ) : (
      <span />
    );

    return (
      <ContentHeader
        title={
          segment
            ? (segment as AudienceSegmentResource).name
            : ''
        }
        subTitle={segmentType}
        loading={isLoading}
      />
    );
  }
}

export default compose<Props, AudienceSegmentHeaderProps>(withRouter)(
  AudienceSegmentHeader,
);
