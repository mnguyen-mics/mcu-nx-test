import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import AudienceSegmentHeader from './AudienceSegmentHeader';
import { Labels } from '../../../Labels/index';
import AudienceSegmentDashboard from './AudienceSegmentDashboard';
import LookalikeStatusWarning from './Lookalike/LookalikeStatusWarning';
import { compose } from 'recompose';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { AudienceSegmentShape } from '../../../../models/audiencesegment';
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';
import { isUserQuerySegment } from '../Edit/domain';
import McsTabs from '../../../../components/McsTabs';
import ABComparisonDashboard from './Experimentation/ABComparisonDashboard';
import { UserQuerySegment } from '../../../../models/audiencesegment/AudienceSegmentResource';

export const messages = defineMessages({
  ABComparison: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.title',
    defaultMessage: 'A/B Comparison',
  },
  experimentation: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.experimentation',
    defaultMessage: 'Experimentation',
  },
  controlGroup: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.controlGroup',
    defaultMessage: 'Control Group',
  },
});

export interface AudienceSegmentProps {
  segment?: AudienceSegmentShape;
  isLoading: boolean;
  datamarts: DatamartWithMetricResource[];
  controlGroupSegment?: UserQuerySegment;
  isLoadingControlGroupSegment: boolean;
}

type Props = AudienceSegmentProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps;

class AudienceSegment extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingControlGroup: false,
    };
  }

  buildExperimentationItems = (segment: UserQuerySegment) => {
    const {
      intl,
      isLoading,
      datamarts,
      controlGroupSegment,
      isLoadingControlGroupSegment,
    } = this.props;
    // Segment here has to be a AB_TESTING_EXPERIMENT segment
    return [
      {
        title: intl.formatMessage(messages.ABComparison),
        display: (
          <ABComparisonDashboard
            experimentationSegment={segment}
            controlGroupSegment={controlGroupSegment}
          />
        ),
      },
      {
        title: intl.formatMessage(messages.experimentation),
        display: (
          <AudienceSegmentDashboard
            segment={segment}
            isLoading={isLoading}
            datamarts={datamarts}
          />
        ),
      },
      {
        title: intl.formatMessage(messages.controlGroup),
        display: (
          <AudienceSegmentDashboard
            segment={controlGroupSegment}
            isLoading={isLoadingControlGroupSegment}
            datamarts={datamarts}
          />
        ),
      },
    ];
  };

  renderDashboard = () => {
    const { datamarts, segment, isLoading } = this.props;
    if (
      segment &&
      isUserQuerySegment(segment) &&
      segment.subtype !== 'STANDARD'
    ) {
      return <McsTabs items={this.buildExperimentationItems(segment)} />;
    }
    return (
      <AudienceSegmentDashboard
        segment={segment}
        isLoading={isLoading}
        datamarts={datamarts}
      />
    );
  };

  render() {
    const {
      match: {
        params: { segmentId, organisationId },
      },
      isLoading,
      segment,
    } = this.props;

    return (
      <div>
        <AudienceSegmentHeader isLoading={isLoading} segment={segment} />
        <Labels
          labellableId={segmentId}
          labellableType="SEGMENT"
          organisationId={organisationId}
        />
        {segment && segment.short_description && (
          <div style={{ marginBottom: 20 }}>{segment.short_description}</div>
        )}
        <LookalikeStatusWarning isFetching={isLoading} segment={segment} />
        {this.renderDashboard()}
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentProps>(
  withRouter,
  injectIntl,
)(AudienceSegment);
