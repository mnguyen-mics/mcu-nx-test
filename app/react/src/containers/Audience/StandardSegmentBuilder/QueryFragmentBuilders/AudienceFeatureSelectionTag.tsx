import * as React from 'react';
import { Tag, Spin, Tooltip } from 'antd';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAudienceFeatureService } from '../../../../services/AudienceFeatureService';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

export interface AudienceFeatureSelectionTagProps {
  audienceFeatureId: string;
  datamartId: string;
  finalValues?: string[];
  onClose: (featureId: string) => () => void;
}

export const truncate = (stringLimit: number, stringValue?: string) => {
  if (!stringValue) return;
  return stringValue.length > stringLimit
    ? stringValue.substring(0, stringLimit - 3) + '...'
    : stringValue;
};

interface State {
  isLoading: boolean;
  audienceFeature?: AudienceFeatureResource;
}

type Props = InjectedNotificationProps & AudienceFeatureSelectionTagProps;

class AudienceFeatureSelectionTag extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }
  componentDidMount() {
    const { audienceFeatureId, datamartId } = this.props;

    this._audienceFeatureService
      .getAudienceFeature(datamartId, audienceFeatureId)
      .then(res => {
        this.setState({
          audienceFeature: res.data,
          isLoading: false,
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    const { finalValues, onClose, audienceFeatureId } = this.props;
    const { isLoading, audienceFeature } = this.state;
    return isLoading ? (
      <Spin />
    ) : (
      <Tooltip
        title={`${audienceFeature?.name}${
          finalValues !== undefined
            ? ': ' +
              finalValues
                .map((v, i) => {
                  return i === finalValues.length - 1 ? v : `${v}, `;
                })
                .join('')
            : ''
        }`}
      >
        <Tag closable={true} onClose={onClose(audienceFeatureId)}>
          {truncate(18, audienceFeature?.name)}
          {finalValues && finalValues.length > 0 && ': '}
          {finalValues?.slice(0, 3).map((v, i) => {
            return finalValues.length === 1 ? truncate(18, v) : truncate(18, v) + ', ';
          })}
          {finalValues && finalValues.length > 3 ? ` +${finalValues.length - 3}` : ''}
        </Tag>
      </Tooltip>
    );
  }
}
export default compose<Props, AudienceFeatureSelectionTagProps>(injectNotifications)(
  AudienceFeatureSelectionTag,
);
