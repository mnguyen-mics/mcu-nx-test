import { connect } from 'react-redux';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface InjectedThemeColorsProps {
  colors: ThemeColorsShape;
}

export interface ThemeColorsShape {
  'mcs-error': string;
  'mcs-highlight': string;
  'mcs-info': string;
  'mcs-normal': string;
  'mcs-primary': string;
  'mcs-success': string;
  'mcs-warning': string;
}

const mapStateToProps = (state: MicsReduxState) => ({
  colors: state.theme.colors,
});

export default connect(mapStateToProps, undefined);
