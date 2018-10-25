import * as React from 'react';
import StandardModal from '../../../../components/BlurredModal/StandardModal';
import PluginCardModalContent from './PluginCardModalContent';
import { LayoutablePlugin } from '../../../../models/Plugins';
import { PropertyResourceShape } from '../../../../models/plugin';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';

export interface PluginCardModalProps<T> {
  opened: boolean;
  organisationId: string;
  onClose: () => any;
  plugin: T;
  save: (pluginValue: any, propertiesValue: PropertyResourceShape[]) => void;
  pluginProperties: PropertyResourceShape[];
  disableFields: boolean;
  pluginLayout: PluginLayout;
  isLoading: boolean;
  pluginVersionId: string;
  initialValues?: any;
  editionMode: boolean;
}

export default class PluginCardModal<T extends LayoutablePlugin> extends React.Component<PluginCardModalProps<T>, any> {
  public render() {

    const {
      opened,
      onClose,
      organisationId,
      ...rest
    } = this.props;

    return (
      <StandardModal opened={this.props.opened} onClose={this.props.onClose}>
        <PluginCardModalContent organisationId={this.props.organisationId} onClose={this.props.onClose} {...rest} />
      </StandardModal>
    );
  }
}
