/*
    Dependencies
*/

const restify = require('restify')

/*
    Methods
*/

const respond = ( req, res, next ) => {
    res.send('Hello ' + req.params.name)
    next()
}

/*
    Init Server
*/
const options = {
    name : 'API Mailer',
    verions : '1.0.0'
}

const server = restify.createServer(options)

/*
    Endpoints
*/

server.get('/hello/:name', respond)
server.head('/hello/:name', respond)

server.listen(8080, () => {
    console.log('%s na porta %s', server.name, server.url)
})
