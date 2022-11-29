import * as React from 'react';
import { Row, Col } from 'antd';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { compose } from 'recompose';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { PieChart, EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { PieChartFormat } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';

export interface EmailDeliveryReport {
  emailDelivered: number;
  emailOpened: number;
  emailUnsubscribed: number;
  emailClicks: number;
  emailSent: number;
}

export interface EmailPieChartsProps {
  deliveryReport?: EmailDeliveryReport;
  isLoading: boolean;
}

type Props = EmailPieChartsProps & InjectedThemeColorsProps & WrappedComponentProps;

class EmailPieCharts extends React.Component<Props> {
  renderPieCharts = (deliveryReport: EmailDeliveryReport) => {
    const { emailClicks, emailDelivered, emailOpened, emailUnsubscribed, emailSent } =
      deliveryReport;

    const generateData = (type: string) => {
      const { colors } = this.props;

      switch (type) {
        case 'delivered':
          return [
            {
              key: 'delivered',
              value: emailDelivered ? emailDelivered : 0,
              color: colors['mcs-chart-2'],
            },
            {
              key: 'rest',
              value: emailDelivered === 0 ? 100 : Math.abs(emailSent - emailDelivered),
              color: '#eaeaea',
            },
          ];
        case 'opens':
          return [
            {
              key: 'opened',
              value: emailOpened ? emailOpened : 0,
              color: colors['mcs-chart-1'],
            },
            {
              key: 'rest',
              value: emailOpened === 0 ? 100 : Math.abs(emailSent - emailOpened),
              color: '#eaeaea',
            },
          ];
        case 'clicks2open':
          return [
            {
              key: 'clicks',
              value: emailClicks ? emailClicks : 0,
              color: colors['mcs-chart-1'],
            },
            {
              key: 'rest',
              value: emailClicks === 0 ? 100 : Math.abs(emailOpened - emailClicks),
              color: '#eaeaea',
            },
          ];
        case 'clicks':
          return [
            {
              key: 'clicks',
              value: emailClicks ? emailClicks : 0,
              color: colors['mcs-chart-1'],
            },
            {
              key: 'rest',
              value: emailClicks === 0 ? 100 : Math.abs(emailSent - emailClicks),
              color: '#eaeaea',
            },
          ];
        case 'unsubscribe':
          return [
            {
              key: 'unsubscribe',
              value: emailUnsubscribed ? emailUnsubscribed : 0,
              color: colors['mcs-chart-1'],
            },
            {
              key: 'rest',
              value: emailUnsubscribed === 0 ? 100 : Math.abs(emailSent - emailUnsubscribed),
              color: '#eaeaea',
            },
          ];
        default:
          return [];
      }
    };

    const generateOptions = (isHalf: boolean, color: string) => {
      const { colors } = this.props;

      let colorFormated = '';
      if (color === 'blue') {
        colorFormated = colors['mcs-chart-1'];
      } else {
        colorFormated = colors['mcs-chart-2'];
      }
      const gray = '#eaeaea';

      const options = {
        innerRadius: true,
        isHalf: isHalf,
        // text: {
        //   value: generateRatio(ratioValeA, ratioValeB),
        //   text: intl.formatMessage(messageMap[translationKey]),
        // }, // Deprecated by this spec: https://docs.google.com/presentation/d/1bs18HSKzW4g1DpHej4WhVcmswffUN0s-lJxgPp1p_kA/edit#slide=id.ge81274b9a1_0_0
        colors: [colorFormated, gray],
        format: 'count' as PieChartFormat,
      };

      return options;
    };

    return (
      <div>
        <Row>
          <Col span={7}>
            <PieChart dataset={generateData('delivered')} {...generateOptions(false, 'orange')} />
          </Col>
          <Col span={17}>
            <Row>
              <Col span={12}>
                <PieChart dataset={generateData('opens')} {...generateOptions(true, 'blue')} />
              </Col>
              <Col span={12}>
                <PieChart dataset={generateData('clicks')} {...generateOptions(true, 'blue')} />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <PieChart
                  dataset={generateData('clicks2open')}
                  {...generateOptions(true, 'blue')}
                />
              </Col>
              <Col span={12}>
                <PieChart
                  dataset={generateData('unsubscribe')}
                  {...generateOptions(true, 'blue')}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const { deliveryReport, isLoading } = this.props;

    if (isLoading) return <LoadingChart />;

    if (!deliveryReport)
      return (
        <EmptyChart
          title={
            <FormattedMessage
              id='email.campaign.dashboard.charts.noData'
              defaultMessage='No Data'
            />
          }
          icon='warning'
        />
      );

    return this.renderPieCharts(deliveryReport);
  }
}

export default compose<Props, EmailPieChartsProps>(injectThemeColors, injectIntl)(EmailPieCharts);
