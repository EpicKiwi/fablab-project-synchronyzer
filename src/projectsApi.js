const sqlite3 = require('sqlite3')
const util = require("util")

/**
 * Le singleton de l'API des projets dans la base de données SQLite
 * @hideconstructor
 */
class ProjectsApi {


	constructor(){
        /**
         * Base de données SQlite chargée
         *
         * @name ProjectsApi#sqlite
         * @type sqlite3.Database
         */
		this.sqlite = null
	}


	/**
	 * Initialise le singleton avec la position de la base de données
	 * Cette opération n'est à éfféctuer qu'une fois
	 *
	 * @param location String Emplacement de la base de données SQlite
	 * @return {Promise<void>}
	 */
	init(location){
		console.log(`Loading database from ${location}`)
		return new Promise((res,rej) => {
			return this.sqlite = 
			new sqlite3.Database(location,sqlite3.OPEN_READONLY,(e) => {
				if(e) return rej(e)
				return res()
			})
		})
	}


	/**
	 * Renvoie tout les projets de la base de données
	 * @return {Promise<{ 	id: Number,
							type: Number,
							name: String,
							centre_id: Number,
							short_description: String,
							huge_description: String,
							documentation: String,
							creation_date: String,
							end_date: String,
							picture: String }>}
	 */
	getAllProjects(){
		return new Promise((res,rej) => {
			this.sqlite.all("SELECT * FROM lab_project",(e,r) => {
				if(e) {
					return rej(e)
				}
				res(r)
			})
		})
	}

	/***
	 * Renvoie tout les types de projets
	 *
	 * @return {Promise<{ id: Number, acronym: String, name: String }>}
	 */
	getProjectTypes(){
		return new Promise((res,rej) => {
			this.sqlite.all("SELECT * FROM lab_project_type",(e,r) => {
				if(e) {
					return rej(e)
				}
				res(r)
			})
		})
	}

	/**
	 * Renvoie tout les centres
	 *
	 * @return {Promise<{ id: Number, region: String, name: String }>}
	 */
	getCentres(){
		return new Promise((res,rej) => {
			this.sqlite.all("SELECT * FROM lab_site",(e,r) => {
				if(e) {
					return rej(e)
				}
				res(r)
			})
		})
	}
}

module.exports = new ProjectsApi();