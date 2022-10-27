import { FileOutlined } from '@ant-design/icons/lib/icons';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { Button, Tag } from 'antd';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import {
  DeviceIdRegistryOfferResource,
  DeviceIdRegistryType,
} from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import messages from '../messages';

export interface RegistryOfferCardProps {
  offer: DeviceIdRegistryOfferResource;
  subscribed: boolean;
  action: (id: string) => void;
}

export type Props = RegistryOfferCardProps & InjectedIntlProps;

interface State {}

class RegistryOfferCard extends React.Component<Props, State> {
  getRegistryTypeTagColor = (type: DeviceIdRegistryType) => {
    switch (type) {
      case DeviceIdRegistryType.CUSTOM_DEVICE_ID:
        return 'purple';
      case DeviceIdRegistryType.INSTALLATION_ID:
        return 'magenta';
      case DeviceIdRegistryType.MOBILE_ADVERTISING_ID:
        return 'green';
      case DeviceIdRegistryType.MOBILE_VENDOR_ID:
        return 'red';
      case DeviceIdRegistryType.MUM_ID:
        return 'blue';
      case DeviceIdRegistryType.NETWORK_DEVICE_ID:
        return 'orange';
      default:
        return '';
    }
  };

  renderRegistryOfferTypeTags = (offer: DeviceIdRegistryOfferResource, subscribed: boolean) => {
    const registryTypes = [...new Set(offer.device_id_registries.map(registry => registry.type))];
    return registryTypes.map(type => {
      return <Tag color={subscribed ? '' : this.getRegistryTypeTagColor(type)}>{type}</Tag>;
    });
  };

  public render() {
    const {
      offer,
      subscribed,
      action,
      intl: { formatMessage },
    } = this.props;

    return (
      <Card className='mcs-registryOfferCard'>
        <div className='mcs-registryOfferCard_imageContainer'>
          {offer.device_id_registries[0].image_uri ? (
            <img
              src={offer.device_id_registries[0].image_uri}
              className='mcs-registryOfferCard_image'
            />
          ) : (
            <FileOutlined className='mcs-registryOfferCard_missingImageIcon' />
          )}
        </div>

        <div className='mcs-registryOfferCard_nameContainer'>
          <p className='mcs-registryOfferCard_name'>{offer.name}</p>
        </div>

        <div className='mcs-registryOfferCard_typeContainer'>
          {this.renderRegistryOfferTypeTags(offer, subscribed)}
        </div>

        <div className='mcs-registryOfferCard_actionButtonContainer'>
          {subscribed ? (
            <Button
              key='unsubscribe'
              type='link'
              danger={true}
              onClick={() => action(offer.id)}
              block={true}
            >
              {formatMessage(messages.unsubscribe)}
            </Button>
          ) : (
            <Button
              key='subscribe'
              type='primary'
              className='mcs-primary'
              onClick={() => action(offer.id)}
              block={true}
            >
              {formatMessage(messages.subscribe)}
            </Button>
          )}
        </div>
      </Card>
    );
  }
}

export default compose<Props, RegistryOfferCardProps>(injectIntl)(RegistryOfferCard);
