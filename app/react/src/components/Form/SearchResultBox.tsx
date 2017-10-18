import * as React from 'react';
import { Row } from 'antd';
import { ButtonStyleless, McsIcons } from '../../components';
// import { BaseFieldArrayProps } from 'redux-form';

interface SearchResultBoxProps {
    dataSource: Array<{}>;
    formInputSearchProps: Array<{
        countryName: string;
        excludeOrInclude: string;
    }>;
    tableName: string;
    loading: boolean;
    // fields?: BaseFieldArrayProps[];
    fields?: Array<{
        name: string;
        index: number;
    }>;
    updateTableFieldStatus: (obj: {index: number, tableName: string}) => void;
    handlers: object;
}

interface SearchResultBoxState {
}

class SearchResultBox extends React.Component<SearchResultBoxProps, SearchResultBoxState> {

    deleteLocationFromFields = (index: number, allFields: any) => () => {
        allFields.remove(index).push();
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
                    className={fields ? 'search-result-box' : 'hide-section'}
                >
                    {fields ? fields.map((name, index, allFields: any) => {

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
