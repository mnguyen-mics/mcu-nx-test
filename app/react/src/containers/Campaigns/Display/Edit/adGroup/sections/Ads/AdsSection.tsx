import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import cuid from 'cuid';
import { split } from 'lodash';
import { RouteComponentProps, withRouter } from 'react-router';
import { Row, Col, Spin } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';

import messages from '../../../messages';
import { DrawableContentProps } from '../../../../../../../components/Drawer';
import { FormSection } from '../../../../../../../components/Form';
import { AdFieldModel, isDisplayCreativeFormData } from './domain';
import CreativeCard from '../../../../../../../containers/Campaigns/Common/CreativeCard';
import CreativeService from '../../../../../../../services/CreativeService';
import { computeDimensionsByRatio } from '../../../../../../../utils/ShapeHelper';
import CreativeCardSelector, {
  CreativeCardSelectorProps,
} from '../../../../../Common/CreativeCardSelector';
import {
  DisplayAdResource,
  CreativeResourceShape,
  DisplayAdCreateRequest,
} from '../../../.../../../../../../models/creative/CreativeResource';
import { Index } from '../../../../../../../utils/index';
import { normalizeArrayOfObject } from '../../../../../../../utils/Normalizer';
import {
  ButtonStyleless,
  McsIcons,
  EmptyRecords,
} from '../../../../../../../components/index';
import AuditComponent from '../../../../../../Creative/DisplayAds/Common/AuditComponent';
import { DisplayCreativeFormData } from '../../../../../../Creative/DisplayAds/Edit/domain';
import {
  DisplayCreativeForm,
  DisplayCreativeFormLoader,
  DisplayCreativeCreator,
} from '../../../../../../Creative/DisplayAds/Edit/index';
import { DisplayCreativeCreatorProps } from '../../../../../../Creative/DisplayAds/Edit/DisplayCreativeCreator';
import { DisplayCreativeFormLoaderProps } from '../../../../../../Creative/DisplayAds/Edit/DisplayCreativeFormLoader';
import { DisplayCreativeFormProps } from '../../../../../../Creative/DisplayAds/Edit/DisplayCreativeForm';
export interface AdsSectionProps extends DrawableContentProps {
  formChange: (fieldName: string, value: any) => void;
}

export interface DisplayAdResourceWithFieldIndex {
  creativeResource: DisplayAdResource | DisplayAdCreateRequest;
  fieldModel: AdFieldModel;
  fieldIndex: number;
}

interface AdsSectionState {
  displayCreativeCacheById: Index<DisplayAdResource>;
  loading: boolean;
}

type JoinedProps = AdsSectionProps &
  RouteComponentProps<{ organisationId: string }> &
  WrappedFieldArrayProps<AdFieldModel> &
  InjectedIntlProps;

