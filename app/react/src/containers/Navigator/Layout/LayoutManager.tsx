import * as React from 'react';

import { MainLayout, EditLayout, SettingLayout } from './';

import log from '../../../utils/Logger';

type LayoutType = 'main' | 'settings' | 'edit';

// defaultProps Type Issues workaround using https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11640

interface LayoutManagerProps {
  layout: LayoutType;
  contentComponent?: React.ComponentType;
  editComponent?: React.ComponentType;
  actionBarComponent?: React.ComponentType | null;
  organisationSelector?: React.ComponentType;
  showOrgSelector?: boolean;
  orgSelectorSize?: number;
}

interface LayoutManagerDefaultProps {
  contentComponent: React.ComponentType;
  editComponent: React.ComponentType;
  actionBarComponent: React.ComponentType | null;
  organisationSelector: React.ComponentType;
  showOrgSelector: boolean;
  orgSelectorSize: number;
}

class LayoutManager extends React.Component<LayoutManagerProps & LayoutManagerDefaultProps> {
  public static defaultProps: LayoutManagerDefaultProps = {
    contentComponent: () => <div>no content</div>,
    editComponent: () => <div>no edit</div>,
    organisationSelector: () => <div>no org selector</div>,
    showOrgSelector: false,
    actionBarComponent: null,
    orgSelectorSize: 200,
  };

  render() {
    const {
      layout,
      contentComponent,
      editComponent,
      actionBarComponent,
      organisationSelector,
      showOrgSelector,
      orgSelectorSize,
    } = this.props;

    log.trace(`Render ${layout} layout with component`, contentComponent);

    switch (layout) {
      case 'main':
        return (
          <MainLayout
            contentComponent={contentComponent}
            actionBarComponent={actionBarComponent ? actionBarComponent : null}
            organisationSelector={
              organisationSelector ? organisationSelector : () => <div>no org selector</div>
            }
            showOrgSelector={showOrgSelector ? showOrgSelector : false}
            orgSelectorSize={orgSelectorSize ? orgSelectorSize : 200}
          />
        );
      case 'settings':
        return (
          <SettingLayout
            contentComponent={contentComponent}
            actionBarComponent={actionBarComponent ? actionBarComponent : null}
            organisationSelector={
              organisationSelector ? organisationSelector : () => <div>no org selector</div>
            }
            showOrgSelector={showOrgSelector ? showOrgSelector : false}
            orgSelectorSize={orgSelectorSize ? orgSelectorSize : 200}
          />
        );
      case 'edit':
        return editComponent && <EditLayout editComponent={editComponent} />;

      default: {
        const errMsg = `Unhandled layout ${layout}`;
        log.error(errMsg);
        throw new Error(errMsg);
      }
    }
  }
}

export default LayoutManager as React.ComponentClass<LayoutManagerProps>;
