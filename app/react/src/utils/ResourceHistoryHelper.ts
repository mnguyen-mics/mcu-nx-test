import lodash from 'lodash';
import {
  isHistoryLinkEvent,
  ResourceType,
} from '../models/resourceHistory/ResourceHistory';
import ResourceHistoryService from '../services/ResourceHistoryService';

export function getLinkedResourceIdInSelection(
  organisationId: string,
  selectionType: ResourceType,
  selectionId: string,
  linkedResourceType: ResourceType,
) {
  const params = {
    resource_type: selectionType,
    resource_id: selectionId,
    max_results: 10,
  }; // Let's keep 10 for now, selections shouldn't have many events anyway.

  return ResourceHistoryService.getResourceHistory(organisationId, params).then(
    response => {
      const ids = lodash
        .flatMap(response.data, rhr => {
          return rhr.events.map(event =>
            isHistoryLinkEvent(event) &&
            event.resource_type === linkedResourceType
              ? event.resource_id
              : '',
          );
        })
        .filter(id => id !== '');
      return ids.length > 0 ? ids[0] : '';
    },
  );
}
