import * as React from 'react';
import { openNextDrawer, closeNextDrawer } from './DrawerStore';
import injectDrawer from './injectDrawer';

export type DrawerSize = 'large' | 'small';

export interface DrawableContentOptions<T = {}> {
  additionalProps: T;
  size?: DrawerSize;
  isModal?: boolean;
}

export interface DrawableContent extends DrawableContentOptions {
  component: React.ComponentClass;
}

export { openNextDrawer, closeNextDrawer, injectDrawer };
