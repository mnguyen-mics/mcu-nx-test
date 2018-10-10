import { OfferFormData, INITIAL_SERVICE_OFFER_FORM_DATA } from "./domain";
import CatalogService from "../../../services/CatalogService";
import { createFieldArrayModelWithMeta, Task, executeTasksInSequence } from "../../../utils/FormHelper";
import messages from "../messages";

const ServiceOfferPageService = {

  createOrUpdateServiceOffer(
    organisationId: string,
    offerFormData: OfferFormData,
    initialOfferFormData: OfferFormData = INITIAL_SERVICE_OFFER_FORM_DATA): Promise<string> {

    const serviceItemConditionToBeCreated: any = {
      type: "provided_service_item_conditions"
    };

    const offerData = {
      credited_account_id: organisationId,
      ...offerFormData.offer,
    };

    const serviceOffer = (offerFormData.offer.id === undefined) ?
      CatalogService.createServiceOffer(
        organisationId,
        offerData,
      ) :
      CatalogService.getMyOffer(
        organisationId,
        offerFormData.offer.id
      );

    return serviceOffer.then(offer => {
      const returnedOfferId = offer.data.id;

      return CatalogService.getOfferConditions(returnedOfferId)
        .then(previousConditions => {
          const previousServiceItemIds = previousConditions.data.map(condition => condition.service_item_id);
          const nextServiceItemIds = offerFormData.serviceConditionFields.map(conditionField => conditionField.model.service_item_id);

          const idsForConditionCreation = nextServiceItemIds.filter(id => !previousServiceItemIds.includes(id));
          const idsForConditionDeletion = previousServiceItemIds.filter(id => !nextServiceItemIds.includes(id));

          const tasks: Task[] = [];

          idsForConditionCreation.forEach(id => {
            tasks.push(() => {
              return CatalogService.createServiceItemCondition(
                id,
                serviceItemConditionToBeCreated
              ).then(createdServiceItemCondition => {
                return CatalogService.addConditionToOffer(
                  returnedOfferId,
                  createdServiceItemCondition.data.id
                );
              });
            });
          });

          idsForConditionDeletion.forEach(id => {
            tasks.push(() => {
              const conditionId = initialOfferFormData.serviceConditionFields
                .filter(conditionField => conditionField.model.service_item_id === id)[0]
                .model.id;
              return CatalogService.removeConditionFromOffer(
                returnedOfferId,
                conditionId
              ).then(res => {
                return CatalogService.deleteServiceItemCondition(
                  id,
                  conditionId
                );
              });
            });
          });

          return executeTasksInSequence(tasks)
            .then(() => returnedOfferId);
        });
    });
  },

  loadOffer(organisationId: string, offerId: string): Promise<OfferFormData> {
    return CatalogService.getMyOffer(
      organisationId,
      offerId,
    ).then(offer => {
      const serviceItemConditions = !offer.data.automatic_on ?
        ServiceOfferPageService.fetchServiceConditionFields(offerId) :
        Promise.resolve([]);

      return serviceItemConditions.then(conditions => {
        return {
          offer: offer.data,
          serviceConditionFields: conditions,
        };
      });
    });
  },

  fetchServiceConditionFields(offerId: string) {
    return CatalogService.getOfferConditions(offerId)
      .then(conditions => {
        return Promise.all(conditions.data.map(serviceItemCondition => {
          return CatalogService.findServiceItem(serviceItemCondition.service_item_id)
            .then(serviceItem => ({ serviceItem: serviceItem.data, serviceItemCondition }));
        }))
          .then((itemWithConditions) => {
            return itemWithConditions.map(el => {
              return createFieldArrayModelWithMeta(el.serviceItemCondition, { name: el.serviceItem.name, type: el.serviceItem.type });
            })
          }
          );
      })
  },

  transformServiceType(type: string | undefined, formatMessage: any) {
    if (type === "audience_segment") {
      return formatMessage(messages.audience_segmentType);
    }
    else if (type === "inventory_access_display_network") {
      return formatMessage(messages.inventory_access_display_networkType);
    }
    else if (type === "inventory_access_placement_list") {
      return formatMessage(messages.inventory_access_placement_listType);
    }
    else if (type === "inventory_access_deal_list") {
      return formatMessage(messages.inventory_access_deal_listType);
    }
    else if (type === "inventory_access_ad_exchange") {
      return formatMessage(messages.inventory_access_ad_exchangeType);
    }
    else return type;

  },
};

export default ServiceOfferPageService;