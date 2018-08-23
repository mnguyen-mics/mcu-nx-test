import * as React from 'react';
import ActionBar from '../../../components/ActionBar';
import { McsIcon } from '../../../components';
import { FormatProperty } from './domain';

export interface ResourceTimelineActionBarProps {
  handleClose: () => void;
  formatProperty: FormatProperty;
}

export default class ResourceTimelineActionBar extends React.Component<ResourceTimelineActionBarProps, any> {
  render() {
    const {
      handleClose,
      formatProperty,
    } = this.props;

    return (
      <ActionBar edition={true} paths={[{name: {...formatProperty('history_title').message}},]}>
          <McsIcon
            type="close"
            className="close-icon"
            onClick={handleClose}
          />
        </ActionBar>
    );
  }
}
