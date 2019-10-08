import * as React from 'react';

interface Props {
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  loading?: boolean;
  size?: 'large' | 'medium';
}

class ContentHeader extends React.Component<Props> {
  render() {
    const { title, subTitle, loading, size } = this.props;

    const content = (
      <div>
        <div className={`content-subtitle`}>{subTitle}</div>
        <div
          className={size === 'medium' ? `content-title-2` : `content-title`}
        >
          {title}
        </div>
      </div>
    );

    return (
      <div className="content-header">
        {loading ? <i className="mcs-table-cell-loading-large" /> : content}
      </div>
    );
  }
}

export default ContentHeader;
