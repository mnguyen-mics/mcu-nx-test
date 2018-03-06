import { connect } from 'react-redux';

export interface InjectedColorsProps {
  colors: any;
}

const mapStateToProps = (state: any) => ({
  colors: state.theme.colors,
});

export default connect(mapStateToProps, undefined);
