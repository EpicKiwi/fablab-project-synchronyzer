const GhostAdminAPI = require("@tryghost/admin-api")

class GhostApi {

	constructor(){
		this.api = null
	}

	init(url,key) {
		this.api = new GhostAdminAPI({
		  url: url,
		  key: key,
		  version: 'v2'
		});
	}
}

module.exports = new GhostApi()