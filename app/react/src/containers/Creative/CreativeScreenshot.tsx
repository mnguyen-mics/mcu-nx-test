import * as React from 'react';
import { Spin } from 'antd';
import {
  DisplayAdResource,
  EmailTemplateResource,
} from '../../models/creative/CreativeResource';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { ICreativeService } from '../../services/CreativeService';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

interface CreativeScreenshotProps {
  item: DisplayAdResource | EmailTemplateResource;
}

interface CreativeScreenshotState {
  loading: boolean;
  error: boolean;
  success: boolean;
}

class CreativeScreenshot extends React.Component<
  CreativeScreenshotProps,
  CreativeScreenshotState
> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: CreativeScreenshotProps) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      success: false,
    };
  }

  componentDidMount() {
    const { item } = this.props;
    this.fetchData(item.id);
  }

  componentDidUpdate(previousProps: CreativeScreenshotProps) {
    const { item } = this.props;

    const { item: previousItem } = previousProps;

    if (item.id !== previousItem.id) {
      this.fetchData(item.id);
    }
  }

  fetchData = (id: string) => {
    this._creativeService
      .getCreativeScreenshotStatus(id)
      .then(response => {
        if (response && response.data && response.data.status) {
          if (response.data.status === 'SUCCEEDED') {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.success = true;
              return nextState;
            });
          } else if (
            response.data.status === 'PENDING' ||
            response.data.status === 'PROCESSING'
          ) {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.loading = true;
              return nextState;
            });
          } else if (
            response.data.status === 'FAILED' ||
            response.data.status === 'NOT_TAKEN'
          ) {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.error = true;
              return nextState;
            });
          }
        }
      })
      .catch(() => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.error = true;
          return nextState;
        });
      });
  };

  renderSuccessScreenshot = (
    record: DisplayAdResource | EmailTemplateResource,
  ) => {
    return (
      <a
        target="_blank"
        rel="noreferrer noopener"
        href={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`}
      >
        <span className="thumbnail-helper" />
        <img
          src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`}
          alt={record.name}
        />
      </a>
    );
  };

  renderLoadingScreenshot = () => {
    return <Spin />;
  };

  renderErrorScreenshot = () => {
    return <McsIcon className="mcs-icon-3x" type="close-big" />;
  };

  render() {
    const { item } = this.props;

    const { error, loading, success } = this.state;

    return (
      <div className="mcs-table-cell-thumbnail">
        {error ? this.renderErrorScreenshot() : null}
        {loading ? this.renderLoadingScreenshot() : null}
        {success ? this.renderSuccessScreenshot(item) : null}
      </div>
    );
  }
}

export default CreativeScreenshot;
