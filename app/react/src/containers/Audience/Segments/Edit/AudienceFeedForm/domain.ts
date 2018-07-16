import { PluginProperty } from "../../../../../models/Plugins";
import { AudienceExternalFeedResource, AudienceTagFeedResource } from "../domain";

export type PluginAudienceFeedInterface = AudienceExternalFeedResource | AudienceTagFeedResource;

export interface AudienceFeedFormModel {
  plugin: PluginAudienceFeedInterface;
  properties?: PluginProperty[];
}