import { DisplayAdResource } from './../../../../../../../models/creative/CreativeResource';
import { Omit } from './../../../../../../../utils/Types';

export interface AdFieldModel {
  id: string;
  resource: DisplayAdResource | Omit<DisplayAdResource, 'id'>;
  deleted: boolean;
}
