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
}

interface LayoutManagerDefaultProps {
  contentComponent: React.ComponentType;
  editComponent: React.ComponentType;
  actionBarComponent: React.ComponentType | null;
}

class LayoutManager extends React.Component<LayoutManagerProps & LayoutManagerDefaultProps> {
  public static defaultProps: LayoutManagerDefaultProps = {
    contentComponent: () => <div>no content</div>,
    editComponent: () => <div>no edit</div>,
    actionBarComponent: null,
  };

  render() {
    const { layout, contentComponent, editComponent, actionBarComponent } = this.props;

    log.trace(`Render ${layout} layout with component`, contentComponent);

    switch (layout) {
      case 'main':
        return (
          <MainLayout
            contentComponent={contentComponent}
            actionBarComponent={actionBarComponent ? actionBarComponent : null}
          />
        );
      case 'settings':
        return (
          <SettingLayout
            contentComponent={contentComponent}
            actionBarComponent={actionBarComponent ? actionBarComponent : null}
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
