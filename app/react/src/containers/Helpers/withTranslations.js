import { connect } from 'react-redux';

const withTranslations = (WrappedComponent) => {

  const mapStateToProps = (state) => ({
    translations: state.translations
  });

  return connect(
    mapStateToProps
  )(WrappedComponent);
};

export default withTranslations;
