const ghostApi = require("./ghostApi")
const projectsApi = require("./projectsApi")
const settings = require("./settings")
const fs = require("fs")
const hbs = require("handlebars")
const path = require("path")

const dayjs = require("dayjs")
require("dayjs/locale/fr")
dayjs.locale('fr')

const postTemplate = hbs.compile(fs.readFileSync(`${__dirname}/post-template.hbs`,"utf8"))

async function syncProjects(){

	let changes = await getRequiredChanges()
	let projectTypes = await projectsApi.getProjectTypes()
	let centres = await projectsApi.getCentres()

	console.info("Flushing changes")
	if(changes.tags.length > 0){
		console.info(`New tags : ${changes.tags.join(", ")}`)
	}
	if(changes.posts.length > 0){
		console.info(`New posts : ${changes.posts.map(el => el.name).join(", ")}`)
	}

	////// FLUSH //////

	for(let tag of changes.tags){
		await ghostApi.api.tags.add({name:tag})
		console.log(`Created tag ${tag}`)
	}

	for(let post of changes.posts){

		let data = {
			...post,
			type: projectTypes.find(el => el.id == post.type),
			centre: centres.find(el => el.id == post.centre_id),
			creation_date: post.creation_date ? 
				dayjs(post.creation_date).format("D MMMM YYYY") : null,
			end_date: post.end_date ? 
				dayjs(post.end_date).format("D MMMM YYYY") : null
		}
		let content = postTemplate(data)
		let image = null

		if(post.picture){
			image = await ghostApi.api.images.upload({
				file: path.resolve(settings.PICTURES_BASEPATH,post.picture)
			})
		}
			await ghostApi.api.posts.add({
				title: post.name,
				html: content,
				feature_image: image.url,
				tags: [data.centre.name, `Projet ${data.type.name}`, `Projet #${data.id}`],
				status: "published",
				custom_excerpt: post.short_description
			},{source: 'html'});
		console.log(`Created post ${post.name}`)
	}

}

async function getRequiredChanges(){

	let projects = await projectsApi.getAllProjects()
	let projectTypes = await projectsApi.getProjectTypes()
	let centres = await projectsApi.getCentres()
	
	let ghostTags = await ghostApi.api.tags.browse();
	let ghostPosts = await ghostApi.api.posts.browse();

	let tagsToCreate = []

	projectTypes.forEach(type => {
		let tagName = `Projet ${type.name}`

		if(! ghostTags.find(el => el.name == tagName)){
			tagsToCreate.push(tagName)
		}
	})

	centres.forEach(centre => {
		let tagName = centre.name

		if(! ghostTags.find(el => el.name == tagName)){
			tagsToCreate.push(tagName)
		}
	})

	let postsToCreate = []

	projects.forEach(el => {
		let tagName = `Projet #${el.id}`
		let existantPost = ghostPosts.find(el => el.tags.find(el => el.name == tagName))
		if(! existantPost){
			postsToCreate.push(el)
			if(! ghostTags.find(el => el.name == tagName)){
				tagsToCreate.push(tagName)
			}
		}
	})

	return {posts:postsToCreate,tags:tagsToCreate};
}

module.exports = {
	syncProjects,
	getRequiredChanges
}