const Promise = require('bluebird')
const util = require('util')
const Project = require('./../models/projectModel.js')
const Sequelize = require('sequelize')
const sequelize = require('./../../boot/dbConnection.js')

const saveProject = (request, response) => {

	if(!request.body.title || !request.body.author || !request.body.description) {
		response.status(401).json({ "err": "bad request" })
	}
	else {
		const project = Project.build({
			title: request.body.title,
			author: request.body.author,
			description: request.body.description,
			created_at: new Date
		})
		project.save()
		.then((data) => {
    		response.status(200).json({ data })
    	})
    	.catch((err) => {
    		console.log(err)
    		response.status(500).json({ "err":"err" })
    	})
	}
	

}

const getProjects = (request, response) => {
	reqAuthor = request.get("username")
	Project.findAll({
		raw: true,
		where: {
			author: reqAuthor
		}
	})
	.then((data) => {
		console.log(data)
    	response.status(200).json({ data })
    })
    .catch((err) => {
    	console.log(err)
    	response.status(500).json({ "err":"err" })
    })  
}


const getProject = (request, response) => {
	projId = request.params.id
	reqAuthor = request.get("username")
	if(reqAuthor == "admin") {
    	Project.findAll({
		raw: true,
		where: {
			id: projId
		}
		})
		.then((data) => {
    		projects = data
    		response.status(200).json({ projects })
    	})
    	.catch((err) => {
    		console.log(err)
    		response.status(500).json({ "err":"err" })
    	})
	}
	else {
    	Project.findAll({
		raw: true,
		where: {
			id: projId,
			author: reqAuthor
		}
		})
		.then((data) => {
    		projects = data
    		response.status(200).json({ projects })
    	})
    	.catch((err) => {
    		console.log(err)
    		response.status(500).json({ "err":"err" })
    	})
	}
}

const updateProject = (request, response) => {
	doesProjectExist(request.params.id)
		.then((exists) => {
			if (!exists) {
				console.log("resolving with 404")
				response.status(404).end(JSON.stringify({ "err": "project not found" }))
				
			}
			else {
				doesUserHaveAccess(request, response)
				.then(access => {
					if(!access) {
						console.log("responding with 403")
						response.status(403).end(JSON.stringify({ "err": "forbidden" }))
					}
					else {
						executeUpdateProject(request, response)
						.then((err,resp) => {
							console.log(err)
							if(err) {
								response.status(500).end(JSON.stringify({ "err": "an internal error occured" }))
							}
							else {
								response.status(200).end(JSON.stringify({ "success":"success" }))
							}

						})
						.catch(err => {
							console.log(err)
							response.status(500).end(JSON.stringify({ "err": "an internal error occured" }))
						})

					}

				})
				.catch(err => {
					console.log(err)
					response.status(500).end(JSON.stringify({ "err": "an internal error occured" }))
				})
			}
		})
	
}

const executeUpdateProject = (request,response) => {
	project = request.body 
	project.id = request.params.id
	update = {}
	if(project.description) {
		update.description = project.description
	}
	if(project.title) {
		update.title = project.title
	}
	selector = {where: {id: project.id}}
	// knex.raw(util.format("update projects set title='%s', author='%s', description='%s' where id='%s'",project.title,project.author,project.description,project.id))
	return Project.update(update, selector)
    .then((data) => {
    	resp = request.body
    	response.status(200).json({ resp })
    })
    .catch((err) => {
    	response.status(500).json({ "err":"err" })
    })
}




const executeDeleteProjectQuery = (request, response) => {
	//return knex.raw(util.format("delete from projects where id='%s'",request.params.id))
	return Project.destroy({where : {id: request.params.id}})
    .then((data) => {
    	projects = data.rows
    	response.status(200).json({ projects })
    })
    .catch((err) => {
    	response.status(500).json({ "err": err })
    })
}




const deleteProject = (request, response) => {
	doesProjectExist(request.params.id)
		.then((exists) => {
			if (!exists) {
				console.log("resolving with 404")
				response.status(404).end(JSON.stringify({ "err": "project not found" }))
				
			}
			else {
				doesUserHaveAccess(request, response)
				.then(access => {
					if(!access) {
						console.log("responding with 403")
						response.status(403).end(JSON.stringify({ "err": "forbidden" }))
					}
					else {
						executeDeleteProjectQuery(request, response)
						.then((err,resp) => {
							if(err) {
								response.status(500).end(JSON.stringify({ "err": "an internal error occured" }))
							}
							else {
								response.status(200).end(JSON.stringify({ "success":"success" }))
							}

						})
						.catch(err => {
							response.status(500).end(JSON.stringify({ "err": "an internal error occured" }))
						})

					}

				})
				.catch(err => {
					response.status(500).end(JSON.stringify({ "err": "an internal error occured" }))
				})
			}
		})
}

const doesUserHaveAccess = (request, response) => {
	return new Promise((resolve,reject) => {
		return Project.findOne({
			raw:true,
			where: {
				id:request.params.id
			}
		})
    .then((data) => {
    	if(data && data.author == request.get("username") || data && "admin" == request.get("username")) {
    		resolve(true) 
    	}
    	else {
    		resolve(false) 
    	}
    })
    .catch((err) => {
    	console.log("error!!!")
    	reject(err)
    })
	})
}


const doesProjectExist = (id) => {
	return new Promise((resolve,reject) => {
		return Project.findOne({
			raw:true,
			where: {
				id: id
			}
		})
    .then((data) => {
    	if(data) {
    		resolve(true) 
    	}
    	else {
    		resolve(false) 
    	}
    })
    .catch((err) => {
    	reject(err)
    })
	})
}





module.exports = {
  saveProject, getProjects, getProject, updateProject, deleteProject
}






