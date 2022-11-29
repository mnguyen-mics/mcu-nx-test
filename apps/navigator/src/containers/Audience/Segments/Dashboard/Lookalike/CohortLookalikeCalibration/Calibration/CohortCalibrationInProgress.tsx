import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Loading } from '@mediarithmics-private/mcs-components-library';

const messages = defineMessages({
  title: {
    id: 'audience.segments.lookalike.type.cohort.calibrationInProgress.title',
    defaultMessage: 'We are calculating segment and cohorts overlapping',
  },
  subtitle: {
    id: 'audience.segments.lookalike.type.cohort.calibrationInProgress.subtitle',
    defaultMessage: 'This should take a few seconds',
  },
});

type Props = WrappedComponentProps;

class CohortCalibrationInProgress extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={`mcs_cohortCalibrationInProgress`}>
        <Loading isFullScreen={false} />
        <div className={`mcs_cohortCalibrationInProgress-title`}>
          {formatMessage(messages.title)}
        </div>
        <div className={`mcs_cohortCalibrationInProgress-subtitle`}>
          {formatMessage(messages.subtitle)}
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(injectIntl)(CohortCalibrationInProgress);
