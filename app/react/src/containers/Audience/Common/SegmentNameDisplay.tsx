import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';

interface SegmentNameDisplayProps {
    audienceSegmentId?: string;
    audienceSegmentResource?: AudienceSegmentShape;
    onLoad?: (segment?: AudienceSegmentShape) => void
}

interface State {
    audienceSegmentResource?: AudienceSegmentShape
}

const localMessages = defineMessages({
    CLICKERS: {
        id: 'segment-name-display.CLICKERS',
        defaultMessage: 'Clickers',
    },
    EXPOSED: {
        id: 'segment-name-display.EXPOSED',
        defaultMessage: 'Exposed',
    },
})

type Props = SegmentNameDisplayProps & InjectedIntlProps;

/** 
 * This component can either be passed:
 * - A segmentId in the `audienceSegmentId` props (it'll retrive the name per API)
 * - The resource of a segment in the `audienceSegmentResource` props
 * 
 * If both are passed, the resource is chosen as the source of truth
 */
class SegmentNameDisplay extends React.Component<Props, State> {
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
        return this._audienceSegmentService.getSegment(segmentId)
            .then(r => {
                if (this.props.onLoad) this.props.onLoad(r.data)
                return r;
            });
    }



    async componentDidMount() {

        const { audienceSegmentId } = this.props;

         if (audienceSegmentId) {
            const audienceSegmentRes = await this.fetchAudienceSegmentResource(audienceSegmentId);
            this.setState({ audienceSegmentResource: audienceSegmentRes.data });
        }

    }

    async componentDidUpdate(previousPros: Props) {

        const { audienceSegmentId, audienceSegmentResource: audienceSegmentResourceFromProps } = this.props;

        // If the resource is passed by props, then we check:
        // a. if there was a previous res passed by props
        // OR
        // b. if the resource passed by props is different that the previous one
        if (audienceSegmentResourceFromProps
            && ((!previousPros.audienceSegmentResource 
                || previousPros.audienceSegmentResource && audienceSegmentResourceFromProps.id !== previousPros.audienceSegmentResource.id))) {

            this.setState({ audienceSegmentResource: audienceSegmentResourceFromProps });
        // If the id is passed by props, then we check:
        // a. if there was a previous id passed by props
        // OR
        // b. if the id passed by props is different that the previous one
        } else if (audienceSegmentId 
            && (!previousPros.audienceSegmentId 
            || (previousPros.audienceSegmentId && audienceSegmentId !== previousPros.audienceSegmentId))) {

            const audienceSegmentRes = await this.fetchAudienceSegmentResource(audienceSegmentId);

            this.setState({ audienceSegmentResource: audienceSegmentRes.data });
        }

    }

    render() {

        const { intl } = this.props;
        const { audienceSegmentResource } = this.state;

        // This can happen when the component isrenderloading the segment name (or if something shitty happened)
            // We decided to simply print nothing inrenderthis case for now
        if (!audienceSegmentResource) return <span />;


        if (audienceSegmentResource.type === "USER_ACTIVATION") {
            if (audienceSegmentResource.clickers) {
                const audienceSegmentName = `${audienceSegmentResource.name} - ${intl.formatMessage(localMessages.CLICKERS)}`;
                return (<span title={audienceSegmentName}>{audienceSegmentName}</span>)
            } else if (audienceSegmentResource.exposed) {
                const audienceSegmentName = `${audienceSegmentResource.name} - ${intl.formatMessage(localMessages.EXPOSED)}`;
                return (<span title={audienceSegmentName}>{audienceSegmentName}</span>)
            } else {
                return (<span title={audienceSegmentResource.name}>{audienceSegmentResource.name}</span>)
            }
        } else {
            return (<span title={audienceSegmentResource.name}>{audienceSegmentResource.name}</span>)
        }

    }

}

export default compose<Props, SegmentNameDisplayProps>(
    injectIntl
)(SegmentNameDisplay);