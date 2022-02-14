import cuid from 'cuid';
import { UrlResource } from './ContextualTargetingTab';

const numberOfDatamartUserPoints = 10000;
const numberOfDatamartEvents = numberOfDatamartUserPoints * (Math.floor(Math.random() * 999) + 1);

export const fetchUrls = () => {
  return new Promise(resolve => {
    const urls: UrlResource[] = [];
    for (let index = 0; index < 50000; index++) {
      const numberOfSegmentUserPoints = Math.floor(Math.random() * 999) + 1;
      const numberOfSegmentEvents =
        numberOfDatamartUserPoints * (Math.floor(Math.random() * 99) + 1);
      const lift =
        numberOfSegmentEvents /
        ((numberOfDatamartEvents * numberOfSegmentUserPoints) / numberOfDatamartUserPoints);
      urls.push({
        id: index.toString(),
        url: `www.${cuid()}.com`,
        number_of_events: numberOfSegmentEvents,
        lift: lift,
        number_of_user_points: numberOfSegmentUserPoints,
      });
    }
    return resolve(
      urls.sort((a: UrlResource, b: UrlResource) => {
        return b.lift - a.lift;
      }),
    );
  });
};
