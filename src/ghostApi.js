const GhostAdminAPI = require("@tryghost/admin-api")

/**
 * Classe singleton de l'API cliente Ghost
 */
class GhostApi {

	constructor(){
		this.api = null
	}

	/**
	 * Initialise le Singleton avec l'URL de l'API et la clé d'API
	 *
	 * @param url String URL Ghost
	 * @param key String Clé d'API ADMIN de Ghost
	 */
	init(url,key) {
		this.api = new GhostAdminAPI({
		  url: url,
		  key: key,
		  version: 'v2'
		});
	}
}

module.exports = new GhostApi()