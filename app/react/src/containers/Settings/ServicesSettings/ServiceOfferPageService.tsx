import { OfferFormData, INITIAL_SERVICE_OFFER_FORM_DATA } from "./domain";
import CatalogService from "../../../services/CatalogService";
import { createFieldArrayModelWithMeta } from "../../../utils/FormHelper";

const ServiceOfferPageService = {

  createOrUpdateServiceOffer(
    organisationId: string,
    offerFormData: OfferFormData,
    initialOfferFormData: OfferFormData = INITIAL_SERVICE_OFFER_FORM_DATA): Promise<string> {

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
        offerFormData.offer.id,
      );

    return serviceOffer.then(offer => {
      const returnedOfferId = offer.data.id;

      return offerFormData.serviceConditionFields.reduce((promise, serviceConditionModel) => {
        return promise.then(() => {
          const serviceItemId = serviceConditionModel.model.service_item_id;

          const serviceItemConditionsToBeCreated: any = {
            type: "provided_service_item_conditions"
          };
          return CatalogService.createServiceItemCondition(
            serviceItemId,
            serviceItemConditionsToBeCreated
          ).then(createdServiceItemCondition => {
            return CatalogService.addConditionToOffer(
              returnedOfferId,
              createdServiceItemCondition.data.id
            );
          }).then(() => undefined);
        });
      }, Promise.resolve())
        .then(() => returnedOfferId);
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
              return createFieldArrayModelWithMeta(el.serviceItemCondition, { name: el.serviceItem.name });
            })
          }
          );
      })
  }
};

export default ServiceOfferPageService;