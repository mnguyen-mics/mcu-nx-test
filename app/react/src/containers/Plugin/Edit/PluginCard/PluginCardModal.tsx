import * as React from 'react';
import { StandardModal } from '@mediarithmics-private/mcs-components-library';
import PluginCardModalContent, { PluginCardModalContentProps } from './PluginCardModalContent';
import { LayoutablePlugin } from '../../../../models/Plugins';

export interface PluginCardModalProps<T> extends PluginCardModalContentProps<T> {
  opened: boolean;
}

export default class PluginCardModal<T extends LayoutablePlugin> extends React.Component<
  PluginCardModalProps<T>,
  any
> {
  public render() {
    const { opened, onClose, organisationId, ...rest } = this.props;

    return (
      <StandardModal opened={this.props.opened} onClose={this.props.onClose}>
        <PluginCardModalContent
          organisationId={this.props.organisationId}
          onClose={this.props.onClose}
          {...rest}
        />
      </StandardModal>
    );
  }
}
