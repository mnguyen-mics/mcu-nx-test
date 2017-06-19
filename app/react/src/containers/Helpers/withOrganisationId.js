import React from 'react';
import { Route } from 'react-router-dom';

// TODO currently not working but later try to find a nice way
// to map match.params.organisationId to component props
const withOrganisationId = (WrappedComponent) => {

  return (
    <Route
      render={({ match }) => {
        const organisationId = match.params.organisationId;
        return (<WrappedComponent organisationId={organisationId} />);
      }}
    />
  );

};

export default withOrganisationId;
