/**
 * Script synchronisant les données maintenant
 * @module
 */

const settings = require("./settings")
const ghostApi = require("./ghostApi")
const projectsApi = require("./projectsApi")
const synchronizer = require("./synchronizer")

settings.requireFullConfig()

console.info("Let's begin !")
ghostApi.init(settings.GHOST_URL,settings.GHOST_ADMIN_API_KEY)
projectsApi.init(settings.DB_LOCATION).then(() => {
	synchronizer.syncProjects()
})

