function filterTableByIncludeStatus(table = [], bool) {
  return table.filter(elem => !elem.toBeRemoved && elem.include === bool);
}

function filterTableByRemovedStatus(table = []) {
  return table.filter(elem => !elem.toBeRemoved);
}

function filterTableByExcludeProperty(table = [], boolean) {
  return table.filter(elem => elem.resource.exclude === boolean && !elem.deleted)
    .map(geoname => geoname.resource.geoname_id);
}

function stringifyTable(table = [], key) {
  return table.reduce((acc, element, i) => (
    `${acc}${`${i > 0 && i < table.length ? ',' : ''} ${element[key]}`}`
  ), '');
}

function setTableRowIndex(table = []) {
  return table.map((row, index) => ({ ...row, index }));
}

export {
  filterTableByIncludeStatus,
  filterTableByRemovedStatus,
  filterTableByExcludeProperty,
  setTableRowIndex,
  stringifyTable,
};
