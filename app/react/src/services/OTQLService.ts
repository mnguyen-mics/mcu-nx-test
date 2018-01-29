import ApiService, { DataResponse } from './ApiService';
import { OTQLResult } from '../models/datamart/graphdb/OTQLResult';

const OTQLService = {
  runQuery(
    datamartId: string,
    query: string,
    options: {
      index_name?: string;
      query_id?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<DataResponse<OTQLResult>> {
    // const endpoint = `datamarts/${datamartId}/query_executions/otql`;
    // const headers = { 'Content-Type': 'text/plain' };
    // return ApiService.postRequest(endpoint, query, options, headers);
    const result: DataResponse<OTQLResult> = {
      status: 'ok',
      data: {
        took: 172,
        timed_out: false,
        offset: null,
        limit: null,
        rows: [
          {
            count: 25439004,
          },
        ],
      },
    };
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(data)
      }, 2000);
    });
  },
};

export default OTQLService;

const data: DataResponse<OTQLResult> = {
  status: 'ok',
  data: {
    took: 8852,
    timed_out: false,
    offset: null,
    limit: null,
    rows: [
      {
        aggregations: {
          buckets: [
            {
              name: 'map_cat1',
              fieldName: 'cat1',
              type: 'map',
              buckets: [
                {
                  key: 'Accueil',
                  count: 1491259,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'gros_electromenager',
                  count: 1328796,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'lave_linge',
                            count: 195101,
                          },
                          {
                            key: 'refrigerateur_congelateur',
                            count: 168806,
                          },
                          {
                            key: 'lave_vaisselle',
                            count: 141736,
                          },
                          {
                            key: 'plaque_de_cuisson',
                            count: 132229,
                          },
                          {
                            key: 'four',
                            count: 98041,
                          },
                          {
                            key: 'refrigerateur',
                            count: 90003,
                          },
                          {
                            key: 'hotte',
                            count: 76038,
                          },
                          {
                            key: 'micro_ondes',
                            count: 70925,
                          },
                          {
                            key: 'seche_linge',
                            count: 68141,
                          },
                          {
                            key: 'cuisinieres',
                            count: 65748,
                          },
                          {
                            key: 'congelateur',
                            count: 56088,
                          },
                          {
                            key: 'cave_a_vin',
                            count: 23751,
                          },
                          {
                            key: 'micro_ondes_encastrable',
                            count: 17612,
                          },
                          {
                            key: 'refrigerateur_americain',
                            count: 12677,
                          },
                          {
                            key: 'accessoires',
                            count: 11070,
                          },
                          {
                            key: 'gros_electromenager_encastrable',
                            count: 5535,
                          },
                          {
                            key: 'climatiseur',
                            count: 4379,
                          },
                          {
                            key: 'pieces_detachees_refrigerateur',
                            count: 4125,
                          },
                          {
                            key: 'pieces_detachees_lave_linge',
                            count: 3559,
                          },
                          {
                            key: 'pieces_detachees_lave_vaisselle',
                            count: 3066,
                          },
                          {
                            key: 'pieces_detachees_four',
                            count: 2768,
                          },
                          {
                            key: 'pieces_detachees_hotte',
                            count: 2265,
                          },
                          {
                            key: 'pieces_detachees_micro_ondes',
                            count: 1970,
                          },
                          {
                            key: 'pieces_detachees_table_de_cuisson',
                            count: 1807,
                          },
                          {
                            key: 'pieces_detachees_seche_linge',
                            count: 1585,
                          },
                          {
                            key: 'cuisson_chr',
                            count: 1398,
                          },
                          {
                            key: 'autour_du_vin',
                            count: 959,
                          },
                          {
                            key: 'lave_linge_seche_linge_encastrable',
                            count: 701,
                          },
                          {
                            key: 'bosch',
                            count: 555,
                          },
                          {
                            key: 'whirlpool',
                            count: 485,
                          },
                          {
                            key: 'lavage_chr',
                            count: 468,
                          },
                          {
                            key: 'samsung',
                            count: 339,
                          },
                          {
                            key: 'pieces_detachees_congelateur',
                            count: 328,
                          },
                          {
                            key: 'electrolux',
                            count: 310,
                          },
                          {
                            key: 'froid_chr',
                            count: 278,
                          },
                          {
                            key: 'pieces_detachees_cuisiniere',
                            count: 222,
                          },
                          {
                            key: 'indesit',
                            count: 190,
                          },
                          {
                            key: 'preparation_chr',
                            count: 153,
                          },
                          {
                            key: 'miele',
                            count: 144,
                          },
                          {
                            key: 'siemens',
                            count: 88,
                          },
                          {
                            key: 'liebherr',
                            count: 85,
                          },
                          {
                            key: 'accessoires_chr',
                            count: 51,
                          },
                          {
                            key: 'smeg',
                            count: 50,
                          },
                          {
                            key: 'mobilier_de_cuisine_chr',
                            count: 40,
                          },
                          {
                            key: 'hygiene_chr',
                            count: 38,
                          },
                          {
                            key: 'thomson',
                            count: 38,
                          },
                          {
                            key: 'beko',
                            count: 31,
                          },
                          {
                            key: 'pack_economique_accessoire',
                            count: 21,
                          },
                          {
                            key: 'autres_caves',
                            count: 18,
                          },
                          {
                            key: 'aeg',
                            count: 16,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'moteur',
                  count: 840931,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'gros_electromenager',
                            count: 236724,
                          },
                          {
                            key: 'informatique',
                            count: 150877,
                          },
                          {
                            key: 'petit_electromenager_cuisine',
                            count: 104279,
                          },
                          {
                            key: 'telephonie_et_mobilite',
                            count: 99002,
                          },
                          {
                            key: 'tv_photo_video',
                            count: 62418,
                          },
                          {
                            key: 'audio_hifi_home_cinema',
                            count: 55667,
                          },
                          {
                            key: 'entretien_et_soin_de_la_maison',
                            count: 51918,
                          },
                          {
                            key: 'objets_connectes',
                            count: 27871,
                          },
                          {
                            key: 'beaute_forme_et_sante',
                            count: 23076,
                          },
                          {
                            key: 'literie',
                            count: 11172,
                          },
                          {
                            key: 'bricolage',
                            count: 3992,
                          },
                          {
                            key: 'puericulture',
                            count: 3878,
                          },
                          {
                            key: 'meuble',
                            count: 3691,
                          },
                          {
                            key: 'sports_loisirs',
                            count: 3684,
                          },
                          {
                            key: 'decoration_et_art_de_la_table',
                            count: 1530,
                          },
                          {
                            key: 'jardin',
                            count: 954,
                          },
                          {
                            key: 'jouets',
                            count: 141,
                          },
                          {
                            key: 'console_jeux_gaming_pc',
                            count: 56,
                          },
                          {
                            key:
                              'freemarker_template_generalpurposenothing_73bc16cc',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'informatique',
                  count: 657472,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'ordinateur_portable',
                            count: 233246,
                          },
                          {
                            key: 'imprimante_et_scanner',
                            count: 77146,
                          },
                          {
                            key: 'tablette_tactile',
                            count: 58857,
                          },
                          {
                            key: 'ordinateur_de_bureau',
                            count: 57059,
                          },
                          {
                            key: 'disque_dur_cle_usb',
                            count: 43600,
                          },
                          {
                            key: 'accessoires',
                            count: 27504,
                          },
                          {
                            key: 'mac_imac_ipad',
                            count: 24197,
                          },
                          {
                            key: 'ecran',
                            count: 21911,
                          },
                          {
                            key: 'clavier_souris_tapis',
                            count: 18095,
                          },
                          {
                            key: 'reseau',
                            count: 15701,
                          },
                          {
                            key: 'enceinte_casque_micro',
                            count: 6435,
                          },
                          {
                            key: 'consommable_pour_imprimante',
                            count: 5856,
                          },
                          {
                            key: 'composant_informatique',
                            count: 4946,
                          },
                          {
                            key: 'fournitures_de_bureau',
                            count: 3729,
                          },
                          {
                            key: 'logiciel_pc_et_mac',
                            count: 3015,
                          },
                          {
                            key: 'batterie_alimentation_pc_portable',
                            count: 2985,
                          },
                          {
                            key: 'alimentation_informatique',
                            count: 2356,
                          },
                          {
                            key: 'housse_et_protection_pour_tablette',
                            count: 1833,
                          },
                          {
                            key: 'liseuse_ebook',
                            count: 1781,
                          },
                          {
                            key: 'accessoire_tablette_tactile',
                            count: 1676,
                          },
                          {
                            key: 'onduleur',
                            count: 1616,
                          },
                          {
                            key: 'webcam_et_camera_ip',
                            count: 1254,
                          },
                          {
                            key: 'impression_3d',
                            count: 1216,
                          },
                          {
                            key: 'fourniture_pour_le_bureau',
                            count: 864,
                          },
                          {
                            key: 'disque_cd_dvd_blu_ray',
                            count: 737,
                          },
                          {
                            key: 'tuning_pc',
                            count: 619,
                          },
                          {
                            key: 'calculatrice',
                            count: 574,
                          },
                          {
                            key: 'accessoires_reseau',
                            count: 319,
                          },
                          {
                            key: 'barebone_pc',
                            count: 224,
                          },
                          {
                            key: 'pieces_detachees_apple',
                            count: 144,
                          },
                          {
                            key: 'pieces_detachees_informatique',
                            count: 111,
                          },
                          {
                            key: 'pieces_detachees_telephone_portable',
                            count: 44,
                          },
                          {
                            key: 'apple',
                            count: 29,
                          },
                          {
                            key: 'acer',
                            count: 24,
                          },
                          {
                            key: 'hp',
                            count: 20,
                          },
                          {
                            key: 'microsoft',
                            count: 20,
                          },
                          {
                            key: 'asus',
                            count: 18,
                          },
                          {
                            key: 'stockage_disque_dur',
                            count: 6,
                          },
                          {
                            key: 'dell',
                            count: 3,
                          },
                          {
                            key: 'lg',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'petit_electromenager_cuisine',
                  count: 486283,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'robots_de_cuisine',
                            count: 96366,
                          },
                          {
                            key: 'cafetiere_expresso_et_machine_a_cafe',
                            count: 63809,
                          },
                          {
                            key: 'micro_ondes_mini_four_rechaud',
                            count: 42011,
                          },
                          {
                            key: 'casserolerie_autocuiseur',
                            count: 36649,
                          },
                          {
                            key: 'cuisson_conviviale',
                            count: 36480,
                          },
                          {
                            key: 'friteuse_cuiseur_mijoteur',
                            count: 29035,
                          },
                          {
                            key: 'theiere_et_bouilloire',
                            count: 24612,
                          },
                          {
                            key: 'machine_a_jus',
                            count: 20844,
                          },
                          {
                            key: 'petit_dejeuner',
                            count: 20589,
                          },
                          {
                            key: 'accessoires',
                            count: 11978,
                          },
                          {
                            key: 'ustensiles_de_cuisine',
                            count: 11660,
                          },
                          {
                            key: 'expresso',
                            count: 10907,
                          },
                          {
                            key: 'barbecue_et_plancha',
                            count: 10626,
                          },
                          {
                            key: 'le_fait_maison',
                            count: 9979,
                          },
                          {
                            key: 'aide_culinaire',
                            count: 9434,
                          },
                          {
                            key: 'eau_et_boisson',
                            count: 6105,
                          },
                          {
                            key: 'conservation_et_rangement',
                            count: 4805,
                          },
                          {
                            key: 'cuisson_festive',
                            count: 2615,
                          },
                          {
                            key: 'kitchenaid',
                            count: 2068,
                          },
                          {
                            key: 'capsules_dosettes_cafe',
                            count: 1379,
                          },
                          {
                            key: 'accessoire_de_nettoyage_et_entretien',
                            count: 335,
                          },
                          {
                            key: 'tefal',
                            count: 334,
                          },
                          {
                            key: 'epicerie_sucree',
                            count: 262,
                          },
                          {
                            key: 'moulinex',
                            count: 236,
                          },
                          {
                            key: 'livres_et_coffrets_cuisine',
                            count: 207,
                          },
                          {
                            key: 'seb',
                            count: 166,
                          },
                          {
                            key: 'accessoire_de_rangement_et_conservation',
                            count: 162,
                          },
                          {
                            key: 'accessoires_de_cuisine',
                            count: 162,
                          },
                          {
                            key: 'epicerie_salee',
                            count: 125,
                          },
                          {
                            key: 'kenwood',
                            count: 102,
                          },
                          {
                            key: 'magimix',
                            count: 101,
                          },
                          {
                            key: 'boisson_froide',
                            count: 48,
                          },
                          {
                            key: 'krups',
                            count: 48,
                          },
                          {
                            key: 'puericulture',
                            count: 38,
                          },
                          {
                            key: 'expresso_avec_broyeur',
                            count: 33,
                          },
                          {
                            key: 'boisson_chaude',
                            count: 21,
                          },
                          {
                            key: 'braun',
                            count: 21,
                          },
                          {
                            key: 'cafetiere',
                            count: 20,
                          },
                          {
                            key: 'dolce_gusto',
                            count: 12,
                          },
                          {
                            key: 'lacor',
                            count: 8,
                          },
                          {
                            key: 'the',
                            count: 8,
                          },
                          {
                            key: 'morphy_richards',
                            count: 6,
                          },
                          {
                            key: 'lg',
                            count: 5,
                          },
                          {
                            key: 'brita',
                            count: 4,
                          },
                          {
                            key: 'delonghi',
                            count: 4,
                          },
                          {
                            key: 'dyson',
                            count: 4,
                          },
                          {
                            key: 'electrolux',
                            count: 3,
                          },
                          {
                            key: 'russell_hobbs',
                            count: 3,
                          },
                          {
                            key: 'divers',
                            count: 2,
                          },
                          {
                            key: 'miele',
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'telephonie_et_mobilite',
                  count: 478950,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'telephone_mobile',
                            count: 346552,
                          },
                          {
                            key: 'telephone_fixe',
                            count: 40094,
                          },
                          {
                            key: 'accessoires',
                            count: 33080,
                          },
                          {
                            key: 'gps_route_rando',
                            count: 9208,
                          },
                          {
                            key: 'accessoire_smartphone',
                            count: 3975,
                          },
                          {
                            key: 'telephone_filaire',
                            count: 3517,
                          },
                          {
                            key: 'kit_pieton_kit_bluetooth',
                            count: 3045,
                          },
                          {
                            key: 'batterie_telephone_mobile',
                            count: 2145,
                          },
                          {
                            key: 'bracelet_connecte',
                            count: 1522,
                          },
                          {
                            key: 'samsung',
                            count: 1520,
                          },
                          {
                            key: 'carte_memoire_lecteur',
                            count: 1412,
                          },
                          {
                            key: 'talkie_walkie',
                            count: 1295,
                          },
                          {
                            key: 'montre_connectee_sport',
                            count: 1207,
                          },
                          {
                            key: 'transmetteur_audio',
                            count: 895,
                          },
                          {
                            key: 'autoradio',
                            count: 604,
                          },
                          {
                            key: 'assistant_d_aide_a_la_conduite',
                            count: 581,
                          },
                          {
                            key: 'apple',
                            count: 522,
                          },
                          {
                            key: 'appareil_pour_senior',
                            count: 292,
                          },
                          {
                            key: 'fax_telecopieur',
                            count: 219,
                          },
                          {
                            key: 'comparateur_d_offres_telephonie',
                            count: 194,
                          },
                          {
                            key: 'batterie_telephone_sans_fil_compatible',
                            count: 140,
                          },
                          {
                            key: 'batterie_telephone',
                            count: 30,
                          },
                          {
                            key: 'montres',
                            count: 25,
                          },
                          {
                            key: 'drone',
                            count: 24,
                          },
                          {
                            key: 'batterie_gps_compatible',
                            count: 21,
                          },
                          {
                            key: 'tomtom',
                            count: 21,
                          },
                          {
                            key: 'apple_watch',
                            count: 12,
                          },
                          {
                            key: 'huawei',
                            count: 7,
                          },
                          {
                            key: 'lg',
                            count: 6,
                          },
                          {
                            key: 'telephone_mobile_seul',
                            count: 6,
                          },
                          {
                            key: 'asus',
                            count: 4,
                          },
                          {
                            key: 'batterie_talkie_walkie_compatible',
                            count: 4,
                          },
                          {
                            key: 'sony',
                            count: 3,
                          },
                          {
                            key: 'bosch',
                            count: 2,
                          },
                          {
                            key: 'autres_accessoires_iphone',
                            count: 1,
                          },
                          {
                            key: 'belkin',
                            count: 1,
                          },
                          {
                            key: 'chic_and_swag',
                            count: 1,
                          },
                          {
                            key: 'crosscall',
                            count: 1,
                          },
                          {
                            key: 'fitbit',
                            count: 1,
                          },
                          {
                            key: 'force_case',
                            count: 1,
                          },
                          {
                            key: 'honor',
                            count: 1,
                          },
                          {
                            key: 'htc',
                            count: 1,
                          },
                          {
                            key: 'media_range',
                            count: 1,
                          },
                          {
                            key: 'microsoft',
                            count: 1,
                          },
                          {
                            key: 'parrot',
                            count: 1,
                          },
                          {
                            key: 'securite_de_la_maison',
                            count: 1,
                          },
                          {
                            key: 'urban_factory',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Espace Communautaire',
                  count: 449317,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Post',
                            count: 266507,
                          },
                          {
                            key: 'Magasin',
                            count: 114559,
                          },
                          {
                            key: 'Les conseils de nos experts',
                            count: 19483,
                          },
                          {
                            key: 'Contributeur',
                            count: 2102,
                          },
                          {
                            key: 'ParticipantsPost',
                            count: 161,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Informatique',
                  count: 428750,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes Informatique',
                            count: 103982,
                          },
                          {
                            key: 'Ordinateurs portables',
                            count: 83302,
                          },
                          {
                            key: 'Ventes Flash Informatique',
                            count: 55139,
                          },
                          {
                            key: 'Apple MacBook Pro, MacBook Air',
                            count: 14438,
                          },
                          {
                            key: 'PC Gaming',
                            count: 13694,
                          },
                          {
                            key: 'Imprimante, scanner',
                            count: 13232,
                          },
                          {
                            key: 'Kobo by Fnac',
                            count: 12776,
                          },
                          {
                            key: 'Toutes les tablettes',
                            count: 12517,
                          },
                          {
                            key: 'iPad',
                            count: 10820,
                          },
                          {
                            key: 'Disque Dur',
                            count: 10374,
                          },
                          {
                            key: 'Ordinateur de bureau',
                            count: 9313,
                          },
                          {
                            key: 'PC Hybride 2 en 1',
                            count: 7970,
                          },
                          {
                            key: 'Samsung Galaxy',
                            count: 5705,
                          },
                          {
                            key: 'Clavier, souris, tablette graphique',
                            count: 4363,
                          },
                          {
                            key: 'Apple iMac, Mac Mini, Mac Pro',
                            count: 3686,
                          },
                          {
                            key: 'Accessoire Tablette',
                            count: 3646,
                          },
                          {
                            key: "Cartouche d'encre, toner",
                            count: 2346,
                          },
                          {
                            key: 'Autres accessoires',
                            count: 2245,
                          },
                          {
                            key: 'Microsoft Surface',
                            count: 2085,
                          },
                          {
                            key: 'Housse, Sacoche',
                            count: 1978,
                          },
                          {
                            key: 'Enceintes,webcam, casque',
                            count: 1537,
                          },
                          {
                            key:
                              'Offres partenaires - Batterie et chargeur pour ordinateur',
                            count: 1102,
                          },
                          {
                            key: 'MacBook, iMac : Sur-mesure Fnac !',
                            count: 980,
                          },
                          {
                            key: 'Composants',
                            count: 946,
                          },
                          {
                            key: 'Toutes nos offres',
                            count: 801,
                          },
                          {
                            key: 'Autres consommables',
                            count: 459,
                          },
                          {
                            key: 'Calculatrice',
                            count: 333,
                          },
                          {
                            key: 'Offre Credit 0%',
                            count: 307,
                          },
                          {
                            key:
                              'Offre special : Pack Ordinateur Portable et Office',
                            count: 131,
                          },
                          {
                            key: 'Ordinateur + Imprimante HP = 100? offerts',
                            count: 106,
                          },
                          {
                            key:
                              'Offre Ordinateur + Imprimante pour 1? de plus',
                            count: 100,
                          },
                          {
                            key: 'Offres partenaires',
                            count: 86,
                          },
                          {
                            key: 'Meilleures ventes informatique',
                            count: 58,
                          },
                          {
                            key: 'Dictaphones',
                            count: 48,
                          },
                          {
                            key: 'Promo Assurance Ordis Portables',
                            count: 31,
                          },
                          {
                            key: 'Informatique : Destination High-Tech',
                            count: 27,
                          },
                          {
                            key: "Tout l'informatique d'occasion",
                            count: 27,
                          },
                          {
                            key: 'PC Portables HP',
                            count: 21,
                          },
                          {
                            key: 'Noeud Test OPC',
                            count: 16,
                          },
                          {
                            key: 'Black Friday Informatique : -10%',
                            count: 11,
                          },
                          {
                            key: "Tout le High Tech d'Occasion",
                            count: 7,
                          },
                          {
                            key: "Cartouches d'encre d'occasion",
                            count: 5,
                          },
                          {
                            key: 'Offres de remboursement !',
                            count: 4,
                          },
                          {
                            key: 'Produits Logitech',
                            count: 4,
                          },
                          {
                            key: 'Fnac Maxi',
                            count: 3,
                          },
                          {
                            key: 'OPC FNACPRO',
                            count: 3,
                          },
                          {
                            key: 'Page Fnac Occasion',
                            count: 3,
                          },
                          {
                            key: 'Processeurs Intel',
                            count: 3,
                          },
                          {
                            key: 'Accessoires : les indispensables !',
                            count: 2,
                          },
                          {
                            key: "Apple d'occasion",
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'tv_photo_video',
                  count: 409433,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'televiseur',
                            count: 226601,
                          },
                          {
                            key: 'appareil_photo',
                            count: 45643,
                          },
                          {
                            key: 'accessoires',
                            count: 41260,
                          },
                          {
                            key: 'lecteur_enregistreur_blu_ray_dvd',
                            count: 19592,
                          },
                          {
                            key: 'videoprojection',
                            count: 16645,
                          },
                          {
                            key: 'tnt_satellite',
                            count: 9460,
                          },
                          {
                            key: 'camera_sport_360',
                            count: 7067,
                          },
                          {
                            key: 'camescope_numerique',
                            count: 3380,
                          },
                          {
                            key: 'accessoire_video',
                            count: 1634,
                          },
                          {
                            key: 'jumelles_et_longue_vue',
                            count: 1175,
                          },
                          {
                            key: 'cadre_photo',
                            count: 1049,
                          },
                          {
                            key: 'videoprojecteur',
                            count: 932,
                          },
                          {
                            key: 'accessoire_videoprojecteur',
                            count: 893,
                          },
                          {
                            key: 'objectif_et_flash',
                            count: 887,
                          },
                          {
                            key: 'batterie_alimentation_appareil_photo',
                            count: 547,
                          },
                          {
                            key: 'accessoire_camescope',
                            count: 530,
                          },
                          {
                            key: 'samsung',
                            count: 436,
                          },
                          {
                            key: 'satellite',
                            count: 401,
                          },
                          {
                            key: 'housse',
                            count: 257,
                          },
                          {
                            key: 'lunettes_3d',
                            count: 208,
                          },
                          {
                            key: 'tnt',
                            count: 200,
                          },
                          {
                            key: 'lg',
                            count: 175,
                          },
                          {
                            key: 'sony',
                            count: 136,
                          },
                          {
                            key: 'pieces_detachees_tv_hi_fi',
                            count: 92,
                          },
                          {
                            key: 'dvd_et_blu_ray',
                            count: 88,
                          },
                          {
                            key: 'webcam_skype_pour_tv',
                            count: 37,
                          },
                          {
                            key: 'batterie_alimentation_camera',
                            count: 31,
                          },
                          {
                            key: 'batterie_camescope',
                            count: 30,
                          },
                          {
                            key: 'batterie_alimentation_photo_compatible',
                            count: 17,
                          },
                          {
                            key: 'autres_accessoires_camescope',
                            count: 15,
                          },
                          {
                            key: 'lecteur_enregistreur_dvd_bluray',
                            count: 7,
                          },
                          {
                            key: 'poignee_d_alimentation',
                            count: 7,
                          },
                          {
                            key: 'tous_les_tv_ecrans_plats',
                            count: 3,
                          },
                          {
                            key: 'grundig',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Livre',
                  count: 299442,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Petits prix et bonnes affaires',
                            count: 36489,
                          },
                          {
                            key: 'Soldes livre',
                            count: 26313,
                          },
                          {
                            key: 'BD et Humour',
                            count: 16156,
                          },
                          {
                            key: "Romans de l'hiver 2018",
                            count: 10702,
                          },
                          {
                            key: 'Roman et Nouvelles',
                            count: 10471,
                          },
                          {
                            key: 'Roman Policier et Thriller',
                            count: 9775,
                          },
                          {
                            key: 'Livre Jeunesse',
                            count: 9757,
                          },
                          {
                            key: 'Manga',
                            count: 7132,
                          },
                          {
                            key: 'Livre Ados et Young adults',
                            count: 5881,
                          },
                          {
                            key: 'Papeterie',
                            count: 5744,
                          },
                          {
                            key: 'Fantasy et Science-Fiction',
                            count: 5092,
                          },
                          {
                            key: 'Coups de coeur Livre',
                            count: 4519,
                          },
                          {
                            key: 'Agendas et calendriers',
                            count: 4441,
                          },
                          {
                            key: 'Tourisme et Voyage',
                            count: 4305,
                          },
                          {
                            key: 'Cuisine et vins',
                            count: 3604,
                          },
                          {
                            key: 'Roman en poche',
                            count: 3508,
                          },
                          {
                            key: 'Sciences humaines',
                            count: 3237,
                          },
                          {
                            key: "Livres d'occasion",
                            count: 2483,
                          },
                          {
                            key: 'Meilleures ventes Livre',
                            count: 2337,
                          },
                          {
                            key: 'Histoire',
                            count: 2294,
                          },
                          {
                            key: 'Scolaire et soutien scolaire',
                            count: 2281,
                          },
                          {
                            key: 'Sports, Loisirs, Transports',
                            count: 2049,
                          },
                          {
                            key: 'Meilleures ventes Poche',
                            count: 1422,
                          },
                          {
                            key: 'Nature, Animaux, Jardin',
                            count: 1292,
                          },
                          {
                            key: 'Beaux livres',
                            count: 1140,
                          },
                          {
                            key: 'Biographie Autobiographie',
                            count: 1135,
                          },
                          {
                            key: 'Erotisme (public averti)',
                            count: 930,
                          },
                          {
                            key: 'Entreprise, management',
                            count: 921,
                          },
                          {
                            key: 'Livres audio',
                            count: 833,
                          },
                          {
                            key: 'Dictionnaires et Langues',
                            count: 792,
                          },
                          {
                            key: 'Livres Informatique',
                            count: 670,
                          },
                          {
                            key: 'Droit',
                            count: 552,
                          },
                          {
                            key: 'Blogueurs et Youtubeurs',
                            count: 370,
                          },
                          {
                            key: 'Partitions de Musique',
                            count: 365,
                          },
                          {
                            key: 'Livres introuvables',
                            count: 229,
                          },
                          {
                            key: 'Vente Flash Livres',
                            count: 27,
                          },
                          {
                            key: 'Nouvel An Chinois',
                            count: 3,
                          },
                          {
                            key: "Frissons d'avril",
                            count: 2,
                          },
                          {
                            key: 'Salon du Livre 2017',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'entretien_et_soin_de_la_maison',
                  count: 286251,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'aspirateur',
                            count: 153074,
                          },
                          {
                            key: 'fer_centrale_vapeur',
                            count: 33998,
                          },
                          {
                            key: 'nettoyeur',
                            count: 23759,
                          },
                          {
                            key: 'traitement_de_l_air',
                            count: 17042,
                          },
                          {
                            key: 'chauffage',
                            count: 12709,
                          },
                          {
                            key: 'machine_a_coudre',
                            count: 10349,
                          },
                          {
                            key: 'accessoires',
                            count: 6510,
                          },
                          {
                            key: 'table_centre_de_repassage',
                            count: 5296,
                          },
                          {
                            key: 'ventilateur',
                            count: 3687,
                          },
                          {
                            key: 'pieces_detachees_petit_electromenager',
                            count: 3255,
                          },
                          {
                            key: 'sac_aspirateur',
                            count: 3123,
                          },
                          {
                            key: 'poubelle',
                            count: 2844,
                          },
                          {
                            key: 'robot_nettoyeur',
                            count: 900,
                          },
                          {
                            key: 'chaleur_douce',
                            count: 760,
                          },
                          {
                            key: 'produits_d_entretien_et_de_nettoyage',
                            count: 536,
                          },
                          {
                            key: 'irobot',
                            count: 24,
                          },
                          {
                            key: 'electrolux',
                            count: 20,
                          },
                          {
                            key: 'alimentation_petit_electromenager',
                            count: 19,
                          },
                          {
                            key: 'robot_aspirateur',
                            count: 12,
                          },
                          {
                            key: 'centrale_vapeur',
                            count: 10,
                          },
                          {
                            key: 'rowenta',
                            count: 10,
                          },
                          {
                            key: 'dyson',
                            count: 3,
                          },
                          {
                            key: 'philips',
                            count: 3,
                          },
                          {
                            key: 'aeg',
                            count: 1,
                          },
                          {
                            key: 'air_naturel',
                            count: 1,
                          },
                          {
                            key: 'alpexe',
                            count: 1,
                          },
                          {
                            key: 'amc',
                            count: 1,
                          },
                          {
                            key: 'angel',
                            count: 1,
                          },
                          {
                            key: 'applimo',
                            count: 1,
                          },
                          {
                            key: 'auro',
                            count: 1,
                          },
                          {
                            key: 'bag_n_store',
                            count: 1,
                          },
                          {
                            key: 'bel_vue',
                            count: 1,
                          },
                          {
                            key: 'bernette',
                            count: 1,
                          },
                          {
                            key: 'bionaire',
                            count: 1,
                          },
                          {
                            key: 'black_et_decker',
                            count: 1,
                          },
                          {
                            key: 'blm',
                            count: 1,
                          },
                          {
                            key: 'bosch',
                            count: 1,
                          },
                          {
                            key: 'boutica_design',
                            count: 1,
                          },
                          {
                            key: 'burstenhaus_redecker',
                            count: 1,
                          },
                          {
                            key: 'candy',
                            count: 1,
                          },
                          {
                            key: 'clean_house',
                            count: 1,
                          },
                          {
                            key: 'compactor',
                            count: 1,
                          },
                          {
                            key: 'delonghi',
                            count: 1,
                          },
                          {
                            key: 'dirt_devil_handy',
                            count: 1,
                          },
                          {
                            key: 'ducasa',
                            count: 1,
                          },
                          {
                            key: 'h24living',
                            count: 1,
                          },
                          {
                            key: 'harper',
                            count: 1,
                          },
                          {
                            key: 'helloshop26',
                            count: 1,
                          },
                          {
                            key: 'home',
                            count: 1,
                          },
                          {
                            key: 'honeywell',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'audio_hifi_home_cinema',
                  count: 269230,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'home_cinema',
                            count: 43326,
                          },
                          {
                            key: 'casque_ecouteurs',
                            count: 43087,
                          },
                          {
                            key: 'enceinte_sans_fil_dock',
                            count: 34364,
                          },
                          {
                            key: 'radio_reveil_radio_cd_k7',
                            count: 29508,
                          },
                          {
                            key: 'elements_separes_hifi',
                            count: 26697,
                          },
                          {
                            key: 'chaine_hi_fi',
                            count: 23361,
                          },
                          {
                            key: 'lecteur_mp3_mp4_ipod',
                            count: 10307,
                          },
                          {
                            key: 'enceintes_hi_fi',
                            count: 9543,
                          },
                          {
                            key: 'accessoires',
                            count: 8115,
                          },
                          {
                            key: 'enceintes_home_cinema',
                            count: 5710,
                          },
                          {
                            key: 'sono_lumiere_dj',
                            count: 5084,
                          },
                          {
                            key: 'autoradio_haut_parleurs',
                            count: 3828,
                          },
                          {
                            key: 'piles_et_chargeur',
                            count: 3533,
                          },
                          {
                            key: 'connectique_audio_et_video',
                            count: 2413,
                          },
                          {
                            key: 'dictaphone',
                            count: 2057,
                          },
                          {
                            key: 'multiroom',
                            count: 1548,
                          },
                          {
                            key: 'pieds_et_supports_d_enceinte',
                            count: 1146,
                          },
                          {
                            key: 'radio_cd',
                            count: 716,
                          },
                          {
                            key: 'l_univers_enfant_et_junior',
                            count: 616,
                          },
                          {
                            key: 'housse_et_protection',
                            count: 110,
                          },
                          {
                            key: 'batterie_baladeur_audio_compatible',
                            count: 5,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Ventes Flash Mails',
                  count: 162564,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Ventes Flash',
                            count: 162505,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Musique',
                  count: 131896,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes musique',
                            count: 38951,
                          },
                          {
                            key: 'Vinyles',
                            count: 18616,
                          },
                          {
                            key: 'Bon Plan : 4 CD = 20 ?',
                            count: 13455,
                          },
                          {
                            key: 'Les 10 albums du mois',
                            count: 2754,
                          },
                          {
                            key: 'Hard Rock, Metal',
                            count: 2557,
                          },
                          {
                            key: 'Musique Classique',
                            count: 1847,
                          },
                          {
                            key: 'Petits prix Musique',
                            count: 1531,
                          },
                          {
                            key: 'Rap',
                            count: 1527,
                          },
                          {
                            key: 'Partitions et instruments de musique',
                            count: 1501,
                          },
                          {
                            key: 'Jazz, Blues',
                            count: 1409,
                          },
                          {
                            key: 'Meilleures ventes musique',
                            count: 1285,
                          },
                          {
                            key: 'Musique enfants',
                            count: 951,
                          },
                          {
                            key: 'Compilations, Dance, Divers',
                            count: 947,
                          },
                          {
                            key: 'Electro',
                            count: 811,
                          },
                          {
                            key: "CD, Vinyles ... d'occasion",
                            count: 766,
                          },
                          {
                            key: 'Musiques du monde',
                            count: 685,
                          },
                          {
                            key: 'DVD et Blu-Ray musicaux',
                            count: 665,
                          },
                          {
                            key: 'Johnny Hallyday',
                            count: 577,
                          },
                          {
                            key: 'T-shirts, posters, goodies',
                            count: 517,
                          },
                          {
                            key: 'Les 10 albums du mois Jazz Classique',
                            count: 498,
                          },
                          {
                            key: 'R&B, Soul, Funk',
                            count: 410,
                          },
                          {
                            key: 'Reggae, Ragga, Roots',
                            count: 241,
                          },
                          {
                            key: 'Coups de coeur Musique',
                            count: 173,
                          },
                          {
                            key: 'Albums Best Of',
                            count: 129,
                          },
                          {
                            key: 'Super Audio CD',
                            count: 129,
                          },
                          {
                            key: 'Goodies',
                            count: 115,
                          },
                          {
                            key: 'Single',
                            count: 82,
                          },
                          {
                            key: 'Les introuvables !',
                            count: 71,
                          },
                          {
                            key: 'Blu-Ray Audio',
                            count: 65,
                          },
                          {
                            key: 'Albums Country',
                            count: 59,
                          },
                          {
                            key: 'Albums Live',
                            count: 34,
                          },
                          {
                            key: 'Bon plan vinyles',
                            count: 21,
                          },
                          {
                            key: '4 CD/DVD = 20 ?',
                            count: 20,
                          },
                          {
                            key: 'Festival We Love Green 2017',
                            count: 7,
                          },
                          {
                            key: 'Best Of : 2 CD = 10 ?',
                            count: 4,
                          },
                          {
                            key: 'Classique & Jazz: 2 CD=10?',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'beaute_forme_et_sante',
                  count: 129050,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'coiffure',
                            count: 24075,
                          },
                          {
                            key: 'soin_sante',
                            count: 16217,
                          },
                          {
                            key: 'tondeuse',
                            count: 16142,
                          },
                          {
                            key: 'lumiere_et_ambiance',
                            count: 13916,
                          },
                          {
                            key: 'epilateur',
                            count: 11543,
                          },
                          {
                            key: 'hygiene_dentaire',
                            count: 10962,
                          },
                          {
                            key: 'rasoir_homme',
                            count: 9264,
                          },
                          {
                            key: 'soin_corps_et_visage',
                            count: 6190,
                          },
                          {
                            key: 'soin_bien_etre',
                            count: 4310,
                          },
                          {
                            key: 'accessoires',
                            count: 4207,
                          },
                          {
                            key: 'massage',
                            count: 3603,
                          },
                          {
                            key: 'soin_mains_et_pieds',
                            count: 2368,
                          },
                          {
                            key: 'sante_forme_connectee',
                            count: 321,
                          },
                          {
                            key: 'soin_corporel',
                            count: 221,
                          },
                          {
                            key: 'coffret_cadeau',
                            count: 183,
                          },
                          {
                            key: 'bien_etre_relaxation',
                            count: 172,
                          },
                          {
                            key: 'soin_du_visage',
                            count: 14,
                          },
                          {
                            key: 'soin_capilaire',
                            count: 8,
                          },
                          {
                            key: 'babyliss',
                            count: 5,
                          },
                          {
                            key: 'sante',
                            count: 3,
                          },
                          {
                            key: 'beautelive',
                            count: 2,
                          },
                          {
                            key: 'braun',
                            count: 2,
                          },
                          {
                            key: 'jawbone',
                            count: 2,
                          },
                          {
                            key: 'joycare',
                            count: 2,
                          },
                          {
                            key: 'panasonic',
                            count: 2,
                          },
                          {
                            key: 'air_naturel',
                            count: 1,
                          },
                          {
                            key: 'avidsen',
                            count: 1,
                          },
                          {
                            key: 'babylisspro',
                            count: 1,
                          },
                          {
                            key: 'bresser',
                            count: 1,
                          },
                          {
                            key: 'byphasse',
                            count: 1,
                          },
                          {
                            key: 'dealstore',
                            count: 1,
                          },
                          {
                            key: 'epilation',
                            count: 1,
                          },
                          {
                            key: 'garmin',
                            count: 1,
                          },
                          {
                            key: 'generik',
                            count: 1,
                          },
                          {
                            key: 'homcom',
                            count: 1,
                          },
                          {
                            key: 'ht',
                            count: 1,
                          },
                          {
                            key: 'i_tech',
                            count: 1,
                          },
                          {
                            key: 'indola',
                            count: 1,
                          },
                          {
                            key: 'jocca',
                            count: 1,
                          },
                          {
                            key: 'konad_nail_art',
                            count: 1,
                          },
                          {
                            key: 'laica',
                            count: 1,
                          },
                          {
                            key: 'lbmtech',
                            count: 1,
                          },
                          {
                            key: 'lytess',
                            count: 1,
                          },
                          {
                            key: 'nateosante',
                            count: 1,
                          },
                          {
                            key: 'opi',
                            count: 1,
                          },
                          {
                            key: 'original',
                            count: 1,
                          },
                          {
                            key: 'revlon',
                            count: 1,
                          },
                          {
                            key: 'rowenta',
                            count: 1,
                          },
                          {
                            key: 'royal_thermes',
                            count: 1,
                          },
                          {
                            key: 'sanex',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'meuble',
                  count: 84632,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'salon_et_salle_a_manger',
                            count: 18747,
                          },
                          {
                            key: 'canape',
                            count: 17590,
                          },
                          {
                            key: 'lit',
                            count: 10242,
                          },
                          {
                            key: 'rangement',
                            count: 9833,
                          },
                          {
                            key: 'meuble_de_bureau',
                            count: 9427,
                          },
                          {
                            key: 'salle_de_bain',
                            count: 5596,
                          },
                          {
                            key: 'cuisine',
                            count: 4539,
                          },
                          {
                            key: 'fauteuil_pouf',
                            count: 2430,
                          },
                          {
                            key: 'chambre',
                            count: 1887,
                          },
                          {
                            key: 'chaise_et_tabouret',
                            count: 1669,
                          },
                          {
                            key: 'accessoires',
                            count: 1232,
                          },
                          {
                            key: 'clic_clac_bz',
                            count: 703,
                          },
                          {
                            key: 'univers_enfant',
                            count: 313,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Son, hifi, lecteur MP3',
                  count: 70351,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes SON, Casques, Enceintes',
                            count: 29066,
                          },
                          {
                            key: 'Enceinte, Dock',
                            count: 10270,
                          },
                          {
                            key: 'Toutes nos offres Son',
                            count: 8663,
                          },
                          {
                            key: 'Lecteur MP3, MP4',
                            count: 4562,
                          },
                          {
                            key: 'iPod',
                            count: 2542,
                          },
                          {
                            key: 'Meilleures Ventes Son, hifi, lecteur MP3',
                            count: 831,
                          },
                          {
                            key: 'Petit Son',
                            count: 480,
                          },
                          {
                            key: 'Boutique Beats',
                            count: 222,
                          },
                          {
                            key: "Son d'occasion",
                            count: 112,
                          },
                          {
                            key: 'Offres partenaires',
                            count: 89,
                          },
                          {
                            key: 'Boutique Sonos',
                            count: 49,
                          },
                          {
                            key: 'Boutique Marshall',
                            count: 33,
                          },
                          {
                            key: 'Black Friday Son',
                            count: 32,
                          },
                          {
                            key: 'Boutique Sennheiser',
                            count: 30,
                          },
                          {
                            key: 'Saint Valentin Son',
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Enfants, jouets',
                  count: 50446,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes jouets',
                            count: 21570,
                          },
                          {
                            key: '9 - 12 ans',
                            count: 2354,
                          },
                          {
                            key: 'Jouets pas chers et Promotions',
                            count: 1905,
                          },
                          {
                            key: 'Tout-petits',
                            count: 1617,
                          },
                          {
                            key: '6 - 9 ans',
                            count: 1447,
                          },
                          {
                            key: '3 - 6 ans',
                            count: 1333,
                          },
                          {
                            key: 'Peluches et Doudous',
                            count: 1167,
                          },
                          {
                            key: 'Funko Pop',
                            count: 1163,
                          },
                          {
                            key: 'Beyblade',
                            count: 1120,
                          },
                          {
                            key: 'Plus de 12 ans',
                            count: 890,
                          },
                          {
                            key: 'Notre univers Playmobil',
                            count: 713,
                          },
                          {
                            key: 'Star Wars',
                            count: 646,
                          },
                          {
                            key: 'Jeux de plein air',
                            count: 615,
                          },
                          {
                            key: 'Jouets pour filles',
                            count: 582,
                          },
                          {
                            key: 'Puzzles',
                            count: 540,
                          },
                          {
                            key: 'Harry Potter',
                            count: 397,
                          },
                          {
                            key: 'Jeux de construction',
                            count: 396,
                          },
                          {
                            key: 'Notre univers Disney',
                            count: 379,
                          },
                          {
                            key: 'Ravensburger',
                            count: 314,
                          },
                          {
                            key: 'Djeco',
                            count: 220,
                          },
                          {
                            key: 'Jouets en bois',
                            count: 198,
                          },
                          {
                            key: "Jeux d'imitation",
                            count: 184,
                          },
                          {
                            key: 'Minecraft',
                            count: 178,
                          },
                          {
                            key: 'Robots et compagnons interactifs',
                            count: 160,
                          },
                          {
                            key: 'Vtech',
                            count: 135,
                          },
                          {
                            key: 'Anniversaire enfant',
                            count: 132,
                          },
                          {
                            key: "Jouets d'occasion",
                            count: 126,
                          },
                          {
                            key: 'Leapfrog',
                            count: 126,
                          },
                          {
                            key: 'Asmodee',
                            count: 120,
                          },
                          {
                            key: 'Peppa Pig',
                            count: 102,
                          },
                          {
                            key: 'Meilleures ventes jeux jouets',
                            count: 95,
                          },
                          {
                            key: 'Paw Patrol',
                            count: 90,
                          },
                          {
                            key: 'Sylvanian Families',
                            count: 87,
                          },
                          {
                            key: 'Tablette Tactile pour Enfant',
                            count: 79,
                          },
                          {
                            key: 'Miraculous Ladybug',
                            count: 71,
                          },
                          {
                            key: 'Offres de remboursement',
                            count: 71,
                          },
                          {
                            key: 'Reine des neiges',
                            count: 68,
                          },
                          {
                            key: 'Batman',
                            count: 64,
                          },
                          {
                            key: 'Masha et Michka',
                            count: 63,
                          },
                          {
                            key: 'Skylanders',
                            count: 58,
                          },
                          {
                            key: 'Sylvanian, Petshop et autres mini-univers',
                            count: 56,
                          },
                          {
                            key: 'Yo-kai Watch',
                            count: 55,
                          },
                          {
                            key: 'Transformers',
                            count: 53,
                          },
                          {
                            key: 'Barbie',
                            count: 51,
                          },
                          {
                            key: 'Barbapapa',
                            count: 49,
                          },
                          {
                            key: 'Schtroumpfs',
                            count: 46,
                          },
                          {
                            key: 'Mickey Mouse',
                            count: 44,
                          },
                          {
                            key: 'Barbie, Monster High, Disney Princesses',
                            count: 43,
                          },
                          {
                            key: 'Minnie',
                            count: 43,
                          },
                          {
                            key: 'Monster High',
                            count: 43,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'objets_connectes',
                  count: 46400,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'montre_bracelet_connecte',
                            count: 20997,
                          },
                          {
                            key: 'securite_de_la_maison',
                            count: 12590,
                          },
                          {
                            key: 'drone_robot',
                            count: 6153,
                          },
                          {
                            key: 'ampoules_connectees',
                            count: 1799,
                          },
                          {
                            key: 'accessoires',
                            count: 1738,
                          },
                          {
                            key: 'confort_energie',
                            count: 836,
                          },
                          {
                            key: 'balise_gps_connecte',
                            count: 237,
                          },
                          {
                            key: 'capteur_pour_plantes',
                            count: 18,
                          },
                          {
                            key: 'capteur_connecte_sport',
                            count: 17,
                          },
                          {
                            key: 'securite_connectee',
                            count: 13,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'bricolage',
                  count: 33734,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'evier_et_robinet_de_cuisine',
                            count: 10491,
                          },
                          {
                            key: 'chauffage_fixe',
                            count: 7295,
                          },
                          {
                            key: 'alarme_et_videosurveillance',
                            count: 4092,
                          },
                          {
                            key: 'ampoules_eclairage',
                            count: 2568,
                          },
                          {
                            key: 'sonnette_et_interphone',
                            count: 1301,
                          },
                          {
                            key: 'poele_a_bois_granule_petrole',
                            count: 1031,
                          },
                          {
                            key: 'accessoires',
                            count: 1000,
                          },
                          {
                            key: 'douche_et_baignoire',
                            count: 955,
                          },
                          {
                            key: 'vasque_lavabo_et_robinet',
                            count: 780,
                          },
                          {
                            key: 'bricolage',
                            count: 741,
                          },
                          {
                            key: 'securite_incendie',
                            count: 656,
                          },
                          {
                            key: 'chauffage_mobile',
                            count: 604,
                          },
                          {
                            key: 'outillage_electroportatif',
                            count: 470,
                          },
                          {
                            key: 'wc_et_accessoires',
                            count: 296,
                          },
                          {
                            key: 'outillage_a_main',
                            count: 252,
                          },
                          {
                            key:
                              'accessoires_et_consommables_pour_outillage_electroportatif',
                            count: 183,
                          },
                          {
                            key: 'meuble_de_cuisine_et_credence',
                            count: 177,
                          },
                          {
                            key: 'echelle_et_echafaudage',
                            count: 124,
                          },
                          {
                            key: 'accessoires_domotique',
                            count: 107,
                          },
                          {
                            key: 'outil_de_mesure',
                            count: 88,
                          },
                          {
                            key: 'machines_d_atelier',
                            count: 82,
                          },
                          {
                            key: 'luminaire_salle_de_bain',
                            count: 79,
                          },
                          {
                            key: 'rangement_des_outils',
                            count: 65,
                          },
                          {
                            key: 'alimentation_outillage',
                            count: 56,
                          },
                          {
                            key: 'pieces_detachees_bricolage',
                            count: 39,
                          },
                          {
                            key: 'luminaire_de_cuisine',
                            count: 36,
                          },
                          {
                            key: 'pistolet_a_colle_et_agrafeuse',
                            count: 30,
                          },
                          {
                            key: 'amenagement_de_l_atelier',
                            count: 16,
                          },
                          {
                            key: 'pinceau_rouleau_peinture',
                            count: 16,
                          },
                          {
                            key: 'construction_menuiserie',
                            count: 8,
                          },
                          {
                            key: 'travaux_a_domicile',
                            count: 3,
                          },
                          {
                            key: 'remorque_portage',
                            count: 2,
                          },
                          {
                            key: 'masquage_et_protection',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'bons_plans',
                  count: 32361,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'piles_alimentation',
                            count: 96,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'sports_loisirs',
                  count: 28673,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'glisse_urbaine',
                            count: 11954,
                          },
                          {
                            key: 'bagagerie',
                            count: 4344,
                          },
                          {
                            key: 'appareil_de_fitness',
                            count: 4255,
                          },
                          {
                            key: 'accessoires_instrument_musique',
                            count: 1311,
                          },
                          {
                            key: 'jeux_de_cafe',
                            count: 1042,
                          },
                          {
                            key: 'velo',
                            count: 818,
                          },
                          {
                            key: 'appareil_de_musculation',
                            count: 695,
                          },
                          {
                            key: 'montres',
                            count: 653,
                          },
                          {
                            key: 'vehicule_enfant',
                            count: 490,
                          },
                          {
                            key: 'sport_et_fitness',
                            count: 426,
                          },
                          {
                            key: 'accessoires',
                            count: 345,
                          },
                          {
                            key: 'trottinette_skate_rollers',
                            count: 246,
                          },
                          {
                            key: 'jeux_de_plein_air',
                            count: 230,
                          },
                          {
                            key: 'randonnee_trail',
                            count: 189,
                          },
                          {
                            key: 'dj_accessoires_soirees',
                            count: 166,
                          },
                          {
                            key: 'claviers_et_pianos',
                            count: 160,
                          },
                          {
                            key: 'maroquinerie',
                            count: 153,
                          },
                          {
                            key: 'guitares_et_basses',
                            count: 72,
                          },
                          {
                            key: 'accessoire_velo',
                            count: 69,
                          },
                          {
                            key: 'accessoires_de_mode',
                            count: 61,
                          },
                          {
                            key: 'cartable_et_trousse',
                            count: 48,
                          },
                          {
                            key: 'camping',
                            count: 32,
                          },
                          {
                            key: 'articles_de_boxe',
                            count: 19,
                          },
                          {
                            key: 'percussions_et_batteries',
                            count: 14,
                          },
                          {
                            key: 'bois_et_cuivres',
                            count: 4,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'literie',
                  count: 25422,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'matelas',
                            count: 12966,
                          },
                          {
                            key: 'matelas_sommier',
                            count: 7314,
                          },
                          {
                            key: 'sommier',
                            count: 3220,
                          },
                          {
                            key: 'couette_et_oreiller',
                            count: 1154,
                          },
                          {
                            key: 'literie_relaxation',
                            count: 63,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'decoration_et_art_de_la_table',
                  count: 23654,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'luminaire_interieur',
                            count: 7375,
                          },
                          {
                            key: 'linge_de_lit',
                            count: 2245,
                          },
                          {
                            key: 'the_et_cafe',
                            count: 2165,
                          },
                          {
                            key: 'couverts',
                            count: 2041,
                          },
                          {
                            key: 'tapis',
                            count: 1737,
                          },
                          {
                            key: 'vaisselle',
                            count: 1717,
                          },
                          {
                            key: 'deco_et_art_de_la_table',
                            count: 1488,
                          },
                          {
                            key: 'linge_de_maison',
                            count: 1285,
                          },
                          {
                            key: 'miroir',
                            count: 1016,
                          },
                          {
                            key: 'verrerie',
                            count: 847,
                          },
                          {
                            key: 'ustensile',
                            count: 388,
                          },
                          {
                            key: 'tableau',
                            count: 305,
                          },
                          {
                            key: 'linge_de_table',
                            count: 220,
                          },
                          {
                            key: 'vin_et_cocktail',
                            count: 192,
                          },
                          {
                            key: 'bougie_et_senteur',
                            count: 150,
                          },
                          {
                            key: 'decoration_de_noel',
                            count: 124,
                          },
                          {
                            key: 'linge_de_bain',
                            count: 73,
                          },
                          {
                            key: 'sticker',
                            count: 63,
                          },
                          {
                            key: 'accessoires',
                            count: 54,
                          },
                          {
                            key: 'objet_de_decoration',
                            count: 32,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'console_jeux_gaming_pc',
                  count: 17033,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'console_de_jeu',
                            count: 5553,
                          },
                          {
                            key: 'gaming_pc',
                            count: 2924,
                          },
                          {
                            key: 'accessoire_console_de_jeu',
                            count: 2198,
                          },
                          {
                            key: 'barrette_memoire_et_carte',
                            count: 2142,
                          },
                          {
                            key: 'jeu_video',
                            count: 2050,
                          },
                          {
                            key: 'realite_virtuelle',
                            count: 1107,
                          },
                          {
                            key: 'accessoire_wii',
                            count: 112,
                          },
                          {
                            key: 'accessoire_xbox_360',
                            count: 99,
                          },
                          {
                            key: 'accessoire_ps3',
                            count: 45,
                          },
                          {
                            key: 'accessoires',
                            count: 31,
                          },
                          {
                            key: 'univers_ps4',
                            count: 25,
                          },
                          {
                            key: 'accessoire_3ds',
                            count: 11,
                          },
                          {
                            key: 'accessoire_wii_u',
                            count: 10,
                          },
                          {
                            key: 'univers_wii',
                            count: 4,
                          },
                          {
                            key: 'univers_ps3',
                            count: 3,
                          },
                          {
                            key: 'univers_ps_vita',
                            count: 3,
                          },
                          {
                            key: 'univers_xbox_one',
                            count: 2,
                          },
                          {
                            key: 'univers_ds',
                            count: 1,
                          },
                          {
                            key: 'univers_wii_u',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Bagagerie',
                  count: 15880,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes Bagagerie',
                            count: 10350,
                          },
                          {
                            key: 'Ventes flash bagagerie',
                            count: 1916,
                          },
                          {
                            key: 'Valise et sac de voyage',
                            count: 1117,
                          },
                          {
                            key: 'Par marque',
                            count: 588,
                          },
                          {
                            key: 'Maroquinerie',
                            count: 384,
                          },
                          {
                            key: 'Bon plan Samsonite -50%',
                            count: 328,
                          },
                          {
                            key: 'Bon plan Delsey -45%',
                            count: 167,
                          },
                          {
                            key: 'Accessoires de voyage',
                            count: 138,
                          },
                          {
                            key: 'Nos offres partenaires bagagerie',
                            count: 102,
                          },
                          {
                            key: 'Sac de courses et cabas',
                            count: 93,
                          },
                          {
                            key: 'Bagage business',
                            count: 89,
                          },
                          {
                            key: 'Bon plan American Tourister -50%',
                            count: 42,
                          },
                          {
                            key: 'Bon plan Parkland -40%',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Top offres commerciales',
                  count: 15001,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Fnac Occasion',
                            count: 14533,
                          },
                          {
                            key: 'Nos meilleurs Soldes',
                            count: 206,
                          },
                          {
                            key: 'Black Friday !',
                            count: 202,
                          },
                          {
                            key: 'Les Exclusives Web !',
                            count: 12,
                          },
                          {
                            key: 'Top 100 High Tech tendances',
                            count: 12,
                          },
                          {
                            key: 'Saint Valentin : pour Elle, pour Lui',
                            count: 10,
                          },
                          {
                            key: 'Affaires High tech',
                            count: 7,
                          },
                          {
                            key: 'vente-privee - Rosedeal',
                            count: 6,
                          },
                          {
                            key: 'Bonnes Affaires High Tech !',
                            count: 4,
                          },
                          {
                            key: 'Erotisme',
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'puericulture',
                  count: 10740,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'securite_des_pieces_de_vie',
                            count: 2075,
                          },
                          {
                            key: 'biberon_et_accessoires',
                            count: 1457,
                          },
                          {
                            key: 'securite_de_la_chambre_de_bebe',
                            count: 1360,
                          },
                          {
                            key: 'accessoire_repas_de_bebe',
                            count: 1078,
                          },
                          {
                            key: 'poussette_et_accessoires',
                            count: 620,
                          },
                          {
                            key: 'siege_auto',
                            count: 591,
                          },
                          {
                            key: 'couchage_de_bebe',
                            count: 336,
                          },
                          {
                            key: 'table_a_langer',
                            count: 304,
                          },
                          {
                            key: 'soin_et_bien_etre_de_bebe',
                            count: 286,
                          },
                          {
                            key: 'chaise_haute_et_rehausseur',
                            count: 268,
                          },
                          {
                            key: 'tapis_d_eveil_et_parc_bebe',
                            count: 243,
                          },
                          {
                            key: 'peluche_et_sucette',
                            count: 242,
                          },
                          {
                            key: 'accessoires_salle_de_bain_bebe',
                            count: 219,
                          },
                          {
                            key: 'mobilier_chambre_de_bebe',
                            count: 190,
                          },
                          {
                            key: 'decoration_chambre_de_bebe',
                            count: 183,
                          },
                          {
                            key: 'allaitement',
                            count: 154,
                          },
                          {
                            key: 'repose_bebe',
                            count: 145,
                          },
                          {
                            key: 'linge_de_lit_bebe',
                            count: 121,
                          },
                          {
                            key: 'porteur_et_trotteur',
                            count: 76,
                          },
                          {
                            key: 'couche',
                            count: 62,
                          },
                          {
                            key: 'jouets_bebe',
                            count: 53,
                          },
                          {
                            key: 'porte_bebe',
                            count: 44,
                          },
                          {
                            key: 'bain_de_bebe',
                            count: 43,
                          },
                          {
                            key: 'livre_et_album_photo',
                            count: 35,
                          },
                          {
                            key: 'cadeaux_de_naissance',
                            count: 23,
                          },
                          {
                            key: 'accessoires',
                            count: 11,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'E-cartes et coffrets cadeaux',
                  count: 9055,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'E-cartes cadeaux Fnac',
                            count: 4677,
                          },
                          {
                            key: 'Coffrets cadeaux Smartbox',
                            count: 605,
                          },
                          {
                            key: 'Coffrets cadeaux Wonderbox',
                            count: 452,
                          },
                          {
                            key: 'Coffrets cadeaux gastronomie',
                            count: 59,
                          },
                          {
                            key: 'Coffrets cadeaux moins de 50 ?',
                            count: 53,
                          },
                          {
                            key: 'Coffrets cadeaux pour couple',
                            count: 31,
                          },
                          {
                            key: 'Coffrets cadeaux sport et aventure',
                            count: 25,
                          },
                          {
                            key: 'Coffrets cadeaux week-end amoureux',
                            count: 13,
                          },
                          {
                            key: 'Coffrets cadeaux Dakotabox',
                            count: 10,
                          },
                          {
                            key: 'Coffrets cadeaux atypiques',
                            count: 10,
                          },
                          {
                            key: 'Coffrets cadeaux pour homme',
                            count: 10,
                          },
                          {
                            key: 'Meilleures ventes coffrets cadeaux',
                            count: 9,
                          },
                          {
                            key: 'Coffrets cadeaux pour femme',
                            count: 8,
                          },
                          {
                            key: 'Coffrets cadeaux luxe',
                            count: 4,
                          },
                          {
                            key: 'Offre Coffrets Wonderbox + Deezer Premium+',
                            count: 4,
                          },
                          {
                            key: 'Coffrets cadeaux Vivabox',
                            count: 3,
                          },
                          {
                            key: 'Coffrets cadeaux massage',
                            count: 3,
                          },
                          {
                            key: 'Smartbox',
                            count: 2,
                          },
                          {
                            key: 'Coffrets cadeaux anniversaire',
                            count: 1,
                          },
                          {
                            key: 'Coffrets cadeaux plus de 300 ?',
                            count: 1,
                          },
                          {
                            key: 'Coffrets cadeaux pour enfant',
                            count: 1,
                          },
                          {
                            key: 'Coffrets cadeaux week-end insolite',
                            count: 1,
                          },
                          {
                            key: 'Les offres coffrets cadeaux du moment',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'jardin',
                  count: 6981,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'mobilier_de_jardin',
                            count: 2040,
                          },
                          {
                            key: 'luminaire_exterieur',
                            count: 1621,
                          },
                          {
                            key: 'serre_et_abri_de_jardin',
                            count: 402,
                          },
                          {
                            key: 'parasol_chauffant_brasero',
                            count: 376,
                          },
                          {
                            key: 'outil_a_moteur',
                            count: 328,
                          },
                          {
                            key: 'piscine_et_balneo',
                            count: 328,
                          },
                          {
                            key: 'ombrage_parasol_tonnelle',
                            count: 315,
                          },
                          {
                            key: 'jardin_d_interieur',
                            count: 218,
                          },
                          {
                            key: 'pompe_et_filtre',
                            count: 218,
                          },
                          {
                            key: 'outil_de_jardin',
                            count: 159,
                          },
                          {
                            key: 'bassin_et_fontaine',
                            count: 130,
                          },
                          {
                            key: 'arrosage',
                            count: 105,
                          },
                          {
                            key: 'nettoyage_de_piscine',
                            count: 98,
                          },
                          {
                            key: 'jardinage',
                            count: 94,
                          },
                          {
                            key: 'accessoires',
                            count: 79,
                          },
                          {
                            key: 'tondeuse_a_gazon',
                            count: 68,
                          },
                          {
                            key: 'sauna',
                            count: 64,
                          },
                          {
                            key: 'accessoire_de_piscine',
                            count: 57,
                          },
                          {
                            key: 'baignade_et_jeux',
                            count: 56,
                          },
                          {
                            key: 'cloture_occultation',
                            count: 51,
                          },
                          {
                            key: 'decoration_du_jardin',
                            count: 32,
                          },
                          {
                            key: 'liner_chauffage_bache_piscine',
                            count: 31,
                          },
                          {
                            key: 'produit_d_entretien_piscine',
                            count: 17,
                          },
                          {
                            key: 'construction_et_piece_a_sceller',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Bricolage',
                  count: 6617,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes : Bricolage',
                            count: 2714,
                          },
                          {
                            key: 'Les Bons plans Bricolage',
                            count: 2255,
                          },
                          {
                            key: 'Par marque',
                            count: 562,
                          },
                          {
                            key: 'Plomberie et sanitaire',
                            count: 235,
                          },
                          {
                            key: 'Bons plans partenaires bricolage',
                            count: 193,
                          },
                          {
                            key: 'Chauffage et climatisation',
                            count: 89,
                          },
                          {
                            key: 'Manutention et rangement',
                            count: 86,
                          },
                          {
                            key: "Bon plan Carrera jusqu'au 20/02",
                            count: 49,
                          },
                          {
                            key: 'Quincaillerie et fixation',
                            count: 39,
                          },
                          {
                            key: 'Equipement de protection',
                            count: 31,
                          },
                          {
                            key: "Bon plan Karcher jusqu'au 20/02",
                            count: 21,
                          },
                          {
                            key: "Bon plan Ryobi AEG jusqu'au 20/02",
                            count: 14,
                          },
                          {
                            key: 'Black Friday bricolage et jardinage',
                            count: 2,
                          },
                          {
                            key: 'Offre de remboursement bricolage',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Jardinage',
                  count: 4952,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Soldes : jardinage',
                            count: 3184,
                          },
                          {
                            key: 'Les bons plans Jardinage',
                            count: 638,
                          },
                          {
                            key: 'Mobilier de jardin',
                            count: 517,
                          },
                          {
                            key: 'Bons plans partenaires jardin',
                            count: 194,
                          },
                          {
                            key: 'Les marques Jardin',
                            count: 101,
                          },
                          {
                            key: 'Piscine et jacuzzi',
                            count: 101,
                          },
                          {
                            key: 'Arrosage',
                            count: 32,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'espace_apple',
                  count: 3618,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'imprimante',
                            count: 211,
                          },
                          {
                            key: 'applecare',
                            count: 55,
                          },
                          {
                            key: 'iphone_avec_abonnement',
                            count: 40,
                          },
                          {
                            key: 'moniteur_apple',
                            count: 4,
                          },
                          {
                            key: 'macbook',
                            count: 2,
                          },
                          {
                            key: 'accessoires',
                            count: 1,
                          },
                          {
                            key: 'app_cessoires',
                            count: 1,
                          },
                          {
                            key: 'mac_pro',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'maison_literie_jardin',
                  count: 3381,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'animalerie',
                            count: 933,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'jouets',
                  count: 2110,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'jeux_de_construction_et_maquettes',
                            count: 592,
                          },
                          {
                            key: 'figurines',
                            count: 386,
                          },
                          {
                            key: 'jeu_de_societe',
                            count: 338,
                          },
                          {
                            key: 'loisirs_creatifs',
                            count: 315,
                          },
                          {
                            key: 'vehicule_et_circuit',
                            count: 166,
                          },
                          {
                            key: 'eveil_et_decouverte',
                            count: 94,
                          },
                          {
                            key: 'poupee_et_peluche',
                            count: 77,
                          },
                          {
                            key: 'deguisement_fete',
                            count: 46,
                          },
                          {
                            key: 'jeux_d_imitation',
                            count: 32,
                          },
                          {
                            key: 'jeu_pour_tablette_enfant',
                            count: 5,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Logiciels',
                  count: 1373,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Bureautique',
                            count: 197,
                          },
                          {
                            key: 'Utilitaires',
                            count: 37,
                          },
                          {
                            key: 'Toutes les passions sont dans Windows 7 !',
                            count: 18,
                          },
                          {
                            key: 'Educatif et culturel',
                            count: 12,
                          },
                          {
                            key: 'PAO, CAO ,DAO',
                            count: 11,
                          },
                          {
                            key: 'Musique',
                            count: 6,
                          },
                          {
                            key: 'Tout pour le Mac',
                            count: 4,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Animalerie',
                  count: 615,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Chat',
                            count: 160,
                          },
                          {
                            key: 'Chien',
                            count: 131,
                          },
                          {
                            key: 'Poissons - Aquariophilie',
                            count: 106,
                          },
                          {
                            key: 'Rongeur, lapin et petits animaux',
                            count: 50,
                          },
                          {
                            key: 'Reptile et tortue',
                            count: 24,
                          },
                          {
                            key: 'Elevage et agriculture urbaine',
                            count: 20,
                          },
                          {
                            key: 'Oiseau',
                            count: 18,
                          },
                          {
                            key: 'Les marques',
                            count: 14,
                          },
                          {
                            key: 'Bons plans animalerie',
                            count: 6,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Site mobile',
                  count: 163,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Informatique, Tablettes',
                            count: 43,
                          },
                          {
                            key: 'Cartes et coffrets cadeaux',
                            count: 27,
                          },
                          {
                            key: 'Livres, BD',
                            count: 21,
                          },
                          {
                            key: 'Soldes',
                            count: 16,
                          },
                          {
                            key: 'Bricolage, Jardinage',
                            count: 15,
                          },
                          {
                            key: 'Films, DVD, Blu-ray',
                            count: 14,
                          },
                          {
                            key: 'Musique, CD, Vinyles',
                            count: 9,
                          },
                          {
                            key: 'Ventes Flash',
                            count: 6,
                          },
                          {
                            key: 'Sports et loisirs',
                            count: 4,
                          },
                          {
                            key: 'Black Friday',
                            count: 1,
                          },
                          {
                            key: 'Saint Valentin',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Spectacles',
                  count: 30,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'En France et ailleurs',
                            count: 7,
                          },
                          {
                            key: 'Sud-Ouest',
                            count: 6,
                          },
                          {
                            key: 'Sud-Est',
                            count: 4,
                          },
                          {
                            key: 'Nord',
                            count: 3,
                          },
                          {
                            key: 'Est',
                            count: 2,
                          },
                          {
                            key: 'Partout ailleurs',
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'puericulture_jouets',
                  count: 3,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'poupees_et_peluches',
                            count: 1,
                          },
                          {
                            key: 'robot',
                            count: 1,
                          },
                          {
                            key: 'toilette_bebe',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'FNAC GAMING',
                  count: 2,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'MEILLEURE VENTE',
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Guide pop rock',
                  count: 2,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Les indispensables',
                            count: 2,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'Micro-informatique',
                  count: 1,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Consoles de jeux',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
                {
                  key: 'un ete fnac',
                  count: 1,
                  aggregations: {
                    buckets: [
                      {
                        name: 'map_cat2',
                        fieldName: 'cat2',
                        type: 'map',
                        buckets: [
                          {
                            key: 'Les coffrets cinephile',
                            count: 1,
                          },
                        ],
                      },
                    ],
                    metrics: [],
                  },
                },
              ],
            },
          ],
          metrics: [],
        },
      },
    ],
  },
};
