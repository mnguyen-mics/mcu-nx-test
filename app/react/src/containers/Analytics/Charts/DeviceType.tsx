import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../Overview/messages';
import EmptyCharts from '../../../components/EmptyCharts/EmptyChart';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../Helpers/injectThemeColors';
import { PiePlot } from '@mediarithmics-private/mcs-components-library';

interface DeviceTypeProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
}

type Color =
  | 'mcs-error'
  | 'mcs-warning'
  | 'mcs-success'
  | 'mcs-info'
  | 'mcs-primary'
  | 'mcs-highlight';

interface PieChartDatum {
  key: string;
  value: number;
  color: string;
}

type DatasetObject = { [s: string]: PieChartDatum };

class DeviceType extends React.Component<
  DeviceTypeProps & InjectedIntlProps & InjectedThemeColorsProps
> {
  colorNames = [
    'mcs-error',
    'mcs-warning',
    'mcs-success',
    'mcs-info',
    'mcs-primary',
    'mcs-highlight',
  ];

  buildDataset(datasetObject: DatasetObject): PieChartDatum[] {
    const pieChartData: PieChartDatum[] = [];
    Object.keys(datasetObject).forEach((key: string) => {
      pieChartData.push(datasetObject[key]);
    });
    return pieChartData;
  }

  buildDatasetObject(rows: any[], key: string): DatasetObject {
    const { colors } = this.props;
    let colorIndex = 0;
    const colorsArray = this.colorNames.map((name: Color) => colors[name]);
    return rows.reduce((datasetObject: DatasetObject, row: any) => {
      if (!datasetObject[row[key]]) {
        datasetObject[row[key]] = {
          key: row[key],
          value: 0,
          color: colorsArray[colorIndex],
        };
        colorIndex++;
      }
      datasetObject[row[key]].value += row.count;
      return datasetObject;
    }, {});
  }

  generateRatio(a: number, b: number) {
    const ratio = a / b * 100;
    return `${ratio.toFixed(2)}%`;
  }

  generateOptions(isHalf: boolean) {
    const { intl: { formatMessage }, colors } = this.props;
    const colorFormated = colors['mcs-warning'];
    const gray = colors['mcs-normal'];

    const options = {
      innerRadius: true,
      isHalf: isHalf,
      text: {
        text: formatMessage(messages.device_type),
      },
      colors: [colorFormated, gray],
      showTooltip: true,
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

    return { a: unique, b: count };
  }

  render() {
    const {
      report,
      hasFetchedVisitReport,
      intl: { formatMessage },
    } = this.props;
    let chartComponent;

    if (hasFetchedVisitReport) {
      const datasetObject = this.buildDatasetObject(report, 'form_factor');
      const dataset = this.buildDataset(datasetObject);
      const pieChartsOptions = this.generateOptions(false);
      chartComponent =
        (dataset && dataset.length === 0) || !hasFetchedVisitReport ? (
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
export default compose<DeviceTypeProps, any>(injectIntl, injectThemeColors)(
  DeviceType,
);
