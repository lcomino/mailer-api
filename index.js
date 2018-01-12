/*
    Dependencies
*/

const restify = require('restify')
const nodemailer = require('nodemailer')
const mongoose = require('./config/db')
const Account = require('./model/Account')(mongoose)


/*
    Methods
*/

const respond = ( req, res, next ) => {        
    res.send('Hello ' + req.params.name)
    next()
}

const createAccount = ( req, res, next ) => {
    let account = new Account({
        name : 'Lucas Comino',
        email : 'lcomino3d@gmail.com',
        password : 'F7cpv6vr',
        active : true,
        smtp_config : {
            host: 'smtp.gmail.com',
            port: 587,            
            user: 'lcomino3d@gmail.com',
            pass: 'F7cpv6vr'            
        }
    })
    
    account.save( ( err ) => {
        if(err)
            return res.json(err)
        
        res.json(account)

        return next()
    })
}

const getAccount = ( req, res, next) => {
    
    Account.findOne({'token_api' : req.query.api_token}, ( err, doc ) => {
        if(err){
            return res.json(err)
            next()
        }

        res.json(doc)
        return next()
    })
}

const sendMail = ( req, res, next ) => {

    Account.findOne({'token_api' : req.query.api_token}, ( err, doc ) => {
        if(err){
            return res.json(err)
            next()
        }

        let account = doc;

        const transporter = nodemailer.createTransport({
            host: account.smtp_config.host,
            port: account.smtp_config.port,
            auth: {
                user: account.smtp_config.user,
                pass: account.smtp_config.pass
            }
        });
        
        const mailOptions = {
            from : '"'+req.params.from.name+'" <'+req.params.from.email+'>',
            to : req.params.to,
            subject : req.params.subject,
            text : req.params.text,
            html : req.params.html || req.params.text 
        }
        
        transporter.sendMail(mailOptions, (error, info) => {
            if(error)
                return res.json(error)
            
            res.json(info)
    
            return next()
        })    
    
        return next()
    })

    
}

/*
    Init Server
*/
const options = {
    name : 'API Mailer',
    verions : '1.0.0'
}

const server = restify.createServer(options)
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

/*
    Endpoints API
*/

server.get('/ping', (req, res, next) => {
    res.send('pong')
    next()
})

server.put('/mail', sendMail)
server.head('/mail', respond)

server.put('/account', createAccount)
server.get('/account', getAccount)

server.listen(process.env.PORT_API_MAILER || 8080, () => {
    console.log('%s na porta %s', server.name, server.url)
})
