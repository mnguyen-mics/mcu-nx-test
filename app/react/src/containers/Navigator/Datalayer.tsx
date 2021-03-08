import * as React from 'react';
import { DataLayerDefinition } from '../../routes/domain';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { ITagService } from '../../services/TagService';

export interface DatalayerProps {
  datalayer?: DataLayerDefinition;
}

type Props = DatalayerProps & RouteComponentProps<{ organisationId: string }>;

class Datalayer extends React.Component<Props> {
  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;
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
    this.googleAnalyticsTrack(pathname);
  }
  componentDidUpdate(previousProps: Props) {
    const {
      datalayer,
      match: {
        params: { organisationId },
      },
      location: { pathname },
    } = this.props;

    const {
      datalayer: previousDatalayer,
      match: {
        params: { organisationId: previousOrganisationId },
      },
      location: { pathname: previousPathname },
    } = previousProps;

    if (
      datalayer !== previousDatalayer ||
      previousPathname !== pathname ||
      organisationId !== previousOrganisationId
    ) {
      this.pushEvent(
        this.buildFinalDatalayer(organisationId, pathname, datalayer),
      );
      this.googleAnalyticsTrack(pathname);
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
    this._tagService.pushPageView(datalayer);
  };

  googleAnalyticsTrack = (pathname: string) => {
    this._tagService.googleAnalyticsTrack(pathname);
  };

  public render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}

export default compose<Props, DatalayerProps>(withRouter)(Datalayer);
