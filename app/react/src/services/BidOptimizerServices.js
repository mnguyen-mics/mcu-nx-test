import ApiService from './ApiService';
import PluginServices from './PluginServices';

function getBidOptimizerProperties({ bidOptimizers, selectedIds }) {
  return Promise.all(bidOptimizers.map(bidOptimizer => {
    const { engine_version_id, id } = bidOptimizer;

    const fetchEngineProperties = PluginServices.getEngineProperties(engine_version_id);
    const fetchEngineVersion = PluginServices.getEngineVersion(engine_version_id, id);

    return Promise.all([fetchEngineProperties, fetchEngineVersion]);
  }))
    .then(results => results.map((result) => ({
      name: (result[0].find(elem => elem.technical_name === 'name')).value.value,
      provider: (result[0].find(elem => elem.technical_name === 'provider')).value.value,
      toBeRemoved: (!selectedIds ? false : !selectedIds.includes(result[1].id)),
      ...result[1],
    }))
  );
}

function getAllBidOptimizers({ organisationId }) {
  const endpoint = `bid_optimizers?organisation_id=${organisationId}`;

  return ApiService.getRequest(endpoint)
    .then(res => res.data);
}

function getBidOptimizers({ organisationId, selectedIds, getAll }) {
  return getAllBidOptimizers({ organisationId })
    .then((bidOptimizers) => {
      const reqParams = (getAll
        ? { bidOptimizers, selectedIds }
        : { bidOptimizers: bidOptimizers.filter(bidOptimizer => selectedIds.includes(bidOptimizer.id)) }
      );

      return getBidOptimizerProperties(reqParams);
    });
}

export default {
  getAllBidOptimizers,
  getBidOptimizers,
};
