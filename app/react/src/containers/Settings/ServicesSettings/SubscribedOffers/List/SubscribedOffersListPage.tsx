import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import CatalogService from '../../../../../services/CatalogService';
import ItemList, { Filters } from '../../../../../components/ItemList';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { ServiceItemOfferResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { McsIconType } from '../../../../../components/McsIcon';

const { Content } = Layout;

const messages = defineMessages({
  serviceOffers: {
    id: 'settings.services.subscribed.service.offers.list',
    defaultMessage: 'Subscribed Offers',
  },
  name: {
    id: 'settings.services.subscribed.service.offers.list.column.name',
    defaultMessage: 'Name',
  },
  creditedAccount: {
    id:
      'settings.services.subscribed.service.offers.list.column.credited.account',
    defaultMessage: 'Credited Account',
  },
  providerName: {
    id: 'settings.services.subscribed.service.offers.list.column.provider.name',
    defaultMessage: 'Provider Name',
  },
  empty: {
    id: 'settings.services.subscribed.service.offers.empty.list',
    defaultMessage: 'You have not subscribed to service offers.',
  },
  subscribedOffersTitle: {
    id: 'settings.services.subscribed.service.offers.title',
    defaultMessage: 'Subscribed Offers',
  },
});

interface RouterProps {
  organisationId: string;
}

interface State {
  data: ServiceItemOfferResource[];
  loading: boolean;
  total: number;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class SubscribedOffersListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      total: 0,
      loading: false,
    };
  }

  fetchOffers = (organisationId: string, filter: Filters) => {
    this.setState({
      loading: true,
    });
    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };
    CatalogService.getSubscribedOffers(organisationId, options)
      .then(resp => {
        this.setState({
          loading: false,
          data: resp.data,
          total: resp.total || resp.count,
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
        });
        this.props.notifyError(err);
      });
  };

  render() {
    const { loading, data, total } = this.state;

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const dataColumnsDefinition = [
      {
        translationKey: 'NAME',
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/services/subscribed_offers/${
              record.id
            }/service_item_conditions`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.creditedAccount,
        key: 'credited_account_id',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => {
          return <span>{text}</span>;
        },
      },
      {
        intlMessage: messages.providerName,
        key: 'provider_name',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => {
          return <span>{text}</span>;
        },
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.empty,
    };

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div className="mcs-card-title">
              <FormattedMessage {...messages.subscribedOffersTitle} />
            </div>
          </Row>
          <ItemList
            fetchList={this.fetchOffers}
            dataSource={data}
            loading={loading}
            total={total}
            columns={dataColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
          />
        </Content>
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
)(SubscribedOffersListPage);
