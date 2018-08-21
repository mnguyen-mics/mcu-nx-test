import * as React from 'react';
import ActionBar from '../../../components/ActionBar';
import { McsIcon } from '../../../components';
import { FieldToMessageFormatMap } from './domain';

export interface ResourceTimelineActionBarProps {
  handleClose: () => void;
  messagesProps: FieldToMessageFormatMap;
}

export default class ResourceTimelineActionBar extends React.Component<ResourceTimelineActionBarProps, any> {
  render() {
    const {
      handleClose,
      messagesProps,
    } = this.props;

    return (
      <ActionBar edition={true} paths={[{name: {...messagesProps.historyTitle.message}},]}>
          <McsIcon
            type="close"
            className="close-icon"
            onClick={handleClose}
          />
        </ActionBar>
    );
  }
}
