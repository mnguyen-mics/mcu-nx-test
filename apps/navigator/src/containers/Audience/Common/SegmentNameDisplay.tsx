import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps, defineMessages } from 'react-intl';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';

interface SegmentNameDisplayProps {
  audienceSegmentId?: string;
  audienceSegmentResource?: AudienceSegmentShape;
  onLoad?: (segment?: AudienceSegmentShape) => void;
  tableViewMode?: boolean;
  showId?: boolean;
  className?: string;
}

interface State {
  audienceSegmentResource?: AudienceSegmentShape;
}

const localMessages = defineMessages({
  CLICKERS: {
    id: 'components.segmentNameDisplay.CLICKERS',
    defaultMessage: 'Clickers',
  },
  EXPOSED: {
    id: 'components.segmentNameDisplay.EXPOSED',
    defaultMessage: 'Exposed',
  },
});

type Props = SegmentNameDisplayProps & InjectedNotificationProps & WrappedComponentProps;

/**
 * This component can either be passed:
 * - A segmentId in the `audienceSegmentId` props (it'll retrive the name per API)
 * - The resource of a segment in the `audienceSegmentResource` props
 *
 * If both are passed, the resource is chosen as the source of truth
 */
class SegmentNameDisplayWrapped extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);

    if (props.audienceSegmentResource) {
      this.state = { audienceSegmentResource: props.audienceSegmentResource };
    } else {
      // We'll use `fetchAudienceSegmentResource()` to fetch it in `componentDidMount()`
      this.state = {};
    }
  }

  fetchAudienceSegmentResource = (segmentId: string) => {
    return this._audienceSegmentService.getSegment(segmentId).then(response => {
      if (this.props.onLoad) this.props.onLoad(response.data);
      return response.data;
    });
  };

  componentDidMount() {
    const { audienceSegmentId } = this.props;

    if (audienceSegmentId) {
      this.fetchAudienceSegmentResource(audienceSegmentId)
        .then(audienceSegment => {
          this.setState({ audienceSegmentResource: audienceSegment });
        })
        .catch(err => {
          this.props.notifyError(err);
        });
    }
  }

  componentDidUpdate(previousPros: Props) {
    const { audienceSegmentId, audienceSegmentResource: audienceSegmentResourceFromProps } =
      this.props;

    // If the resource is passed by props, then we check:
    // a. if there was a previous res passed by props
    // OR
    // b. if the resource passed by props is different that the previous one
    if (
      audienceSegmentResourceFromProps &&
      (!previousPros.audienceSegmentResource ||
        (previousPros.audienceSegmentResource &&
          audienceSegmentResourceFromProps.id !== previousPros.audienceSegmentResource.id))
    ) {
      this.setState({
        audienceSegmentResource: audienceSegmentResourceFromProps,
      });
      // If the id is passed by props, then we check:
      // a. if there was a previous id passed by props
      // OR
      // b. if the id passed by props is different that the previous one
    } else if (
      audienceSegmentId &&
      (!previousPros.audienceSegmentId ||
        (previousPros.audienceSegmentId && audienceSegmentId !== previousPros.audienceSegmentId))
    ) {
      this.fetchAudienceSegmentResource(audienceSegmentId)
        .then(audienceSegment => {
          this.setState({ audienceSegmentResource: audienceSegment });
        })
        .catch(err => {
          this.props.notifyError(err);
        });
    }
  }

  ellipsizeSegmentName = (segmentName: string) => {
    const { tableViewMode } = this.props;

    return tableViewMode && segmentName.length > 100
      ? `${segmentName.substring(0, 100)}...`
      : segmentName;
  };

  displayId = () => {
    const { audienceSegmentResource } = this.state;
    if (!audienceSegmentResource) return <span />;
    return audienceSegmentResource.name === audienceSegmentResource.id ? (
      <span />
    ) : (
      <span> {audienceSegmentResource.id} - </span>
    );
  };

  render() {
    const { intl, showId, className } = this.props;
    const { audienceSegmentResource } = this.state;

    // This can happen when the component isrenderloading the segment name (or if something shitty happened)
    // We decided to simply print nothing inrenderthis case for now
    if (!audienceSegmentResource) return <span />;
    let audienceSegmentName = audienceSegmentResource.name;
    if (audienceSegmentResource.type === 'USER_ACTIVATION') {
      if (audienceSegmentResource.clickers) {
        audienceSegmentName = `${audienceSegmentResource.name} - ${intl.formatMessage(
          localMessages.CLICKERS,
        )}`;
      } else if (audienceSegmentResource.exposed) {
        audienceSegmentName = `${audienceSegmentResource.name} - ${intl.formatMessage(
          localMessages.EXPOSED,
        )}`;
      }
    }
    return (
      <span className={className} title={audienceSegmentResource.name}>
        {showId && this.displayId()} {audienceSegmentName}
      </span>
    );
  }
}
const SegmentNameDisplay = compose<Props, SegmentNameDisplayProps>(
  injectIntl,
  injectNotifications,
)(SegmentNameDisplayWrapped);

export { SegmentNameDisplay, SegmentNameDisplayProps };
