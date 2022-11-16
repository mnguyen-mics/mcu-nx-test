import * as React from 'react';
import { Card, McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface FeedCardPlaceholderProps {}

export default class FeedCardPlaceholder extends React.Component<FeedCardPlaceholderProps> {
  render() {
    return (
      <Card className='mcs-feedCard'>
        <div>
          <div className='mcs-feedCard_header'>
            <div className='mcs-feedCard_icon mcs-feedCard_icon_placeholder' />
            <div className='mcs-feedCard_title'>
              <div className='mcs-feedCardTitle_title mcs-feedCardTitle_title_placeholder' />
              <div className='mcs-feedCardTitle_subtitle mcs-feedCardTitle_subtitle_placeholder' />
            </div>
            <div className='mcs-feedCard_topMenu'>
              <a>
                <McsIcon type='dots' />
              </a>
            </div>
          </div>
          <div className='mcs-feedCard_content'>
            <div className='mcs-feedCard_content_description'>
              <div className='mcs-feedCard_content_status mcs-feedCard_content_status_placeholder' />
              <div className='mcs-feedCard_content_statsAndAction'>
                <div className='mcs-feedCard_content_action mcs-feedCard_content_action_placeholder' />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
}
