import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Loading } from '@mediarithmics-private/mcs-components-library';

const messages = defineMessages({
  title: {
    id: 'audience.segments.lookalike.type.cohort.calculationInProgress.title',
    defaultMessage: 'We are calculating segment and cohorts overlapping',
  },
  subtitle: {
    id: 'audience.segments.lookalike.type.cohort.calculationInProgress.subtitle',
    defaultMessage: 'This should take a few seconds',
  },
});

type Props = WrappedComponentProps;

class CohortCalculationInProgress extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={`mcs_cohortCalculationInProgress`}>
        <Loading isFullScreen={false} />
        <div className={`mcs_cohortCalculationInProgress-title`}>
          {formatMessage(messages.title)}
        </div>
        <div className={`mcs_cohortCalculationInProgress-subtitle`}>
          {formatMessage(messages.subtitle)}
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(injectIntl)(CohortCalculationInProgress);
