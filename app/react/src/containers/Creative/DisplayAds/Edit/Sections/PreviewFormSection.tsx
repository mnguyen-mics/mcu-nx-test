import * as React from 'react';
import { FormSection } from '../../../../../components/Form';
import messages from '../messages';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import {
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isDisplayAdResource,
} from '../domain';
import { connect } from 'react-redux';
import { getFormInitialValues } from 'redux-form';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

const configuration = {
  ADS_PREVIEW_URL: '//ads.mediarithmics.com/ads/render',
};

class PreviewFormSection extends React.Component<MapStateProps> {
  renderIframeCreative = (creative: DisplayAdResource) => {
    const { initialValue: { properties: rendererProperties } } = this.props;

    let tagType = 'iframe';

    const foundTagType = rendererProperties.tag_type;

    if (foundTagType) {
      switch (foundTagType.property_type) {
        case 'URL':
          tagType = foundTagType!.value.url;
          break;
        default:
          tagType = foundTagType!.value.value;
          break;
      }
    }

    let previewUrl = `${configuration.ADS_PREVIEW_URL}?ctx=PREVIEW&rid=${
      creative.id
    }&caid=preview`;
    if (tagType === 'script') {
      previewUrl =
        `data:text/html;charset=utf-8,` +
        `${encodeURI(
          `<html><body style="margin-left: 0%; margin-right: 0%; margin-top: 0%; margin-bottom: 0%">` +
            `<script type="text/javascript" src="https:${
              configuration.ADS_PREVIEW_URL
            }?ctx=PREVIEW&rid=${creative.id}&caid=preview"></script>` +
            `</body></html>`,
        )}`;
    }
    return previewUrl;
  };

  formatDimension = (format: string) => {
    return {
      width: parseInt(format.split('x')[0], 10),
      height: parseInt(format.split('x')[1], 10),
    };
  };

  render() {
    const { initialValue: { creative } } = this.props;

    if (!isDisplayAdResource(creative)) return null;

    return (
      <div>
        <FormSection
          title={messages.creativeSectionPreviewTitle}
          subtitle={messages.creativeSectionPreviewSubTitle}
        />
        <iframe
          className="renderer"
          src={this.renderIframeCreative(creative)}
          frameBorder="0"
          scrolling="no"
          width={this.formatDimension(creative.format).width}
          height={this.formatDimension(creative.format).height}
        />
      </div>
    );
  }
}

export default connect((state: any) => ({
  initialValue: getFormInitialValues(DISPLAY_CREATIVE_FORM)(
    state,
  ) as DisplayCreativeFormData,
}))(PreviewFormSection);
