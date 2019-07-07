const express = require("express")
const settings = require("./settings")
const ghostApi = require("./ghostApi")
const projectsApi = require("./projectsApi")
const synchronizer = require("./synchronizer")
const fs = require("fs")
const hbs = require("handlebars")
const Buffer = require("buffer").Buffer

const dayjs = require("dayjs")
require("dayjs/locale/fr")
dayjs.locale('fr')
dayjs.extend(require('dayjs/plugin/relativeTime'))

const app = express()
const indexPageTemplate = hbs.compile(fs.readFileSync(`${__dirname}/index.hbs`,"utf8"))

let syncstarted = null
let syncstate = "ended"
let syncError = null

// Récupèrer les éléments à changer
app.get("/api/get-changes",async (req,res) => {
	let changes = await synchronizer.getRequiredChanges()
	res.send({
		add: {
			posts: changes.posts.map(el => el.name),
			tags: changes.tags
		}
	})
})

app.get("/api/progression",(req,res) => {
	res.send({
		startedDate: syncstarted,
		state: syncstate,
		syncError: syncError,
		mustWait: syncstarted ? 
		Math.max(0,settings.BETWEEN_SYNC_TIME * 1000 - ((new Date()).getTime() - syncstarted.getTime())) : 0
	})
})

app.get("/api/sync",(req,res) => {

	if(! req.get("Authorization")){
		res.status(401)
		res.send({
			error: "La synchronisation nécéssite un mot de passe",
			started: false
		})
		return;
	}

	let password = Buffer.from(req.get("Authorization"),"base64").toString("utf8")

	if(password != settings.SYNC_PASSWORD){
		res.status(401)
		res.send({
			error: "Mot de passe incorrect",
			started: false
		})
		return;
	}

	if(syncstarted && (new Date()).getTime() - syncstarted.getTime() <= settings.BETWEEN_SYNC_TIME * 1000 ){
		res.status(400)
		res.send({
			startedDate: syncstarted,
			state: syncstate,
			syncError: syncError,
			started: false,
			mustWait: settings.BETWEEN_SYNC_TIME * 1000 - ((new Date()).getTime() - syncstarted.getTime())
		})
		return;
	}

	if(syncstarted != "synchronizing") {

		syncstarted = new Date()
		syncstate = "synchronizing"
		syncError = null

		synchronizer.syncProjects()
			.then(() => {
				syncstate = "ended"
			})
			.catch(e => {
				syncError = e.message()
				syncstate = "error"
			})

		res.send({
			startedDate: syncstarted,
			state: syncstate,
			syncError: syncError,
			started: true
		})

	} else {

		res.send({
			startedDate: syncstarted,
			state: syncstate,
			syncError: syncError,
			started: false
		})

	}

})

app.get("/",async (req,res) => {
	let changes = await synchronizer.getRequiredChanges()

	let mustWait = syncstarted ? 
		Math.max(0,settings.BETWEEN_SYNC_TIME * 1000 - ((new Date()).getTime() - syncstarted.getTime())) : 0

	let content = indexPageTemplate({
		changes,
		lastSync: syncstarted ? dayjs(syncstarted).format("D MMMM YYYY HH:mm:ss") : "",
		relativeLastSync: syncstarted ? dayjs(syncstarted).fromNow() : "",
		mustWait,
		cantSync: mustWait > 0
	})
	res.send(content)
})

settings.requireFullConfig()
ghostApi.init(settings.GHOST_URL,settings.GHOST_ADMIN_API_KEY)
projectsApi.init(settings.DB_LOCATION).then(() => {

	app.listen(settings.PORT,() => console.info(`Listening on *:${settings.PORT}`))

})