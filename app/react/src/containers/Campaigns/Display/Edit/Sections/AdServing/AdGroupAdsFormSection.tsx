import * as React from 'react';
import cuid from 'cuid';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { WrappedFieldArrayProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';
import { split } from 'lodash';
import { injectDrawer } from '../../../../../../components/Drawer';
import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { AdGroupFieldModel } from '../../domain';
import {
  isDisplayCreativeFormData,
  INITIAL_AD_GROUP_FORM_DATA,
} from '../../AdGroup/domain';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';
import CreativeCardSelector, {
  CreativeCardSelectorProps,
} from '../../../../Common/CreativeCardSelector';
import {
  DisplayAdResource,
  DisplayAdCreateRequest,
} from '../../../../../../models/creative/CreativeResource';
import { isDisplayAdResource } from '../../../../../Creative/DisplayAds/Edit/domain';
import { Row, Col, Spin } from 'antd';
import {
  ButtonStyleless,
  McsIcon,
  EmptyRecords,
} from '../../../../../../components';
import { AuditStatusRenderer } from '../../../../../Creative/DisplayAds/Audit';
import { DisplayAdResourceWithFieldIndex } from '../../AdGroup/sections/AdFormSection';
import { CancelablePromise } from '../../../../../../services/ApiService';
import { Index } from '../../../../../../utils';
import { makeCancelable } from '../../../../../../utils/ApiHelper';
import { normalizeArrayOfObject } from '../../../../../../utils/Normalizer';
import { computeDimensionsByRatio } from '../../../../../../utils/ShapeHelper';
import CreativeCard from '../../../../Common/CreativeCard';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { ICreativeService } from '../../../../../../services/CreativeService';

export interface AdGroupAdsFormSectionProps extends ReduxFormChangeProps {}

type Props = InjectedIntlProps &
  WrappedFieldArrayProps<AdGroupFieldModel> &
  AdGroupAdsFormSectionProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

interface AdGroupAdsFormSectionState {
  displayCreativeCacheById: Index<DisplayAdResource>;
  loading: boolean;
}

class AdGroupAdsFormSection extends React.Component<
  Props,
  AdGroupAdsFormSectionState
> {
  cancelablePromise: CancelablePromise<DisplayAdResource[]>;

  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      displayCreativeCacheById: {},
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const loadedCreativeIds = Object.keys(this.state.displayCreativeCacheById);
    const creativeIdsToBeLoaded: string[] = [];
    nextProps.fields.getAll().forEach((field, index) => {
      field.model.adFields.forEach(ad => {
        if (
          !isDisplayCreativeFormData(ad.model) &&
          !loadedCreativeIds.includes(ad.model.creative_id)
        ) {
          creativeIdsToBeLoaded.push(ad.model.creative_id);
        }
      });
    });

    this.cancelablePromise = makeCancelable(
      Promise.all(
        creativeIdsToBeLoaded.map(id =>
          this._creativeService.getDisplayAd(id).then(res => res.data),
        ),
      ),
    );

    this.cancelablePromise.promise.then(creatives => {
      this.setState(prevState => ({
        displayCreativeCacheById: {
          ...prevState.displayCreativeCacheById,
          ...normalizeArrayOfObject(creatives, 'id'),
        },
      }));
    });
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  updateAdsAdGroups = (creatives: DisplayAdResource[]) => {
    const { fields, formChange } = this.props;
    const creativeIds = creatives.map(c => c.id);

    const keptFields: AdGroupFieldModel[] = [];
    fields.getAll().forEach(field => {
      field.model.adFields.forEach(ad => {
        if (!isDisplayCreativeFormData(ad.model)) {
          if (creativeIds.includes(ad.model.creative_id)) {
            keptFields.push(field);
          }
        } else if (isDisplayAdResource(ad.model.creative)) {
          if (creativeIds.includes(ad.model.creative.id)) {
            keptFields.push(field);
          }
        }
      });
    });

    const existingCreativeIds: string[] = [];
    fields.getAll().forEach(field => {
      field.model.adFields.forEach(ad => {
        if (!isDisplayCreativeFormData(ad.model)) {
          existingCreativeIds.push(ad.model.creative_id);
        }
      });
    });
    const newFields = creatives
      .filter(creative => !existingCreativeIds.includes(creative.id))
      .map(creative => ({
        key: cuid(),
        model: {
          ...INITIAL_AD_GROUP_FORM_DATA,
          adFields: [
            {
              key: cuid(),
              model: {
                creative_id: creative.id,
              },
            },
          ],
        },
      }));

    formChange((fields as any).name, keptFields.concat(newFields));
  };

  openCreativeCardSelector = () => {
    const { fields } = this.props;

    const creativeIds: string[] = [];
    fields.getAll().forEach(field => {
      field.model.adFields.forEach(creative => {
        if (!isDisplayCreativeFormData(creative.model))
          creativeIds.push(creative.model.creative_id);
      });
    });

    const handleSave = (creatives: DisplayAdResource[]) => {
      this.updateAdsAdGroups(creatives);
      this.props.closeNextDrawer();
    };

    const displayAdsSelectorProps: CreativeCardSelectorProps = {
      close: this.props.closeNextDrawer,
      save: handleSave,
      creativeType: 'DISPLAY_AD',
      selectedCreativeIds: creativeIds,
    };

    const options = {
      additionalProps: displayAdsSelectorProps,
    };

    this.props.openNextDrawer<CreativeCardSelectorProps>(
      CreativeCardSelector,
      options,
    );
  };

  getAdsAdGroupRecords = () => {
    const { fields } = this.props;

    const { displayCreativeCacheById } = this.state;

    const allCreatives: DisplayAdResourceWithFieldIndex[] = [];
    if (fields.getAll()) {
      fields.getAll().forEach((field, index) => {
        field.model.adFields.forEach(ad => {
          if (isDisplayCreativeFormData(ad.model)) {
            allCreatives.push({
              creativeResource: ad.model.creative as DisplayAdCreateRequest,
              fieldIndex: index,
              fieldModel: ad,
            });
          } else if (displayCreativeCacheById[ad.model.creative_id]) {
            allCreatives.push({
              creativeResource: displayCreativeCacheById[ad.model.creative_id],
              fieldIndex: index,
              fieldModel: ad,
            });
          }
        });
      });
    }

    return allCreatives.map(data => {
      const getFooter = () => this.getCreativeCardFooter(data);
      return (
        <Col key={data.fieldModel.key} span={6}>
          <div className="ad-group-card">
            <CreativeCard
              key={data.fieldModel.key}
              creative={data.creativeResource}
              renderFooter={getFooter}
            />
          </div>
        </Col>
      );
    });
  };

  getCreativeCardFooter = (data: DisplayAdResourceWithFieldIndex) => {
    const { fields } = this.props;

    const format = split(data.creativeResource.format, 'x');
    const dimensions = computeDimensionsByRatio(
      Number(format[0]),
      Number(format[1]),
    );

    const shapeStyle = {
      backgroundColor: '#e8e8e8',
      border: 'solid 1px #c7c7c7',
      height: `${dimensions.width}em`,
      width: `${dimensions.height}em`,
    };

    const removeField = () => fields.remove(data.fieldIndex);

    const auditStatus = isDisplayAdResource(data.creativeResource)
      ? data.creativeResource.audit_status
      : undefined;

    return (
      <div>
        <Row className="footer">
          <Col className="inline formatWrapper" span={20}>
            <div style={shapeStyle} />
            <div className="dimensions">{data.creativeResource.format}</div>
          </Col>
          <Col className="inline buttons" span={2}>
            <ButtonStyleless onClick={removeField}>
              <McsIcon className="button" type="delete" />
            </ButtonStyleless>
          </Col>
        </Row>
        <Row className="footer">
          <Col className="inline formatWrapper" span={22}>
            <AuditStatusRenderer auditStatus={auditStatus} />
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const {
      intl: { formatMessage },
      fields,
    } = this.props;

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.dropdownAddExisting),
            onClick: this.openCreativeCardSelector,
          }}
          subtitle={messages.sectionSubtitleAds}
          title={messages.sectionTitleAds}
        />
        <Spin spinning={this.state.loading}>
          <div className="ad-group-ad-section" style={{ overflow: 'hidden' }}>
            <div className="mcs-table-card content">
              <Row gutter={20}>{this.getAdsAdGroupRecords()}</Row>
            </div>

            {!fields.length && (
              <EmptyRecords
                iconType="ads"
                message={formatMessage(messages.contentSectionAdEmptyTitle)}
              />
            )}
          </div>
        </Spin>
      </div>
    );
  }
}

export default compose<Props, AdGroupAdsFormSectionProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(AdGroupAdsFormSection);
