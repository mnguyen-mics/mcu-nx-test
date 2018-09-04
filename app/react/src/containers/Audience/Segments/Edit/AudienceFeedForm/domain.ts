import { PluginProperty } from "../../../../../models/Plugins";
import { AudienceExternalFeedResource, AudienceTagFeedResource } from "../domain";


export type PluginAudienceFeedInterface = AudienceExternalFeedResource | AudienceTagFeedResource;

export interface AudienceFeedFormModel {
  plugin: PluginAudienceFeedInterface;
  properties?: PluginProperty[];
}

export type FeedType = 'tag' | 'external'

export interface FeedRouteParams { organisationId: string, segmentId: string, feedId: string, feedType: FeedType }