import { withRouter } from 'react-router-dom';
import { compose, withProps } from 'recompose';

const withMcsRouter = compose(
  withRouter,
  withProps(({ match }) => ({
    organisationId: match.params.organisationId,
  })),
);

export default withMcsRouter;
