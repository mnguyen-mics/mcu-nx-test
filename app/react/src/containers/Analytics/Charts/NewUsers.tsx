import * as React from 'react';
import messages from '../Overview/messages';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import EmptyCharts from '../../../components/EmptyCharts/EmptyChart';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../Helpers/injectThemeColors';
import { PiePlot } from '@mediarithmics-private/mcs-components-library';

interface NewUsersProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  reportPreviousPeriod: any[];
  report: any[];
}

type JoinedProps = NewUsersProps & InjectedIntlProps & InjectedThemeColorsProps;

class NewUsers extends React.Component<JoinedProps> {
  buildDataSet(a: number, b: number) {
    const { intl: { formatMessage }, colors } = this.props;
    return [
      {
        key: formatMessage(messages.new_users),
        value: a,
        color: colors['mcs-warning'],
      },
      {
        key: formatMessage(messages.returning_users),
        value: b,
        color: colors['mcs-normal'],
      },
    ];
  }

  generateRatio(a: number, b: number) {
    const ratio = a / b * 100;
    return `${ratio.toFixed(2)}%`;
  }

  generateOptions(
    isHalf: boolean,
    color: string,
    translationKey: string,
    ratioValeA: number,
    ratioValeB: number,
  ) {
    const { intl: { formatMessage }, colors } = this.props;
    const colorFormated = colors['mcs-warning'];
    const gray = colors['mcs-normal'];

    const options = {
      innerRadius: true,
      isHalf: isHalf,
      text: {
        value:
          ratioValeB === 0 || ratioValeA === 0
            ? '0%'
            : this.generateRatio(ratioValeA, ratioValeB),
        text: formatMessage(messages.new_users),
      },
      colors: [colorFormated, gray],
      showTooltip: true,
    };
    return options;
  }

  extractRatio(report: any, reportPreviousPeriod: any) {
    const unique = report.reduce((accu: number, elem: any) => {
      return accu + elem.unique_user;
    }, 0);

    const uniquePreviousPeriod = reportPreviousPeriod.reduce(
      (accu: number, elem: any) => {
        return accu + elem.unique_user;
      },
      0,
    );

    return { a: unique, b: uniquePreviousPeriod };
  }

  render() {
    const {
      report,
      reportPreviousPeriod,
      hasFetchedVisitReport,
      intl: { formatMessage },
    } = this.props;
    let chartComponent;
    if (hasFetchedVisitReport) {
      const ratio = this.extractRatio(report, reportPreviousPeriod);
      const dataset = this.buildDataSet(ratio.a, ratio.b);
      const pieChartsOptions = this.generateOptions(
        false,
        'blue',
        'mykey',
        ratio.a,
        ratio.a + ratio.b,
      );
      chartComponent =
        (report && report.length === 0) ||
        (reportPreviousPeriod && reportPreviousPeriod.length === 0) ||
        !hasFetchedVisitReport ? (
          <EmptyCharts title={formatMessage(messages.no_visit_stat)} />
        ) : (
          <PiePlot
            dataset={dataset}
            options={pieChartsOptions}
          />
        );
    } else {
      chartComponent = <div />;
    }

    return chartComponent;
  }
}

export default compose<JoinedProps, any>(injectIntl, injectThemeColors)(
  NewUsers,
);
