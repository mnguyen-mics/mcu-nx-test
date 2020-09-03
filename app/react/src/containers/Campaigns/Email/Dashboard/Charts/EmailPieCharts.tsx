import * as React from 'react';
import { Row, Col } from 'antd';

import {
  LoadingChart,
} from '../../../../../components/EmptyCharts';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { PiePlot, EmptyChart } from '@mediarithmics-private/mcs-components-library';

const messageMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  DELIVERED: {
    id: 'email.campaigns.dashboard.charts.delivered',
    defaultMessage: 'Delivered',
  },
  OPENS: {
    id: 'email.campaigns.dashboard.charts.opened',
    defaultMessage: 'Opened',
  },
  CLICKS: {
    id: 'email.campaigns.dashboard.charts.clicks',
    defaultMessage: 'Clicks',
  },
  CLICKS_TO_OPENS: {
    id: 'email.campaigns.dashboard.charts.openingCLicks',
    defaultMessage: 'Opening Clicks',
  },
  UNSUBSCRIBE: {
    id: 'email.campaigns.dashboard.charts.Unsubscribed',
    defaultMessage: 'Unsubscribed',
  },
});

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

type Props = EmailPieChartsProps & InjectedThemeColorsProps & InjectedIntlProps;

class EmailPieCharts extends React.Component<Props> {
  renderPieCharts = (deliveryReport: EmailDeliveryReport) => {
    const {
      emailClicks,
      emailDelivered,
      emailOpened,
      emailUnsubscribed,
      emailSent,
    } = deliveryReport;

    const generateRatio = (a: number, b: number) => {
      if (a === 0 || b === 0) return '0%';
      const ratio = (a / b) * 100;
      return `${Math.round(ratio)}%`;
    };

    const generateData = (type: string) => {
      const { colors } = this.props;

      switch (type) {
        case 'delivered':
          return [
            {
              key: 'delivered',
              value: emailDelivered ? emailDelivered : 0,
              color: colors['mcs-warning'],
            },
            {
              key: 'rest',
              value:
                emailDelivered === 0
                  ? 100
                  : Math.abs(emailSent - emailDelivered),
              color: '#eaeaea',
            },
          ];
        case 'opens':
          return [
            {
              key: 'opened',
              value: emailOpened ? emailOpened : 0,
              color: colors['mcs-info'],
            },
            {
              key: 'rest',
              value:
                emailOpened === 0 ? 100 : Math.abs(emailSent - emailOpened),
              color: '#eaeaea',
            },
          ];
        case 'clicks2open':
          return [
            {
              key: 'clicks',
              value: emailClicks ? emailClicks : 0,
              color: colors['mcs-info'],
            },
            {
              key: 'rest',
              value:
                emailClicks === 0 ? 100 : Math.abs(emailOpened - emailClicks),
              color: '#eaeaea',
            },
          ];
        case 'clicks':
          return [
            {
              key: 'clicks',
              value: emailClicks ? emailClicks : 0,
              color: colors['mcs-info'],
            },
            {
              key: 'rest',
              value:
                emailClicks === 0 ? 100 : Math.abs(emailSent - emailClicks),
              color: '#eaeaea',
            },
          ];
        case 'unsubscribe':
          return [
            {
              key: 'unsubscribe',
              value: emailUnsubscribed ? emailUnsubscribed : 0,
              color: colors['mcs-info'],
            },
            {
              key: 'rest',
              value:
                emailUnsubscribed === 0
                  ? 100
                  : Math.abs(emailSent - emailUnsubscribed),
              color: '#eaeaea',
            },
          ];
        default:
          return [];
      }
    };

    const generateOptions = (
      isHalf: boolean,
      color: string,
      translationKey: string,
      ratioValeA: number,
      ratioValeB: number,
    ) => {
      const { colors, intl } = this.props;

      let colorFormated = '';
      if (color === 'blue') {
        colorFormated = colors['mcs-info'];
      } else {
        colorFormated = colors['mcs-warning'];
      }
      const gray = '#eaeaea';

      const options = {
        innerRadius: true,
        isHalf: isHalf,
        text: {
          value: generateRatio(ratioValeA, ratioValeB),
          text: intl.formatMessage(messageMap[translationKey]),
        },
        colors: [colorFormated, gray],
      };

      return options;
    };

    return (
      <div>
        <Row>
          <Col span={7}>
            <PiePlot 
              dataset={generateData('delivered')}
              options={generateOptions(
                false,
                'orange',
                'DELIVERED',
                emailDelivered,
                emailSent,
              )}
            />
          </Col>
          <Col span={17}>
            <Row>
              <Col span={12}>
                <PiePlot
                  dataset={generateData('opens')}
                  options={generateOptions(
                    true,
                    'blue',
                    'OPENS',
                    emailOpened,
                    emailSent,
                  )}
                />
              </Col>
              <Col span={12}>
                <PiePlot
                  dataset={generateData('clicks')}
                  options={generateOptions(
                    true,
                    'blue',
                    'CLICKS',
                    emailClicks,
                    emailSent,
                  )}
                />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <PiePlot
                  dataset={generateData('clicks2open')}
                  options={generateOptions(
                    true,
                    'blue',
                    'CLICKS_TO_OPENS',
                    emailClicks,
                    emailOpened,
                  )}
                />
              </Col>
              <Col span={12}>
                <PiePlot
                  dataset={generateData('unsubscribe')}
                  options={generateOptions(
                    true,
                    'blue',
                    'UNSUBSCRIBE',
                    emailUnsubscribed,
                    emailSent,
                  )}
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
              id="email.campaign.dashboard.charts.noData"
              defaultMessage="No Data"
            />
          }
          icon='warning'
        />
      );

    return this.renderPieCharts(deliveryReport);
  }
}

export default compose<Props, EmailPieChartsProps>(
  injectThemeColors,
  injectIntl,
)(EmailPieCharts);
