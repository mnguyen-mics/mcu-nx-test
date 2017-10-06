import { connect } from 'react-redux';

export interface TranslationProps {
  translations: {[key: string]: string};
}

const withTranslations = (WrappedComponent) => {

  const mapStateToProps = (state) => ({
    translations: state.translations,
  });

  return connect(
    mapStateToProps,
  )(WrappedComponent);
};

export default withTranslations;
