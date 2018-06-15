import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';
import CatalogService from '../../../../services/CatalogService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { ServiceOfferResource } from '../../../../models/servicemanagement/PublicServiceItemResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const { Content } = Layout;

const messages = defineMessages({
  serviceOfferName: {
    id: 'settings.services.subscribed.offers.list.name',
    defaultMessage: 'Service Offer Name',
  },
  serviceOfferCreditedAccountId: {
    id: 'settings.services.subscribed.offers.list.credited.account.id',
    defaultMessage: 'Credited account id',
  },
  serviceOfferVersion: {
    id: 'settings.services.subscribed.offers.list.version',
    defaultMessage: 'Version',
  },
  serviceOfferProviderId: {
    id: 'settings.services.subscribed.offers.list.provided.id',
    defaultMessage: 'Provided Id',
  },
  serviceOfferConditions: {
    id: 'settings.services.subscribed.offers.list.conditions',
    defaultMessage: 'Conditions',
  },
  emptyOffers: {
    id: 'settings.services.subscribed.offers.empty.list',
    defaultMessage: 'No Service Offers',
  },
  serviceOffers: {
    id: 'settings.services.subscribed.service.offers.list',
    defaultMessage: 'Subscribed Service Offers',
  },
});

interface State {
  loading: boolean;
  data: ServiceOfferResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class DatamartsListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
    };
  }

  archiveOffer = (serviceOfferId: string) => {
    return Promise.resolve();
  };

  fetchOffers = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        // allow_administrator: true,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      CatalogService.getSubscribedOffers(organisationId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        })
        .catch(error => {
          this.setState({ loading: false });
          this.props.notifyError(error);
        });
    });
  };

  onClickEdit = (offer: ServiceOfferResource) => {
    // const {
    //   history,
    //   match: {
    //     params: { organisationId },
    //   },
    // } = this.props;
    // history.push(
    //   `/v2/o/${organisationId}/settings/subscribed_services/${
    //     offer.id
    //   }/edit`,
    // );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: [{ translationKey: 'EDIT', callback: this.onClickEdit }],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.serviceOfferName,
        key: 'name',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceOfferResource) => (
          <Link
            to={`/v2/o/${organisationId}/settings/subscribed_services/${
              record.id
            }/edit`}
          >
            {value}
          </Link>
        ),
      },
      {
        intlMessage: messages.serviceOfferCreditedAccountId,
        key: 'credited_account_id',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceOfferResource) => (
          <span>{record.credited_account_id}</span>
        ),
      },
      {
        intlMessage: messages.serviceOfferVersion,
        key: 'version',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceOfferResource) => (
          <span>{record.version}</span>
        ),
      },
      {
        intlMessage: messages.serviceOfferProviderId,
        key: 'provided_id',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceOfferResource) => (
          <span>{record.provider_id}</span>
        ),
      },
      {
        intlMessage: messages.serviceOfferConditions,
        key: 'conditions',
        isVisibleByDefault: true,
        isHideable: false,
        render: (value: string, record: ServiceOfferResource) => {
          const renderServiceTypes = () => {
            record.conditions.forEach(c => (
              <span key={c.id}>{c.serviceItem.service_type}</span>
            ));
          };
          return <div>{renderServiceTypes}</div>;
        },
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.emptyOffers,
    };

    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...messages.serviceOffers} />
          </span>
        </div>
        <hr className="mcs-separator" />
      </div>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <ItemList
            fetchList={this.fetchOffers}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
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
)(DatamartsListPage);
