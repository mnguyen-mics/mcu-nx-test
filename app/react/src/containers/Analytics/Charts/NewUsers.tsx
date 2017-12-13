import * as React from 'react';
import PieChart from '../../../components/PieChart';

interface NewUsersProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
  colors: { [s: string]: string };
}

class NewUsers extends React.Component<NewUsersProps> {

  buildDataSet() {
    // const { report } = this.props;
    const value = 10;
    const totalValue = 40;
    return [
      { key: 'delivered', val: 10, color: '#ff9012' },
      { key: 'rest', val: (!value) ? 100 : Math.abs(totalValue - value), color: '#eaeaea' }
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

  render() {
    const dataset = this.buildDataSet();
    const pieChartsOptions = this.generateOptions(true, 'blue', 'mykey', 1, 2);

    return <PieChart
      identifier="newUsers"
      dataset={dataset}
      options={pieChartsOptions}
    />;
  }
}
export default NewUsers;
