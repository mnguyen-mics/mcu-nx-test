import * as React from 'react';
import { Card } from '../../../../components/Card';
import { ButtonStyleless } from '../../../../components';
import { LayoutablePlugin } from '../../../../models/Plugins';


export interface PluginCardProps<T> {
  plugin: T;
  organisationId: string;
  onSelect: () => void;
  hoverable?: boolean
}

interface State {
}

export default class PluginCard<T extends LayoutablePlugin> extends React.Component<PluginCardProps<T>, State> {

  public render() {

    const { plugin, hoverable } = this.props;

    const onSelect = () => {
      this.props.onSelect()
    }


    return !!plugin.plugin_layout && (
      <div onClick={hoverable ? onSelect : undefined} className={'plugin-card'}>
        <Card className={`plugin-card ${plugin.id} ${hoverable ? 'hoverable' : ''}`} onClick={hoverable ? onSelect : undefined} type="flex">
          <div className="image-placehodlder">
            <img src={plugin.layout_icon_path} />
          </div>
          <div className="plugin-title">
            {plugin.plugin_layout.metadata.display_name}
          </div>
          <div className="plugin-description">
            {(plugin.plugin_layout.metadata.description && plugin.plugin_layout.metadata.description.length > 65) ? `${plugin.plugin_layout.metadata.description.substring(0, 65)}...` : plugin.plugin_layout.metadata.description}
          </div>
          <div className="select-button">
            <ButtonStyleless className="button" onClick={onSelect}>Select</ButtonStyleless>
          </div>
        </Card>
      </div>
    );
  }
}
