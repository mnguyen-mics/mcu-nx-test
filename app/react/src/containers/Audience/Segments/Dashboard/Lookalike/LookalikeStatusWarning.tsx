import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Alert } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { AudienceSegmentResource } from '../../../../../models/audiencesegment';
import { UserLookalikeSegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';

export interface LookalikeStatusWarningProps {
  segment?: AudienceSegmentResource;
  isFetching: boolean;
}

const messages = defineMessages({
  draft: {
    id: 'segment.lookalike.alert.draft',
    defaultMessage:
      'In order to calibrate your Lookalike Audience Segment, please press the calibrate button in the action bar.',
  },
  calibrating: {
    id: 'segment.lookalike.alert.calibrating',
    defaultMessage:
      'Your Lookalike Audience Segment is being calibrating, please check later on to view the result.',
  },
  calibration_error: {
    id: 'segment.lookalike.alert.error',
    defaultMessage:
      'The calibration of your Lookalike Audience Segment has failed, please contact your customer success manager or try starting another calibration manualy.',
  },
  calibration_success: {
    id: 'segment.lookalike.alert.success',
    defaultMessage:
      'Your Lookalike Audience Segment is properly calibrated, if you wish to recalibrate it again, please push the calibration button in the action bar.',
  },
});

type Props = LookalikeStatusWarningProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }>;

class LookalikeStatusWarning extends React.Component<Props, any> {
  render() {
    const {
      segment,
      intl: { formatMessage },
    } = this.props;

    if (segment && Object.keys(segment).length && segment.type === 'USER_LOOKALIKE') {
      if ((segment as UserLookalikeSegment).lookalike_algorithm !== 'COHORT_OVERLAP')
        switch ((segment as UserLookalikeSegment).status) {
          case 'DRAFT':
            return (
              <Alert className={'m-b-20'} message={formatMessage(messages.draft)} type='warning' />
            );
          case 'CALIBRATION_ERROR':
            return (
              <Alert
                className={'m-b-20'}
                message={formatMessage(messages.calibration_error)}
                type='error'
              />
            );
          case 'CALIBRATING':
            return (
              <Alert
                className={'m-b-20'}
                message={formatMessage(messages.calibrating)}
                type='info'
              />
            );
          case 'CALIBRATED':
            return (
              <Alert
                className={'m-b-20'}
                message={formatMessage(messages.calibration_success)}
                type='success'
              />
            );
        }
      return <div />;
    }

    return <div />;
  }
}

export default compose<Props, LookalikeStatusWarningProps>(
  withRouter,
  injectIntl,
)(LookalikeStatusWarning);
