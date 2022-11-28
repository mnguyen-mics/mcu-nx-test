import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { AreaChartOutlined } from '@ant-design/icons';

const messages = defineMessages({
  calibrationFailedTitle: {
    id: 'audience.segments.lookalike.type.cohort.calibrationFailed.genericFail.title',
    defaultMessage: 'Lookalike calibration failed',
  },
  noUserpointFailedTitle: {
    id: 'audience.segments.lookalike.type.cohort.calibrationFailed.noUserpoint.title',
    defaultMessage:
      'Unable to complete lookalike calibration (no userpoint / cohort available in seed segment)',
  },
});

export type CohortCalibrationFailedErrorType = 'GENERIC' | 'NO_USERPOINT';

export interface CohortCalibrationFailedProps {
  errorType: CohortCalibrationFailedErrorType;
}

type Props = CohortCalibrationFailedProps & WrappedComponentProps;

class CohortCalibrationFailed extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      errorType,
    } = this.props;

    return (
      <div className={`mcs_cohortCalibrationFailed`}>
        <AreaChartOutlined className={`mcs_cohortCalibrationFailed-icon`} />
        <div className={`mcs_cohortCalibrationFailed-title`}>
          {errorType === 'GENERIC'
            ? formatMessage(messages.calibrationFailedTitle)
            : formatMessage(messages.noUserpointFailedTitle)}
        </div>
      </div>
    );
  }
}

export default compose<Props, CohortCalibrationFailedProps>(injectIntl)(CohortCalibrationFailed);
