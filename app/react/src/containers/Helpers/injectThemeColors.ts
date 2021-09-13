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
  'mcs-chart-1': string;
  'mcs-chart-2': string;
  'mcs-chart-3': string;
  'mcs-chart-4': string;
  'mcs-chart-5': string;
  'mcs-chart-6': string;
  'mcs-chart-7': string;
}

const mapStateToProps = (state: MicsReduxState) => ({
  colors: state.theme.colors,
});

export default connect(mapStateToProps, undefined);
