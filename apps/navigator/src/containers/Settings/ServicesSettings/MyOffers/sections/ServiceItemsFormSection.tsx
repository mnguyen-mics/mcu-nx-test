import * as React from 'react';
import cuid from 'cuid';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { RecordElement, RelatedRecords } from '../../../../../components/RelatedRecord';
import { FormSection } from '../../../../../components/Form';
import { WrappedFieldArrayProps } from 'redux-form';
import messages from './messages';
import ServiceItemSelector, { ServiceItemSelectorProps } from './ServiceItemSelector';
import { ServiceConditionsModel } from '../../domain';
import { ServiceItemShape } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { IServiceOfferPageService } from '../../ServiceOfferPageService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../../components/Drawer';

export interface ServiceItemsFormSectionProps extends ReduxFormChangeProps {}

type Props = WrappedComponentProps &
  WrappedFieldArrayProps<ServiceConditionsModel> &
  ServiceItemsFormSectionProps &
  InjectedDrawerProps;

class ServiceItemsFormSection extends React.Component<Props> {
  @lazyInject(TYPES.IServiceOfferPageService)
  private _serviceOfferPageService: IServiceOfferPageService;

  updateServiceConditions = (serviceItems: ServiceItemShape[]) => {
    const { fields, formChange } = this.props;

    const serviceItemIds = serviceItems.map(serviceItem => serviceItem.id);

    const fieldServiceItemIds = fields.getAll().map(field => field.model.service_item_id);

    const keptServiceConditions = fields
      .getAll()
      .filter(field => serviceItemIds.includes(field.model.service_item_id));
    const addedServiceConditions = serviceItems
      .filter(serviceItem => !fieldServiceItemIds.includes(serviceItem.id))
      .map(serviceItem => ({
        key: cuid(),
        model: { id: '-1', service_item_id: serviceItem.id },
        meta: { name: serviceItem.name, type: serviceItem.type || '' },
      }));

    formChange((fields as any).name, keptServiceConditions.concat(addedServiceConditions));
    this.props.closeNextDrawer();
  };

  openServiceItemsSelector = () => {
    const { fields } = this.props;

    const selectedServiceItemIds = fields.getAll().map(field => field.model.service_item_id);

    const serviceItemSelectorProps = {
      selectedServiceItemIds,
      close: this.props.closeNextDrawer,
      save: this.updateServiceConditions,
    };

    const options = {
      additionalProps: serviceItemSelectorProps,
    };

    this.props.openNextDrawer<ServiceItemSelectorProps>(ServiceItemSelector, options);
  };

  getServiceItemsRecords = () => {
    const {
      fields,
      intl: { formatMessage },
    } = this.props;

    const getServiceItemName = (serviceConditionField: ServiceConditionsModel) =>
      serviceConditionField.meta.name;

    const getServiceItemServiceType = (serviceConditionField: ServiceConditionsModel) =>
      this._serviceOfferPageService.transformServiceType(
        serviceConditionField.meta.type,
        formatMessage,
      );

    return fields.getAll().map((serviceConditionField, index) => {
      const removeRecord = () => fields.remove(index);

      return (
        <RecordElement
          key={index}
          recordIconType={'gears'}
          record={serviceConditionField}
          title={getServiceItemName}
          additionalData={getServiceItemServiceType}
          onRemove={removeRecord}
        />
      );
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.serviceItemsBreadcrumbTitle),
            onClick: this.openServiceItemsSelector,
          }}
          subtitle={messages.serviceItemsSectionSubtitle}
          title={messages.serviceItemsSectionTitle}
        />
        <RelatedRecords
          emptyOption={{
            iconType: 'gears',
            message: formatMessage(messages.contentSectionServiceItemsEmptyTitle),
          }}
        >
          {this.getServiceItemsRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, ServiceItemsFormSectionProps>(
  injectIntl,
  injectDrawer,
)(ServiceItemsFormSection);
