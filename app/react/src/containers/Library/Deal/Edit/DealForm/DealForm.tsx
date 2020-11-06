import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { Form, InjectedFormProps, reduxForm } from 'redux-form';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
} from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { BasicProps } from 'antd/lib/layout/layout';
import { DealDescriptorResource } from '../../../../../models/deal/DealDescriptorResource';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { ICatalogService } from '../../../../../services/CatalogService';
import {
  FormInput,
  FormSection,
  withValidators,
  FormInputField,
  FormAddonSelectField,
  AddonSelect,
  DefaultSelect,
  FormSelectField
} from '../../../../../components/Form';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { DealResource } from '../../../../../models/dealList/dealList';
import { AdexInventoryServiceItemPublicResource, DisplayNetworkServiceItemPublicResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { Loading } from '../../../../../components';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';

const FORM_ID = 'dealForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
  >;

const messages = defineMessages({
  addDealDescriptor: {
    id: 'deal.edit.addDeal',
    defaultMessage: 'Add Deal',
  },
  editDeal: {
    id: 'deal.edit.actionbar.editDeal',
    defaultMessage: 'Edit {name}',
  },
  deals: {
    id: 'deal.edit.actionbar.breadCrumb.deals',
    defaultMessage: 'Deals',
  },
  newDealDescriptor: {
    id: 'deal.edit.actionabar.newDeal',
    defaultMessage: 'New Deal',
  },
  generalInfos: {
    id: 'deal.edit.generalSection.title',
    defaultMessage: 'General Informations',
  },
  generalInfosSubtitle: {
    id: 'deal.edit.generalSection.subtitle',
    defaultMessage: 'Enter here your Deal information.',
  },
  valueLabel: {
    id: 'deal.edit.input.value.label',
    defaultMessage: 'Value',
  },
  valuePlaceholder: {
    id: 'deal.edit.input.value.placeholder',
    defaultMessage: 'Deal Value',
  },
  valueTooltip: {
    id: 'deal.edit.input.value.tooltip',
    defaultMessage: 'This represent the value your provider has given to you.',
  },
  adExchangeLabel: {
    id: 'deal.edit.input.adExchange.label',
    defaultMessage: 'Ad Exchange',
  },
  adExchangePlaceholder: {
    id: 'deal.edit.input.adExchange.placeholder',
    defaultMessage: 'Ad Exchange',
  },
  adExchangeTooltip: {
    id: 'deal.edit.input.adExchange.tooltip',
    defaultMessage: 'This represent the ad exchange your deal has been agreed upon.',
  },
  displayNetworkLabel: {
    id: 'deal.edit.input.displayNetwork.label',
    defaultMessage: 'Display Network',
  },
  displayNetworkPlaceholder: {
    id: 'deal.edit.input.displayNetwork.placeholder',
    defaultMessage: 'Display Network',
  },
  displayNetworkTooltip: {
    id: 'deal.edit.input.displayNetwork.tooltip',
    defaultMessage: 'This represent the display network your deal has been agreed upon.',
  },
  floorPriceLabel: {
    id: 'deal.edit.input.floorPrice.label',
    defaultMessage: 'Floor Price',
  },
  floorPricePlaceholder: {
    id: 'deal.edit.input.floorPrice.placeholder',
    defaultMessage: 'Floor Price',
  },
  floorPriceTooltip: {
    id: 'deal.edit.input.floorPrice.tooltip',
    defaultMessage: 'This is the floor price you have agreed with your provided in the currency agreed upon.',
  },
  eur: {
    id: 'deal.edit.eur',
    defaultMessage: 'Euro'
  },
  usd: {
    id: 'deal.edit.usd',
    defaultMessage: 'US Dollars'
  },
  savingInProgress: {
    id: 'deal.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
});


export interface DealFormProps {
  initialValues?: Partial<DealResource>;
  onSave: (formData: Partial<DealResource>) => void;
  actionBarButtonText: string;
  close: () => void;
}

interface State {
  adex: {
    loading: boolean,
    data: AdexInventoryServiceItemPublicResource[]
  },
  displayNetwork: {
    loading: boolean,
    data: DisplayNetworkServiceItemPublicResource[]
  }
}

type JoinedProps = DealFormProps &
  InjectedDrawerProps &
  InjectedFormProps<DealDescriptorResource, DealFormProps> &
  InjectedIntlProps &
  ValidatorProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; dealListId: string }>;

class DealForm extends React.Component<JoinedProps, State> {

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      adex: {
        loading: true,
        data: []
      },
      displayNetwork: {
        loading: true,
        data: []
      }
    }
  }


  componentDidMount() {
    const {
      match: {
        params: {
          organisationId
        }
      }
    } = this.props;
    this.fetchAdexchanges(organisationId);
    // this.fetchDisplayNetworks(organisationId)
  }


  fetchAdexchanges = (organisationId: string) => {
    return this._catalogService.getServices(organisationId, {
      serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS']
    })
    .then(res => res.data)
    .then(res => this.setState({
      adex: {
        loading: false,
        data: res.filter(r => r.type === 'inventory_access_ad_exchange') as AdexInventoryServiceItemPublicResource[],
      },
      displayNetwork: {
        loading: false,
        data: res.filter(r => r.type === 'inventory_access_display_network') as DisplayNetworkServiceItemPublicResource[],
      }
    }))
  }

  render() {
    const {
      intl,
      initialValues,
      handleSubmit,
      onSave,
      fieldValidators: { isRequired },
    } = this.props;

    if (this.state.adex.loading || this.state.displayNetwork.loading)
      return <Loading className="loading-full-screen" />

    const dealName =
      initialValues && initialValues.id
        ? intl.formatMessage(messages.editDeal, {
          name: this.props.initialValues!.value
            ? this.props.initialValues!.value
            : this.props.initialValues!.id,
        })
        : intl.formatMessage(messages.newDealDescriptor);

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [
        {
          name: dealName,
        },
      ],
      message: messages.addDealDescriptor,
      onClose: this.props.closeNextDrawer,
    };
    const sideBarProps: SidebarWrapperProps = {
      items: [
        {
          sectionId: 'general',
          title: messages.generalInfos,
        },
      ],
      scrollId: FORM_ID,
    };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(onSave)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div id="general">
                <FormSection
                  subtitle={messages.generalInfosSubtitle}
                  title={messages.generalInfos}
                />

                <div>
                  <FormInputField
                    name="value"
                    component={FormInput}
                    validate={[isRequired]}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.valueLabel,
                      ),
                      required: true,
                    }}
                    inputProps={{
                      placeholder: intl.formatMessage(messages.valuePlaceholder)
                    }}
                    helpToolTipProps={{
                      title: intl.formatMessage(messages.valueTooltip)
                    }}
                  />

                </div>

                <div>
                  <FormSelectField
                    name="ad_exchange_id"
                    component={DefaultSelect}
                    validate={[isRequired]}
                    options={this.state.adex.data.map(d => ({ value: d.ad_exchange_id, title: d.name, }))}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.adExchangeLabel,
                      ),
                      required: true,
                    }}
                    helpToolTipProps={{
                      title: intl.formatMessage(messages.adExchangeTooltip)
                    }}
                  />
                </div>
                <div>
                  <FormSelectField
                    name="display_network_id"
                    component={DefaultSelect}
                    validate={[isRequired]}
                    options={this.state.displayNetwork.data.map(d => ({ value: d.display_network_id, title: d.name }))}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.displayNetworkLabel,
                      ),
                      required: true,
                    }}
                    helpToolTipProps={{
                      title: intl.formatMessage(messages.displayNetworkTooltip)
                    }}
                  />
                </div>

                <div>

                  <FormInputField
                    name="floor_price"
                    component={FormInput}
                    validate={[isRequired]}
                    formItemProps={{
                      label: intl.formatMessage(
                        messages.floorPriceLabel,
                      ),
                    }}
                    inputProps={{
                      addonAfter: (
                        <FormAddonSelectField
                          name="currency"
                          component={AddonSelect}
                          options={[
                            {
                              value: 'EUR',
                              title: intl.formatMessage(
                                messages.eur,
                              ),
                            },
                            {
                              value: 'USD',
                              title: intl.formatMessage(
                                messages.usd,
                              ),
                            },
                          ]}
                        />
                      ),
                      placeholder: intl.formatMessage(
                        messages.floorPricePlaceholder,
                      ),
                      style: { width: '100%' },
                    }}
                    helpToolTipProps={{
                      title: intl.formatMessage(
                        messages.floorPriceTooltip,
                      ),
                    }}
                  />

                </div>

              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, DealFormProps>(
  injectIntl,
  injectDrawer,
  withValidators,
  withRouter,
  injectNotifications,
  reduxForm<DealDescriptorResource, DealFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DealForm);
