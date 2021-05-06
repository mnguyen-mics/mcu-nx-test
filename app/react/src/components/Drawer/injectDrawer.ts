import { connect } from 'react-redux';
import { closeNextDrawer, openNextDrawer } from '../../components/Drawer/DrawerStore';
import { DrawableContentOptions } from './index';

export interface InjectedDrawerProps {
  openNextDrawer: <T>(
    component: React.ComponentClass<T>,
    options: DrawableContentOptions<T>,
  ) => void;
  closeNextDrawer: () => void;
}

const mapDispatchToProps = {
  closeNextDrawer,
  openNextDrawer,
};

export default connect(undefined, mapDispatchToProps);
