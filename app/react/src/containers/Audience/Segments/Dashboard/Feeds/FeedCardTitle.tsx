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

    const thumbnail = pluginLayout?.metadata.small_icon_asset_url;
    return (
      <div className='mcs-feed-card-titleAndIcon'>
        {thumbnail ? (
          <img
            className='mcs-feedCard_icon'
            src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${thumbnail}`}
          />
        ) : null}
        <div className='mcs-feedCard_title'>
          {feed.name && <div className='mcs-feed-name'>{feed.name}</div>}
          <div className='mcs-plugin-name'>
            {pluginLayout?.metadata.display_name || feed.artifact_id}
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, FeedCardTitleProps>()(FeedCardTitle);
