import ApiService from './ApiService';


// TO DEPRECATE AFTER MERGING PAGES-LIBRARY

function getBidOptimizerProperties(bidOptimizerId) {
  const endpoint = `bid_optimizers/${bidOptimizerId}/properties`;
  return ApiService.getRequest(endpoint, {});
  // return Promise.all(bidOptimizers.map(bidOptimizer => {
  //   const { id } = bidOptimizer;
  //   return ApiService.getRequest(`bid_optimizers/${id}/properties`, {}).then(res => res.data);
  // }))
  //   .then(results => (results.length && {
  //     name: (results.find(elem => elem.technical_name === 'name')).value.value,
  //     provider: (results.find(elem => elem.technical_name === 'provider')).value.value,
  //     // toBeRemoved: (!selectedIds ? false : !(selectedIds.includes(results[1].id))),
  //   })
  // );
}

function getAllBidOptimizers(organisationId) {
  const endpoint = `bid_optimizers?organisation_id=${organisationId}`;

  return ApiService.getRequest(endpoint);
}

function getBidOptimizer(bidOptimizerId, options = {}) {
  const endpoint = `bid_optimizers/${bidOptimizerId}`;
  return ApiService.getRequest(endpoint, options);
}

export default {
  getAllBidOptimizers,
  getBidOptimizer,
  getBidOptimizerProperties,
};
