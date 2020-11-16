import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row, Breadcrumb } from 'antd';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../../messages';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { Filters } from '../../OrganisationSettings/Labels/LabelsTable';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { ICatalogService } from '../../../../services/CatalogService';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';
import { ServiceItemOfferResource } from '../../../../models/servicemanagement/PublicServiceItemResource';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import ItemList from '../../../../components/ItemList';
import Button, { ButtonProps } from 'antd/lib/button';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

const { Content } = Layout;

interface RouterProps {
  organisationId: string;
}
interface State {
  loading: boolean;
  data: ServiceItemOfferResource[];
  total: number;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps;

class MyOffersPage extends React.Component<Props, State> {

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  constructor(props: Props) {




    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
    };
  }

  fetchOffers = (organisationId: string, filters: Filters) => {
    this.setState({
      loading: true,
    });

    const options = {
      organisation_id: organisationId,
      ...getPaginatedApiParam(filters.currentPage, filters.pageSize)
    }
    this._catalogService.getMyOffers(options)
      .then(myOffersResult => {
        this.setState({
          loading: false,
          data: myOffersResult.data,
          total: myOffersResult.total || myOffersResult.count
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

    const {
      loading,
      data,
      total
    } = this.state;

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const dataColumnsDefinition = [
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: ServiceItemOfferResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/services/my_offers/${
              record.id
              }/service_item_conditions`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.creditedAccount,
        key: 'credited_account_name',
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
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.empty),
    };

    const submitButtonProps: ButtonProps = {
      htmlType: 'submit',
      onClick: () => { return null; },
      type: 'primary',
    };

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <Breadcrumb
              className={'mcs-breadcrumb'}
              separator={<McsIcon type="chevron-right" />}
            >
              <Breadcrumb.Item>
                <span style={{ lineHeight: "40px" }}>
                  <FormattedMessage {...messages.myServiceOffersTitle} />
                </span>
                <Link to={`/v2/o/${organisationId}/settings/services/my_offers/create`}>
                  <Button {...submitButtonProps} className="mcs-primary" style={{ float: "right" }}>
                    <McsIcon type="plus" />
                    <FormattedMessage {...messages.myServiceOffersAddNew} />
                  </Button>
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
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
)(MyOffersPage);
