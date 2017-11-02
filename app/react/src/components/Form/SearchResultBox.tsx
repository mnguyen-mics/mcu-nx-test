import * as React from 'react';
import { Row } from 'antd';
import { ButtonStyleless, McsIcons } from '../../components';
import { WrappedFieldArrayProps } from 'redux-form';

interface SearchResultBoxProps {
    formInputSearchProps: Array<{
        countryName: string;
        excludeOrInclude: string;
    }>;
    tableName: string;
    loading: boolean;
    updateTableFieldStatus: (obj: {index: number, tableName: string}) => void;
}

class SearchResultBox extends React.Component<
  SearchResultBoxProps & WrappedFieldArrayProps<{name: string, exclude: boolean}>> {

    deleteLocationFromFields = (index: number, allFields: any) => () => {
        allFields.remove(index);
    }

    render() {

        const {
            fields,
        } = this.props;

        return (
            <div>
                <Row
                    type="flex"
                    align="middle"
                    justify="space-between"
                    className={fields.length !== 0 ? 'search-result-box' : 'hide-section'}
                >
                    {fields ? fields.map((name, index, allFields) => {

                        return (
                            <div className={'search-result-box-item'} key={index}>

                                {(allFields.get(index).exclude) ?
                                    <McsIcons type="close-big" />
                                : <McsIcons type="check" />}
                                {allFields.get(index).name}

                                <ButtonStyleless
                                    className="close-button"
                                    onClick={this.deleteLocationFromFields(index, allFields)}
                                >
                                    <McsIcons type="close" />
                                </ButtonStyleless>
                            </div>
                        );
                    }) : null}
                </Row>
            </div>
          );
    }
}

export default SearchResultBox;
