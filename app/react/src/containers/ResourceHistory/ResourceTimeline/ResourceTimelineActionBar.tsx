import * as React from 'react';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { McsIcon } from '../../../components';
import { FormatProperty } from './domain';
import messages from './messages';

export interface ResourceTimelineActionBarProps {
  handleClose: () => void;
  formatProperty: FormatProperty;
}

export default class ResourceTimelineActionBar extends React.Component<ResourceTimelineActionBarProps> {
  render() {
    const {
      handleClose,
      formatProperty,
    } = this.props;

    return (
      <Actionbar edition={true} paths={[{name: {...formatProperty('history_title').message || messages.defaultTitle}},]}>
          <McsIcon
            type="close"
            className="close-icon"
            onClick={handleClose}
          />
        </Actionbar>
    );
  }
}
