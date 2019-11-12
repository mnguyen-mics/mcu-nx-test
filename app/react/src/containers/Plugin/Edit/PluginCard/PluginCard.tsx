import * as React from 'react';
import { Card } from '../../../../components/Card';
import { ButtonStyleless } from '../../../../components';
import { LayoutablePlugin } from '../../../../models/Plugins';

export interface PluginCardProps<T> {
  plugin: T;
  organisationId: string;
  onSelect: () => void;
  hoverable?: boolean;
}

interface State {}

export default class PluginCard<
  T extends LayoutablePlugin
> extends React.Component<PluginCardProps<T>, State> {
  public render() {
    const { plugin, hoverable } = this.props;

    const onSelect = () => {
      this.props.onSelect();
    };

    return (
      !!plugin.plugin_layout && (
        <div
          onClick={hoverable ? onSelect : undefined}
          className={'plugin-card'}
        >
          <Card
            className={`plugin-card ${plugin.id} ${
              hoverable ? 'hoverable' : ''
            }`}
            onClick={hoverable ? onSelect : undefined}
            type="flex"
          >
            <div className="image-placehodlder">
              <img
                src={
                  plugin.plugin_layout !== undefined
                    ? (window as any).MCS_CONSTANTS.ASSETS_URL +
                      plugin.plugin_layout.metadata.small_icon_asset_url
                    : undefined
                }
              />
            </div>
            <div className="plugin-title">
              {plugin.plugin_preset
                ? plugin.plugin_preset.name
                : plugin.plugin_layout.metadata.display_name}
            </div>
            <div className="plugin-description">
              {plugin.plugin_preset && plugin.plugin_preset.description
                ? this.truncateDescription(plugin.plugin_preset.description)
                : this.truncateDescription(plugin.plugin_layout.metadata.description)}
            </div>
            <div className="select-button">
              <ButtonStyleless className="button" onClick={onSelect}>
                Select
              </ButtonStyleless>
            </div>
          </Card>
        </div>
      )
    );
  }

  truncateDescription = (description: string) => {
    return description &&
      description.length > 65
      ? `${description.substring(0, 65)}...`
      : description;
  };
}
