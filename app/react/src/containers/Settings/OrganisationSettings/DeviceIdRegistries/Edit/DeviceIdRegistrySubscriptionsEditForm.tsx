import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';
import { Col, Row } from 'antd';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { FormTitle } from '../../../../../components/Form';
import { DeviceIdRegistryOfferResource } from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../../Datamart';
import { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import messages from '../messages';
import RegistryOfferCard from './RegistryOfferCard';

interface DeviceIdRegistrySubscriptionsEditFormState {}

interface DeviceIdRegistrySubscriptionsEditFormProps {
  subscribedOffers: DeviceIdRegistryOfferResource[];
  subscribableOffers: DeviceIdRegistryOfferResource[];
  subscribe: (id: string) => void;
  unsubscribe: (id: string) => void;
}

type Props = DeviceIdRegistrySubscriptionsEditFormProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedWorkspaceProps;

class DeviceIdRegistrySubscriptionsEditForm extends React.Component<
  Props,
  DeviceIdRegistrySubscriptionsEditFormState
> {
  renderRgistryOfferCards = (
    offers: DeviceIdRegistryOfferResource[],
    subscribed: boolean,
    action: (id: string) => void,
  ) => {
    const {
      workspace: { organisation_id },
    } = this.props;

    const nbCardsPerLine = 3;
    const cards = offers.map(offer => {
      return (
        <Col
          key={'registry_offer_card_' + organisation_id + '-' + offer.id}
          span={24 / nbCardsPerLine}
          className='text-center'
        >
          <RegistryOfferCard offer={offer} subscribed={subscribed} action={action} />
        </Col>
      );
    });

    const rows = [];
    for (let i = 0; i < offers.length; i += nbCardsPerLine) {
      rows.push(
        <Row
          key={i}
          className='mcs-DeviceIdRegistrySubscriptionsEditForm_offerCardsRow'
          gutter={[30, 40]}
        >
          {cards.slice(i, i + nbCardsPerLine)}
        </Row>,
      );
    }

    return rows;
  };

  render() {
    const {
      intl: { formatMessage },
      subscribedOffers,
      subscribableOffers,
      subscribe,
      unsubscribe,
    } = this.props;

    return (
      <div>
        <FormTitle title={messages.availableThirdPartyRegistries} />
        {!subscribableOffers.length ? (
          <div className='mcs-DeviceIdRegistrySubscriptionsEditForm_emptyOffersSection'>
            <EmptyTableView
              className='mcs-table-view-empty mcs-empty-card'
              iconType={'settings'}
              message={formatMessage(messages.emptyEvailableThirdPartyRegistries)}
            />
          </div>
        ) : (
          <div className='mcs-DeviceIdRegistrySubscriptionsEditForm_offersSection'>
            {this.renderRgistryOfferCards(subscribableOffers, false, subscribe)}
          </div>
        )}

        <FormTitle title={messages.subscribedThirdPartyRegistries} />
        <div className='mcs-DeviceIdRegistrySubscriptionsEditForm_offersSection'>
          {!subscribedOffers.length ? (
            <div className='mcs-DeviceIdRegistrySubscriptionsEditForm_emptyOffersSection'>
              <EmptyTableView
                className='mcs-table-view-empty mcs-empty-card'
                iconType={'settings'}
                message={formatMessage(messages.emptySubscribedThirdPartyRegistries)}
              />
            </div>
          ) : (
            this.renderRgistryOfferCards(subscribedOffers, true, unsubscribe)
          )}
        </div>
      </div>
    );
  }
}

export default compose<Props, DeviceIdRegistrySubscriptionsEditFormProps>(
  injectIntl,
  injectWorkspace,
)(DeviceIdRegistrySubscriptionsEditForm);
