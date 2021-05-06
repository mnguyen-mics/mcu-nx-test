import { DrawableContentOptions, DrawableContent } from './index';

import lodash from 'lodash';

export interface DrawerStore {
  drawableContents: DrawableContent[];
}

interface CloseDrawer {
  type: CLOSE_NEXT_DRAWER;
}

interface OpenDrawer<T> {
  type: OPEN_NEXT_DRAWER;
  payload: {
    component: React.ComponentClass<T>;
    options: DrawableContentOptions<T>;
  };
}

interface DrawerClickOnBackground {
  type: DRAWER_CLICK_ON_BACKGROUND;
}

interface DrawerEscapeKeyDown {
  type: DRAWER_ESCAPE_KEY_DOWN;
}

type Action<T> = CloseDrawer | OpenDrawer<T> | DrawerClickOnBackground | DrawerEscapeKeyDown;

const OPEN_NEXT_DRAWER = 'OPEN_NEXT_DRAWER';
type OPEN_NEXT_DRAWER = typeof OPEN_NEXT_DRAWER;
const CLOSE_NEXT_DRAWER = 'CLOSE_NEXT_DRAWER';
type CLOSE_NEXT_DRAWER = typeof CLOSE_NEXT_DRAWER;
const DRAWER_ESCAPE_KEY_DOWN = 'DRAWER_ESCAPE_KEY_DOWN';
type DRAWER_ESCAPE_KEY_DOWN = typeof DRAWER_ESCAPE_KEY_DOWN;
const DRAWER_CLICK_ON_BACKGROUND = 'DRAWER_CLICK_ON_BACKGROUND';
type DRAWER_CLICK_ON_BACKGROUND = typeof DRAWER_CLICK_ON_BACKGROUND;

export const openNextDrawer = <T>(
  component: React.ComponentClass<T>,
  options: DrawableContentOptions<T>,
): OpenDrawer<T> => {
  return {
    type: OPEN_NEXT_DRAWER,
    payload: {
      component,
      options,
    },
  };
};

export const closeNextDrawer = (): CloseDrawer => {
  return {
    type: CLOSE_NEXT_DRAWER,
  };
};

export const closeDrawerClickOnBackground = (): DrawerClickOnBackground => {
  return {
    type: DRAWER_CLICK_ON_BACKGROUND,
  };
};

export const closeDrawerEscapeKeyDown = (): DrawerEscapeKeyDown => {
  return {
    type: DRAWER_ESCAPE_KEY_DOWN,
  };
};

const drawableContents = (state: DrawableContent[] = [], action: Action<any>) => {
  switch (action.type) {
    case OPEN_NEXT_DRAWER:
      const { component, options } = action.payload;
      const extendedOptions = {
        ...DEFAULT_DRAWER_OPTIONS,
        ...options,
      };
      return [...state, { component, ...extendedOptions }];
    case CLOSE_NEXT_DRAWER:
      return [...lodash.initial(state)];
    case DRAWER_CLICK_ON_BACKGROUND || DRAWER_ESCAPE_KEY_DOWN:
      const foregroundDrawer = lodash.last(state);

      if (foregroundDrawer && !foregroundDrawer.isModal) {
        return [...lodash.initial(state)];
      }
      return state;
    default:
      return state;
  }
};

export const drawerReducer = { drawableContents };

const DEFAULT_DRAWER_OPTIONS: DrawableContentOptions = {
  additionalProps: {},
  isModal: false,
  size: 'large',
};
