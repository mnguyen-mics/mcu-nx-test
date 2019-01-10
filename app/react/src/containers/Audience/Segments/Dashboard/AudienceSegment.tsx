import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import AudienceSegmentHeader from './AudienceSegmentHeader';
import { Labels } from '../../../Labels/index';
import AudienceSegmentDashboard from './AudienceSegmentDashboard';
import LookalikeStatusWarning from './Lookalike/LookalikeStatusWarning';


import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';


export interface AudienceSegmentProps {
  segment?: AudienceSegmentShape;
  isLoading: boolean;
}

type Props = AudienceSegmentProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps;

class AudienceSegment extends React.Component<Props> {




  render() {
    const { match: { params: { segmentId, organisationId } }, isLoading, segment } = this.props;
    return (
      <div>
        <AudienceSegmentHeader isLoading={isLoading} segment={segment} />
        <Labels
          labellableId={segmentId}
          labellableType="SEGMENT"
          organisationId={organisationId}
        />
        <LookalikeStatusWarning isFetching={isLoading} segment={segment} />
        <AudienceSegmentDashboard segment={segment} isLoading={isLoading} />
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentProps>(
  withRouter,
)(AudienceSegment);
