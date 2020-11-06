import { OfferFormData, INITIAL_SERVICE_OFFER_FORM_DATA } from './domain';
import { ICatalogService } from '../../../services/CatalogService';
import { createFieldArrayModelWithMeta } from '../../../utils/FormHelper';
import {
  Task,
  executeTasksInSequence,
} from '../../../utils/PromiseHelper';
import messages from '../messages';
import { TYPES } from '../../../constants/types';
import { injectable, inject } from 'inversify';

export interface IServiceOfferPageService {
  createOrUpdateServiceOffer: (
    organisationId: string,
    offerFormData: OfferFormData,
    initialOfferFormData: OfferFormData,
  ) => Promise<string>;

  loadOffer: (
    organisationId: string,
    offerId: string,
  ) => Promise<OfferFormData>;

  fetchServiceConditionFields: (offerId: string) => Promise<any>;

  transformServiceType: (type: string | undefined, formatMessage: any) => any;
}

@injectable()
export class ServiceOfferPageService implements IServiceOfferPageService {
    
  @inject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  createOrUpdateServiceOffer(
    organisationId: string,
    offerFormData: OfferFormData,
    initialOfferFormData: OfferFormData = INITIAL_SERVICE_OFFER_FORM_DATA,
  ): Promise<string> {
    const serviceItemConditionToBeCreated: any = {
      type: 'provided_service_item_conditions',
    };

    const offerData = {
      credited_account_id: organisationId,
      ...offerFormData.offer,
    };

    const serviceOffer =
      offerFormData.offer.id === undefined
        ? this._catalogService.createServiceOffer(organisationId, offerData)
        : this._catalogService.getMyOffer(
            organisationId,
            offerFormData.offer.id,
          );

    return serviceOffer.then(offer => {
      const returnedOfferId = offer.data.id;

      return this._catalogService
        .getOfferConditions(returnedOfferId)
        .then(previousConditions => {
          const previousServiceItemIds = previousConditions.data.map(condition => condition.service_item_id);
          const nextServiceItemIds = offerFormData.serviceConditionFields.map(conditionField => conditionField.model.service_item_id);

          const idsForConditionCreation = nextServiceItemIds.filter(
            id => !previousServiceItemIds.includes(id),
          );
          const idsForConditionDeletion = previousServiceItemIds.filter(
            id => !nextServiceItemIds.includes(id),
          );

          const tasks: Task[] = [];

          idsForConditionCreation.forEach(id => {
            tasks.push(() => {
              return this._catalogService
                .createServiceItemCondition(id, serviceItemConditionToBeCreated)
                .then(createdServiceItemCondition => {
                  return this._catalogService.addConditionToOffer(
                    returnedOfferId,
                    createdServiceItemCondition.data.id,
                  );
                });
            });
          });

          idsForConditionDeletion.forEach(id => {
            tasks.push(() => {
              const elementForConditionId = initialOfferFormData.serviceConditionFields.find(
                conditionField => conditionField.model.service_item_id === id,
              );
              if (elementForConditionId !== undefined) {
                const conditionId = elementForConditionId.model.id;
                return this._catalogService
                  .removeConditionFromOffer(returnedOfferId, conditionId)
                  .then(res => {
                    return this._catalogService.deleteServiceItemCondition(
                      id,
                      conditionId,
                    );
                  });
              } else return Promise.resolve();
            });
          });

          return executeTasksInSequence(tasks).then(() => returnedOfferId);
        });
    });
  }

  loadOffer(organisationId: string, offerId: string): Promise<OfferFormData> {
    return this._catalogService
      .getMyOffer(organisationId, offerId)
      .then(offer => {
        const serviceItemConditions = !offer.data.automatic_on
          ? this.fetchServiceConditionFields(offerId)
          : Promise.resolve([]);

        return serviceItemConditions.then(conditions => {
          return {
            offer: offer.data,
            serviceConditionFields: conditions,
          };
        });
      });
  }

  fetchServiceConditionFields(offerId: string) {
    return this._catalogService.getOfferConditions(offerId).then(conditions => {
      return Promise.all(
        conditions.data.map(serviceItemCondition => {
          return this._catalogService
            .findServiceItem(serviceItemCondition.service_item_id)
            .then(serviceItem => ({
              serviceItem: serviceItem.data,
              serviceItemCondition,
            }));
        }),
      ).then(itemWithConditions => {
        return itemWithConditions.map(el => {
          return createFieldArrayModelWithMeta(el.serviceItemCondition, {
            name: el.serviceItem.name,
            type: el.serviceItem.type,
          });
        });
      });
    });
  }

  transformServiceType(type: string | undefined, formatMessage: any) {
    if (type === 'audience_segment') {
      return formatMessage(messages.audience_segmentType);
    } else if (type === 'inventory_access_deal_list') {
      return formatMessage(messages.inventory_access_deal_listType);
    } else if (type === 'user_account_compartment') {
      return formatMessage(messages.user_account_compartmentType);
    } else return type;
  }
}
