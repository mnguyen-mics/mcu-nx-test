import * as React from 'react';
import { DataLayerDefinition } from '../../routes/domain';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { IMicsTagService } from '../../services/MicsTagService';

export interface DatalayerProps {
  datalayer?: DataLayerDefinition;
}

type Props = DatalayerProps & RouteComponentProps<{ organisationId: string }>;

class Datalayer extends React.Component<Props> {
  @lazyInject(TYPES.IMicsTagService)
  private _micsTagService: IMicsTagService;
  componentDidMount() {
    const {
      datalayer,
      match: {
        params: { organisationId },
      },
      location: { pathname },
    } = this.props;
    this.pushEvent(
      this.buildFinalDatalayer(organisationId, pathname, datalayer),
    );
  }
  componentWillReceiveProps(nextProps: Props) {
    const {
      datalayer,
      match: {
        params: { organisationId },
      },
      location: { pathname },
    } = this.props;

    const {
      datalayer: nextDatalayer,
      match: {
        params: { organisationId: nextOrganisationId },
      },
      location: { pathname: nextPathname },
    } = nextProps;

    if (
      datalayer !== nextDatalayer ||
      nextPathname !== pathname ||
      organisationId !== nextOrganisationId
    ) {
      this.pushEvent(
        this.buildFinalDatalayer(
          nextOrganisationId,
          nextPathname,
          nextDatalayer,
        ),
      );
    }
  }

  buildFinalDatalayer = (
    organisationId: string,
    path: string,
    dataLayer?: DataLayerDefinition,
  ) => {
    return {
      ...dataLayer,
      organisation_id: organisationId,
      path: path,
    };
  };

  pushEvent = (datalayer: any) => {
    this._micsTagService.pushPageView(datalayer);
  };

  public render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}

export default compose<Props, DatalayerProps>(withRouter)(Datalayer);
