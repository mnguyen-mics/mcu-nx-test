import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Redirect } from 'react-router';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { parseSearch } from '../../utils/LocationSearchHelper';
import log from '../../utils/Logger';

export interface FeatureFlagPageProps { }

type Props = FeatureFlagPageProps & RouteComponentProps<{ organisationId: string, token?: string }> & InjectedIntlProps;

interface State { }

const messages = defineMessages({
  add: {
    id: 'features.add',
    defaultMessage: 'Congratulations! Feature `{feature}` has been added to your features. Hang on, you\'ll be redirected in 5 secs.'
  },
  remove: {
    id: 'features.remove',
    defaultMessage: 'Feature `{feature}` has been removed. Hang on, you\'ll be redirected in 5 secs.'
  },
})

interface FilterParams {
  token: string;
}

interface Token {
  version: number;
  method: 'add' | 'remove';
  featureName: string;
}

/*
Page used to add / remove UI features with a link so that customers can activate / remove features during alpha tests.
*/
class FeatureFlagPage extends React.Component<Props, State> {

  parseToken = (token: string): Token => {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  }

  isValidToken = (token: string): boolean => {

    try {

      const decodedToken: Token = this.parseToken(token);

      // Only Version 1 is supported for now
      if (decodedToken.version !== 1) {
        log.error(`version ${decodedToken.version} is not 1`);
        return false;
      }

      // Only add and remove methods are supported
      // Let's do runtime validation of the type
      if (decodedToken.method !== 'add' && decodedToken.method !== 'remove') {
        return false;
      }

      // A feature must be a string
      // Sadly, we don't have (yet?) a way to whitelist all the avaibale features
      if (typeof decodedToken.featureName !== 'string') {
        log.error(`FeatureName ${decodedToken.featureName} is not a string`);
        return false;
      }

      return true;

    } catch (e) {
      log.error("Error during token validation: " + e);
      return false;
    }
  }

  applyTokenInLocalStorage = (token: Token) => {

    const previousFeatures = window.localStorage.getItem('features');

    let previousParsedFeatures: string[] = [];

    // If we don't have any features key in the local storage
    // We create a new empty array
    if(!previousFeatures) {
      previousParsedFeatures = [];
    } else {
      previousParsedFeatures = JSON.parse(previousFeatures);
    }

    // Features to be written after add / remove
    let newFeatures = [];

    if(token.method === 'add') {
      // Only add it if needed
      if(!previousParsedFeatures.find(item => item === token.featureName)) {
        newFeatures = previousParsedFeatures.concat([token.featureName]);
      } else {
        newFeatures = previousParsedFeatures;
      }
    } else {
      newFeatures = previousParsedFeatures.filter(item => item !== token.featureName);
    }

    window.localStorage.setItem('features', JSON.stringify(newFeatures));

  }

  render() {

    const {
      intl,
      history,
      location: {
        search
      },
      match: {
        params: {
          organisationId,
        }
      }
    } = this.props;

    // Used to redirect after 5 secs
    const redirect = () => {history.push(`/v2/o/${organisationId}/audience/segments`)};

    const queryStringParams = parseSearch<FilterParams>(search);
    const token = queryStringParams.token;

    // If no token is passed, or if it's invalid, let's reject it
    if (!token || !this.isValidToken(token)) {
      return <Redirect to={`/v2/o/${organisationId}/campaigns/display`} />;
    }

    const parsedToken = this.parseToken(token);
    this.applyTokenInLocalStorage(parsedToken);

    const diplayMessage = parsedToken.method === 'add' ? intl.formatMessage(messages.add, { feature: parsedToken.featureName }) : intl.formatMessage(messages.remove, { feature: parsedToken.featureName });

    // After 5 secondes, let's redirect to the campaign listing page
    setTimeout(redirect, 5000);

    return (
      <div className="mcs-centered-container page-error">
        <p>{diplayMessage}</p>
      </div>
    );
  }
}

export default compose<Props, FeatureFlagPageProps>(
  withRouter,
  injectIntl
)(FeatureFlagPage);