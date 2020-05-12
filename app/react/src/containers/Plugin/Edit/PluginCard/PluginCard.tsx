import * as React from 'react';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { ButtonStyleless, McsIcon } from '../../../../components';
import { LayoutablePlugin } from '../../../../models/Plugins';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../Datamart';
import { compose } from 'recompose';

export interface PluginCardProps<T> {
  plugin: T;
  onSelect: () => void;
  onPresetDelete?: () => void;
  hoverable?: boolean;
}

export type Props<T> = PluginCardProps<T> & InjectedWorkspaceProps;

interface State {}

class PluginCard<T extends LayoutablePlugin> extends React.Component<
  Props<T>,
  State
> {
  onClick = (e: React.MouseEvent) => {
    const { onPresetDelete } = this.props;
    e.stopPropagation();
    if (onPresetDelete) onPresetDelete();
  };

  hasRightToDeletePreset(): boolean {
    const {
      workspace: { role },
    } = this.props;

    if (
      role === 'ORGANISATION_ADMIN' ||
      role === 'COMMUNITY_ADMIN' ||
      role === 'CUSTOMER_ADMIN'
    )
      return true;

    return false;
  }

  public render() {
    const { plugin, hoverable, onPresetDelete } = this.props;

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
              {plugin.plugin_preset &&
                this.hasRightToDeletePreset() &&
                onPresetDelete && (
                  <div className="delete-preset" onClick={this.onClick}>
                    <McsIcon style={{ marginRight: 0 }} type={'close'} />
                  </div>
              )}
            </div>
            <div className="plugin-title">
              {plugin.plugin_preset
                ? plugin.plugin_preset.name
                : plugin.plugin_layout.metadata.display_name}
            </div>
            <div className="plugin-description">
              {plugin.plugin_preset && plugin.plugin_preset.description
                ? this.truncateDescription(plugin.plugin_preset.description)
                : this.truncateDescription(
                    plugin.plugin_layout.metadata.description,
                  )}
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
    return description && description.length > 65
      ? `${description.substring(0, 65)}...`
      : description;
  };
}

export default compose<Props<any>, PluginCardProps<any>>(injectWorkspace)(PluginCard);
