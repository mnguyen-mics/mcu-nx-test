import { connect } from 'react-redux';

export interface InjectedThemeColorsProps {
  colors: {
    'mcs-error': string;
    'mcs-highlight': string;
    'mcs-info': string;
    'mcs-normal': string;
    'mcs-primary': string;
    'mcs-success': string;
    'mcs-warning': string;
  };
}

const mapStateToProps = (state: any) => ({
  colors: state.theme.colors,
});

export default connect(mapStateToProps, undefined);
