import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { AreaChartOutlined } from '@ant-design/icons';

const messages = defineMessages({
  title: {
    id: 'audience.segments.lookalike.type.cohort.calculationFailed.title',
    defaultMessage: 'Cohorts calculation failed',
  },
});

type Props = WrappedComponentProps;

class CohortCalculationFailed extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={`mcs_cohortCalculationFailed`}>
        <AreaChartOutlined className={`mcs_cohortCalculationFailed-icon`} />
        <div className={`mcs_cohortCalculationFailed-title`}>{formatMessage(messages.title)}</div>
      </div>
    );
  }
}

export default compose<Props, {}>(injectIntl)(CohortCalculationFailed);
