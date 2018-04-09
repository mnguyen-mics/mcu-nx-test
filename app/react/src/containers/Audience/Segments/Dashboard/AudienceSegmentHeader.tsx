import * as React from 'react';
import { connect } from 'react-redux';
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

export interface AudienceSegmentHeaderStoreProps {
  segment: {} | AudienceSegmentResource;
}

type Props = AudienceSegmentHeaderStoreProps & InjectedIntlProps;

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
    const { segment } = this.props;

    let iconType = '';

    if (Object.keys(segment).length) {
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

    const segmentType = Object.keys(segment).length ? (
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
          Object.keys(segment).length
            ? (segment as AudienceSegmentResource).name
            : ''
        }
        subTitle={segmentType}
        loading={Object.keys(segment).length === 0}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
  segment:
    state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
});

export default compose(withRouter, connect(mapStateToProps))(
  AudienceSegmentHeader,
);
