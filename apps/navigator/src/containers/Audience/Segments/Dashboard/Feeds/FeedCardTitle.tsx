import { PluginLayout } from '@mediarithmics-private/advanced-components';
import * as React from 'react';
import { compose } from 'recompose';
import { AudienceFeedTyped } from '../../Edit/domain';

export interface FeedCardTitleProps {
  feed: AudienceFeedTyped;
  pluginLayout?: PluginLayout;
}

type Props = FeedCardTitleProps;

class FeedCardTitle extends React.Component<Props> {
  render() {
    const { feed, pluginLayout } = this.props;

    return (
      <div className='mcs-feedCardTitle'>
        {feed.name && <div className='mcs-feedCardTitle_title'>{feed.name}</div>}
        <div className='mcs-feedCardTitle_subtitle'>
          {pluginLayout?.metadata.display_name || feed.artifact_id}
        </div>
      </div>
    );
  }
}

export default compose<Props, FeedCardTitleProps>()(FeedCardTitle);
