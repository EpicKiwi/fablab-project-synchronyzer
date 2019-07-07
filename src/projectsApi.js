const sqlite3 = require('sqlite3')
const util = require("util")

class ProjectsApi {
	constructor(){
		this.sqlite = null
	}

	init(location){
		console.log(`Loading database from ${location}`)
		return new Promise((res,rej) => {
			return this.sqlite = 
			new sqlite3.Database(location,sqlite3.OPEN_READONLY,(e) => {
				if(e) return rej(e)
				return res(e)
			})
		})
	}

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