import { connect } from 'react-redux';

export interface TranslationProps {
  translations: {[key: string]: string};
}

const withTranslations = (WrappedComponent: any) => {

  const mapStateToProps = (state: any) => ({
    translations: state.translations,
  });

  return connect(
    mapStateToProps,
  )(WrappedComponent);
};

export default withTranslations;
