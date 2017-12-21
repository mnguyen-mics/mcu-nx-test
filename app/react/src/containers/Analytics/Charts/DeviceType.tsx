import * as React from 'react';
import PieChart from '../../../components/PieChart';
import {compose} from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../Overview/messages';

interface DeviceTypeProps {
  hasFetchedVisitReportFormFactor: boolean;
  isFetchingVisitReportFormFactor: boolean;
  report: any[];
  colors: { [s: string]: string };
}

interface PieChartDatum {
  key: string;
  value: number;
  color: string;
}

type DatasetObject = {[s: string]: PieChartDatum};

class DeviceType extends React.Component<DeviceTypeProps & InjectedIntlProps> {

  // TODO more robust way
  colors = [
    '#00a1df',
    '#00ab67',
    '#fc3f48',
    '#fd7c12',
    '#d9d9d9',
  ];

  buildDataset(datasetObject: DatasetObject): PieChartDatum[] {
    const pieChartData: PieChartDatum[] = [];
    Object.keys(datasetObject).forEach((key: string) => {
      pieChartData.push(datasetObject[key]);
    });
    return pieChartData;
  }

  buildDatasetObject(rows: any[], key: string): DatasetObject {
    let colorIndex = 0;
    return rows.reduce((datasetObject: DatasetObject, row: any) => {
      if (!datasetObject[row[key]]) {
        datasetObject[row[key]] = {
          key: row[key],
          value: 0,
          color: this.colors[colorIndex],
        };
        colorIndex++;
      }
      datasetObject[row[key]].value += row.count;
      return datasetObject;
    }, {});
  }

  generateRatio(a: number, b: number) {
    const ratio = (a / b) * 100;
    return `${ratio.toFixed(2)}%`;
  }

  generateOptions(isHalf: boolean) {
    const { intl: { formatMessage } } = this.props;
    const colorFormated = '#ff9012';
    const gray = '#eaeaea';

    const options = {
      innerRadius: true,
      isHalf: isHalf,
      text: {
        text: formatMessage(messages.device_type),
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
    const {report, hasFetchedVisitReportFormFactor} = this.props;
    let chartComponent;

    if (hasFetchedVisitReportFormFactor) {
      const datasetObject = this.buildDatasetObject(report, 'form_factor');
      const dataset = this.buildDataset(datasetObject);
      const pieChartsOptions = this.generateOptions(false);
      chartComponent =
        (
          <PieChart
            identifier="DeviceType"
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
export default compose<DeviceTypeProps, any>(
  injectIntl,
)(DeviceType);
