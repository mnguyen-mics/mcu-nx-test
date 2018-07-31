import * as React from 'react';
import ActionBar from '../../../components/ActionBar';
import { McsIcon } from '../../../components';

export interface ResourceTimelineActionBarProps {
  resourceName: string;
  handleClose: () => void;
}

export default class ResourceTimelineActionBar extends React.Component<ResourceTimelineActionBarProps, any> {
  render() {
    const {
      resourceName,
      handleClose,
    } = this.props;

    return (
      <ActionBar edition={true} paths={[{name: `${resourceName} History`},]}>
          <McsIcon
            type="close"
            className="close-icon"
            onClick={handleClose}
          />
        </ActionBar>
    );
  }
}
