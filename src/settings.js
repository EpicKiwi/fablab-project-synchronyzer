/**
 * Script de gestion des paramètres de l'application
 * @module
 * @type {{GHOST_ADMIN_API_KEY: string, PORT: number, GHOST_URL: string, SYNC_PASSWORD: string, PICTURES_BASEPATH: string, BETWEEN_SYNC_TIME: number, DB_LOCATION: string}}
 */

const settings = {
	GHOST_URL: process.env.GHOST_URL,
	GHOST_ADMIN_API_KEY: process.env.GHOST_ADMIN_API_KEY,
	SYNC_PASSWORD: process.env.SYNC_PASSWORD,
	DB_LOCATION: process.env.DB_LOCATION || `var/db.sqlite`,
	PICTURES_BASEPATH: process.env.PICTURES_BASEPATH || `var`,
	PORT: process.env.PORT || 8080,
	BETWEEN_SYNC_TIME: process.env.BETWEEN_SYNC_TIME || 7200
}

/**
 * Renvoie le nom des paramètres manquants
 *
 * @return {string[]}
 */
function getMissingSettings(){
	let missing = Object.keys(settings).filter(key => ! settings[key])
	return missing
}

/**
 * Vérifie que tout les paramètres disposent d'une valeur ou quitte le programme avec un message d'érreur
 */
function requireFullConfig(){
	let missingKeys = getMissingSettings()
	if(missingKeys.length > 0){
		console.error("Missing ENV variables : "+missingKeys.join(", "))
		process.exit(1)
	}
}

module.exports = settings
module.exports.getMissingSettings = getMissingSettings
module.exports.requireFullConfig = requireFullConfig