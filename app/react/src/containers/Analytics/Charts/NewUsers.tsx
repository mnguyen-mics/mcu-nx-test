import * as React from 'react';
import PieChart from '../../../components/PieChart';

interface NewUsersProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
  colors: { [s: string]: string };
}

class NewUsers extends React.Component<NewUsersProps> {

  buildDataSet(a: number, b: number) {
    // const { report } = this.props;
    const value = a;
    const totalValue = b;
    return [
      { key: 'delivered', value: value, color: '#ff9012' },
      { key: 'rest', value: (!value) ? 100 : Math.abs(totalValue - value), color: '#eaeaea' }
    ];
  }

  generateRatio(a: number, b: number) {
    const ratio = (a / b) * 100;
    return `${ratio.toFixed(2)}%`;
  }

  generateOptions(isHalf: boolean, color: string, translationKey: string, ratioValeA: number, ratioValeB: number) {
    const colorFormated = '#ff9012';
    const gray = '#eaeaea';

    const options = {
      innerRadius: true,
      isHalf: isHalf,
      text: {
        value: (ratioValeB === 0 || ratioValeA === 0
            ? '0%'
            : this.generateRatio(ratioValeA, ratioValeB)
        ),
        //TODO INTL
        text: 'New Users vs old users',
      },
      colors: [colorFormated, gray],
    };
    return options;
  };

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

    const {report, hasFetchedVisitReport} = this.props;
    let chartComponent;
    if (hasFetchedVisitReport) {
      const ratio = this.extractRatio(report);
      const dataset = this.buildDataSet(ratio.a, ratio.b);
      const pieChartsOptions = this.generateOptions(true, 'blue', 'mykey', ratio.a, ratio.b);
      chartComponent =
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
export default NewUsers;
