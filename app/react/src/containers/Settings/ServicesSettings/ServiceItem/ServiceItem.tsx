import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Input } from 'antd';
import { messages } from '../SubscribedOffers/List/SubscribedOffersListPage';
import {
  ServiceItemConditionShape,
  isLinearServiceItemConditionsResource,
  ServiceItemShape,
} from '../../../../models/servicemanagement/PublicServiceItemResource';

interface ServiceItemProps {
  serviceItem?: ServiceItemShape;
  serviceItemCondition?: ServiceItemConditionShape;
  hasPriceChart?: boolean;
}

interface State {
  price: string;
}

type Props = ServiceItemProps & WrappedComponentProps;

class ServiceItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      price: props.intl.formatMessage(messages.serviceItemPricePlaceholder),
    };
  }

  onChange = (e: any) => {
    const { serviceItemCondition } = this.props;
    const { intl } = this.props;
    if (serviceItemCondition && isLinearServiceItemConditionsResource(serviceItemCondition)) {
      const isValidValue = e.target.value && /^[0-9]+(\.[0-9]{1,2})?$/i.test(e.target.value);
      this.setState({
        price: isValidValue
          ? `${intl.formatMessage(messages.serviceItemPrice)} ${(
              parseFloat(e.target.value) * serviceItemCondition.percent_value +
              serviceItemCondition.fixed_value
            ).toFixed(2)} €`
          : intl.formatMessage(messages.invalidImpressionCost),
      });
    }
  };

  render() {
    const { intl, serviceItem, hasPriceChart } = this.props;

    const serviceItemElements =
      hasPriceChart === true
        ? [
            <div className='service-price' key={0}>
              {this.state.price}
            </div>,
            <div key={1}>
              <div className='service-text'>
                {intl.formatMessage(messages.serviceItemPriceSimulatorText)}
              </div>
              <Input
                addonBefore={intl.formatMessage(messages.serviceItemPriceSimulatorInputPlaceholder)}
                onChange={this.onChange}
              />
            </div>,
          ]
        : [undefined, undefined];

    return (
      <div>
        {serviceItemElements[0]}
        <div className='service-text'>
          {serviceItem && serviceItem.description
            ? serviceItem.description
            : intl.formatMessage(messages.serviceItemNoDescription)}
        </div>
        {serviceItemElements[1]}
      </div>
    );
  }
}

export default compose<Props, ServiceItemProps>(injectIntl)(ServiceItem);
