import * as React from 'react';
import PieChart from '../../../components/PieChart';
import messages from '../Overview/messages';
import {compose} from 'recompose';
import {injectIntl, InjectedIntlProps} from 'react-intl';
import {connect} from 'react-redux';
import EmptyCharts from '../../../components/EmptyCharts/EmptyChart';

interface NewUsersProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
  colors: { [s: string]: string };
}

type JoinedProps = NewUsersProps & InjectedIntlProps;

class NewUsers extends React.Component<JoinedProps> {

  buildDataSet(a: number, b: number) {
    const { intl: { formatMessage }, colors } = this.props;
    const value = a;
    const totalValue = b;
    return [
      { key: formatMessage(messages.delivered), value: value, color: colors['mcs-warning'] },
      { key: formatMessage(messages.rest), value: (!value) ? 100 : Math.abs(totalValue - value), color: colors['mcs-normal'] },
    ];
  }

  generateRatio(a: number, b: number) {
    const ratio = (a / b) * 100;
    return `${ratio.toFixed(2)}%`;
  }

  generateOptions(isHalf: boolean, color: string, translationKey: string, ratioValeA: number, ratioValeB: number) {
    const { intl: { formatMessage }, colors} = this.props;
    const colorFormated = colors['mcs-warning'];
    const gray = colors['mcs-normal'];

    const options = {
      innerRadius: true,
      isHalf: isHalf,
      text: {
        value: (ratioValeB === 0 || ratioValeA === 0
            ? '0%'
            : this.generateRatio(ratioValeA, ratioValeB)
        ),
        text: formatMessage(messages.new_users),
      },
      colors: [colorFormated, gray],
    };
    return options;
  }

  extractRatio(report: any) {
    const unique = report.reduce((accu: number, elem: any) => {
      return accu + elem.unique_user;
    }, 0);

    const count = report.reduce((accu: number, elem: any) => {
      return accu + elem.count;
    }, 0);

    return {a: unique, b: count};
  }

  render() {
    const {report, hasFetchedVisitReport, intl: {formatMessage} } = this.props;
    let chartComponent;
    if (hasFetchedVisitReport) {
      const ratio = this.extractRatio(report);
      const dataset = this.buildDataSet(ratio.a, ratio.b);
      const pieChartsOptions = this.generateOptions(false, 'blue', 'mykey', ratio.a, ratio.b);
      chartComponent =
          (report && report.length === 0 || !hasFetchedVisitReport) ?
          <EmptyCharts title={formatMessage(messages.no_visit_stat)} /> :
          (
            <PieChart
              identifier="newUsers"
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

export default compose<JoinedProps, any>(
  injectIntl,
  connect(
    (state: any) => ({
      colors: state.theme.colors,
    }),
  ),
)(NewUsers);
