import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';

export function isStandardSegmentBuilderQueryDocument(
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
): source is StandardSegmentBuilderQueryDocument {
  return (
    source !== undefined &&
    (source as StandardSegmentBuilderQueryDocument).language_version !== undefined
  );
}
