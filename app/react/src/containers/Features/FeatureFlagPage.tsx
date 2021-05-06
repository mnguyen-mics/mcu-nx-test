import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

type Props = RouteComponentProps<{ organisationId: string; token?: string }> & InjectedIntlProps;

interface State {}

const messages = defineMessages({
  deprecated: {
    id: 'features.add',
    defaultMessage:
      'WARNING: This page has been deprecated. Please ask directly to your support contact in order to get access (or be removed) to an alpha/beta feature.',
  },
});

/*
Page used to add / remove UI features with a link so that customers can activate / remove features during alpha tests.
*/
class FeatureFlagPage extends React.Component<Props, State> {
  render() {
    const {
      intl,
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    // Used to redirect after 5 secs
    const redirect = () => {
      history.push(`/v2/o/${organisationId}/audience/segments`);
      (location as any).reload();
    };

    const diplayMessage = intl.formatMessage(messages.deprecated);

    // After 5 secondes, let's redirect to the campaign listing page
    setTimeout(redirect, 5000);

    return (
      <div className='mcs-centered-container page-error'>
        <p>{diplayMessage}</p>
      </div>
    );
  }
}

export default compose<Props, {}>(withRouter, injectIntl)(FeatureFlagPage);