class AdsSection extends React.Component<JoinedProps, AdsSectionState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      loading: false,
      displayCreativeCacheById: {},
    };
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const loadedCreativeIds = Object.keys(this.state.displayCreativeCacheById);
    const creativeIdsToBeLoaded: string[] = [];
    nextProps.fields.getAll().forEach((field, index) => {
      if (
        !isDisplayCreativeFormData(field.resource) &&
        !loadedCreativeIds.includes(field.resource.creative_id)
      ) {
        creativeIdsToBeLoaded.push(field.resource.creative_id);
      }
    });
    Promise.all(
      creativeIdsToBeLoaded.map(id =>
        CreativeService.getDisplayAd(id).then(res => res.data),
      ),
    ).then(creatives => {
      this.setState(prevState => ({
        displayCreativeCacheById: {
          ...prevState.displayCreativeCacheById,
          ...normalizeArrayOfObject(creatives, 'id'),
        },
      }));
    });
  }

  openNewCreativeForm = () => {
    const { openNextDrawer, closeNextDrawer } = this.props;

    const additionalProps = {
      closeNextDrawer: closeNextDrawer,
      openNextDrawer: openNextDrawer,
      save: this.addNewCreativeToAdSelection,
      drawerMode: true,
      actionBarButtonText: messages.addNewCreative,
      close: closeNextDrawer,
    };

    const options = {
      additionalProps: additionalProps,
    };

    openNextDrawer<DisplayCreativeCreatorProps>(
      DisplayCreativeCreator,
      options,
    );
  };

  openCreativeCardSelector = () => {
    const { closeNextDrawer, openNextDrawer, fields } = this.props;

    const creativeIds: string[] = [];
    fields.getAll().forEach(field => {
      if (!isDisplayCreativeFormData(field.resource)) {
        creativeIds.push(field.resource.creative_id);
      }
    });

    const displayAdsSelectorProps: CreativeCardSelectorProps = {
      close: closeNextDrawer,
      save: this.updateExistingAds,
      creativeType: 'DISPLAY_AD',
      selectedCreativeIds: creativeIds,
    };

    const options = {
      additionalProps: displayAdsSelectorProps,
    };

    openNextDrawer<CreativeCardSelectorProps>(CreativeCardSelector, options);
  };

  addNewCreativeToAdSelection = (creativeData: DisplayCreativeFormData) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const createCreativeData: AdFieldModel = {
      id: cuid(),
      resource: creativeData,
    };
    formChange(
      (fields as any).name,
      fields.getAll().concat(createCreativeData),
    );
    closeNextDrawer();
  };

  updateExistingAds = (creatives: CreativeResourceShape[]) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const creativeIds = creatives.map(c => c.id);

    const fieldCreativeIds: string[] = [];
    fields.getAll().forEach(field => {
      if (!isDisplayCreativeFormData(field.resource)) {
        fieldCreativeIds.push(field.resource.creative_id);
      }
    });

    const keptFields: AdFieldModel[] = [];
    fields.getAll().forEach(field => {
      if (
        isDisplayCreativeFormData(field.resource) ||
        creativeIds.includes(field.resource.creative_id)
      ) {
        keptFields.push(field);
      }
    });

    const newFields: AdFieldModel[] = creatives
      .filter(s => !fieldCreativeIds.includes(s.id))
      .map(creative => ({
        id: cuid(),
        resource: {
          creative_id: creative.id,
        },
      }));

    formChange((fields as any).name, keptFields.concat(newFields));
    closeNextDrawer();
  };

  openCreativeEditionDrawer = (data: DisplayAdResourceWithFieldIndex) => () => {
    const {
      openNextDrawer,
      closeNextDrawer,
      match: { params: { organisationId } },
    } = this.props;

    const commonProps = {
      close: closeNextDrawer,
      breadCrumbPaths: [
        {
          name: messages.editDisplayCreative,
        },
      ],
      actionBarButtonText: messages.updateDisplayCreative,
      openNextDrawer: openNextDrawer,
      closeNextDrawer: closeNextDrawer,
    };

    // EDIT NEW
    if (isDisplayCreativeFormData(data.fieldModel.resource)) {
      const additionalProps = {
        initialValues: data.fieldModel.resource,
        save: (formData: DisplayCreativeFormData) => {
          //
        },
        rendererProperties: data.fieldModel.resource.rendererProperties,
        rendererVersionId: (data.fieldModel.resource.creative.renderer_version_id || ''),
        ...commonProps,
      };
      const options = {
        additionalProps: additionalProps,
      };
      openNextDrawer<DisplayCreativeFormProps>(DisplayCreativeForm, options);
    } else {
      // EDIT EXISTING
      const additionalProps = {
        creativeId: data.fieldModel.resource.creative_id,
        save: (formData: DisplayCreativeFormData) => {
          // updateDisplayCreative(organisationId, formData, rendererProperties)
        },
        rendererVersionId: ,
        rendererProperties: ,
        ...commonProps,
      };
      const options = {
        additionalProps: additionalProps,
      };
      openNextDrawer<DisplayCreativeFormLoaderProps>(
        DisplayCreativeFormLoader,
        options,
      );
    }
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

    return (
      <div>
        <Row className="footer">
          <Col className="inline formatWrapper" span={16}>
            <div style={shapeStyle} />
            <div className="dimensions">{data.creativeResource.format}</div>
          </Col>
          <Col className="inline buttons" span={6}>
            <ButtonStyleless onClick={this.openCreativeEditionDrawer(data)}>
              <McsIcons className="button" type="pen" />
            </ButtonStyleless>

            <div className="button-separator" />

            <ButtonStyleless onClick={removeField}>
              <McsIcons className="button" type="delete" />
            </ButtonStyleless>
          </Col>
        </Row>
        <Row className="footer">
          <Col className="inline formatWrapper" span={22}>
            <AuditComponent
              creative={data.creativeResource}
              mode="creativeCard"
            />
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const { intl: { formatMessage }, fields } = this.props;

    const { displayCreativeCacheById } = this.state;

    const allCreatives: DisplayAdResourceWithFieldIndex[] = [];
    if (fields.getAll()) {
      fields.getAll().forEach((field, index) => {
        if (isDisplayCreativeFormData(field.resource)) {
          allCreatives.push({
            creativeResource: field.resource.creative as DisplayAdCreateRequest,
            fieldIndex: index,
            fieldModel: field,
          });
        } else if (displayCreativeCacheById[field.resource.creative_id]) {
          allCreatives.push({
            creativeResource:
              displayCreativeCacheById[field.resource.creative_id],
            fieldIndex: index,
            fieldModel: field,
          });
        }
      });
    }

    const cards = allCreatives.map(data => {
      const getFooter = () => this.getCreativeCardFooter(data);
      return (
        <Col key={data.fieldModel.id} span={6}>
          <div className="ad-group-card">
            <CreativeCard
              key={data.fieldModel.id}
              creative={data.creativeResource}
              renderFooter={getFooter}
            />
          </div>
        </Col>
      );
    });
    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openNewCreativeForm,
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openCreativeCardSelector,
            },
          ]}
          subtitle={messages.sectionSubtitleAds}
          title={messages.sectionTitleAds}
        />

        <div id="ads">
          <Spin spinning={this.state.loading}>
            <div className="ad-group-ad-section">
              <div className={`mcs-table-card content`}>
                <Row gutter={20}>{cards}</Row>
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
      </div>
    );
  }
}

export default compose<JoinedProps, AdsSectionProps>(withRouter, injectIntl)(
  AdsSection,
);
