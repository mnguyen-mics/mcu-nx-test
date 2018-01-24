import { DrawableContentOptions, DrawableContent } from './index';

import lodash from 'lodash';

export interface DrawerStore {
  drawableContents: DrawableContent[];
}

const OPEN_NEXT_DRAWER = 'OPEN_NEXT_DRAWER';
const CLOSE_NEXT_DRAWER = 'CLOSE_NEXT_DRAWER';
const DRAWER_ESCAPE_KEY_DOWN = 'DRAWER_ESCAPE_KEY_DOWN';
const DRAWER_CLICK_ON_BACKGROUND = 'DRAWER_CLICK_ON_BACKGROUND';

export const openNextDrawer = <T>(
  component: React.ComponentClass<T>,
  options: DrawableContentOptions<T>,
) => {
  return {
    type: OPEN_NEXT_DRAWER,
    payload: {
      component,
      options,
    },
  };
};

export const closeNextDrawer = () => {
  return {
    type: CLOSE_NEXT_DRAWER,
  };
};

export const closeDrawerClickOnBackground = () => {
  return {
    type: DRAWER_CLICK_ON_BACKGROUND,
  };
};

export const closeDrawerEscapeKeyDown = () => {
  return {
    type: DRAWER_ESCAPE_KEY_DOWN,
  };
};

const drawableContents = (state: DrawableContent[] = [], action: any) => {
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
