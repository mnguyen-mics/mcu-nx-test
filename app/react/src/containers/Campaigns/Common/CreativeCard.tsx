import * as React from 'react';
import { Spin } from 'antd';
import cuid from 'cuid';
import { ICreativeService } from '../../../services/CreativeService';
import { DataResponse } from '../../../services/ApiService';
import {
  GenericCreativeResource,
  CreativeScreenshotResource,
} from '../../../models/creative/CreativeResource';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface CreativeCardProps<T> {
  creative: T;
  renderTitle?: (creative: T) => React.ReactNode;
  renderFooter: (creative: T) => React.ReactNode;
  renderSubtitles?: Array<(creative: T) => React.ReactNode>;
}

interface State {
  creativeScreenshot: CreativeScreenshotResource | null;
  error?: Error;
}

class CreativeCard<
  T extends GenericCreativeResource & { id?: string }
> extends React.Component<CreativeCardProps<T>, State> {
  cancelablePromise: CancelablePromise<
    DataResponse<CreativeScreenshotResource>
  >;

  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: CreativeCardProps<T>) {
    super(props);
    this.state = { creativeScreenshot: null };
  }

  componentDidMount() {
    this.fetchScreenshotIfNeeded(this.props.creative);
  }

  componentDidUpdate(previousProps: CreativeCardProps<T>) {
    const { creative } = this.props;
    if (creative.id !== previousProps.creative.id) {
      this.fetchScreenshotIfNeeded(creative);
    }
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchScreenshotIfNeeded = (creative: T) => {
    if (creative.id) {
      this.cancelablePromise = makeCancelable(
        this._creativeService.getCreativeScreenshotStatus(creative.id),
      );

      this.cancelablePromise.promise
        .then(response => {
          this.setState({ creativeScreenshot: response.data });
        })
        .catch(err => {
          this.setState({ error: err });
        });
    }
  };

  renderScreenshot = () => {
    const { creative } = this.props;
    const { creativeScreenshot } = this.state;

    if (creativeScreenshot) {
      if (
        creativeScreenshot.status === 'PENDING' ||
        creativeScreenshot.status === 'PROCESSING'
      ) {
        return (
          <div
            className="text-center"
            style={{
              lineHeight: '200px',
              textAlign: 'center',
              backgroundColor: '#bdbdbd',
            }}
          >
            <Spin />
          </div>
        );
      }

      if (creativeScreenshot.status === 'SUCCEEDED') {
        return (
          <div>
            <div
              className="background-image"
              style={{
                backgroundImage: `url('https://ads.mediarithmics.com/ads/screenshot?rid=${
                  creative.id
                }')`,
              }}
            />
            <div className="image-container">
              <div className="helper" />
              <img
                className="image"
                src={`https://ads.mediarithmics.com/ads/screenshot?rid=${
                  creative.id
                }`}
                alt={creative.name}
              />
            </div>
          </div>
        );
      }
    }

    return (
      <div
        className="text-center"
        style={{
          lineHeight: '210px',
          textAlign: 'center',
          backgroundColor: '#bdbdbd',
        }}
      >
        <McsIcon className="mcs-icon-3x" type="close-big" />
      </div>
    );
  };

  render() {
    const { creative, renderTitle, renderSubtitles, renderFooter } = this.props;

    // use formatmessage
    const renderedTitle = renderTitle
      ? renderTitle(creative)
      : creative
      ? creative.name
      : 'No title';

    return (
      <div className="mcs-creative-card">
        <div className="creative-cover">{this.renderScreenshot()}</div>
        <div className="creative-details">
          <div className="title">
            <strong>{renderedTitle}</strong>
          </div>
          {renderSubtitles &&
            renderSubtitles.length > 0 &&
            renderSubtitles.map(renderSubtitle => (
              <div key={cuid()} className="subtitle">
                <span>{renderSubtitle(creative)}</span>
              </div>
            ))}
        </div>
        <div className="creative-footer">{renderFooter(creative)}</div>
      </div>
    );
  }
}

export default CreativeCard;
