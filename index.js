/*
    Dependencies
*/

const restify = require('restify')
const nodemailer = require('nodemailer')
const mongoose = require('./config/db')
const Account = require('./model/Account')(mongoose)
const crypto = require('crypto')


/*
    Methods
*/

const respond = ( req, res, next ) => {        
    res.send('Hello ' + req.params.name)
    next()
}

const generacreCrypto = ( stringToCrypto ) => {
    let secret = stringToCrypto || '';
    let hash = crypto.createHash('sha256')
    hash.update(stringToCrypto)
    return hash.digest('hex')
}

const createAccount = ( req, res, next ) => {
    
    let smtp_config = JSON.parse(req.params.smtp_config)

    let accountObj = {
        name : req.params.name,
        email : req.params.email,
        password : generacreCrypto(req.params.password),
        active : true,
        token_api : generacreCrypto(smtp_config.host + smtp_config.port + smtp_config.user + smtp_config.pass),
        smtp_config : {
            host: smtp_config.host,
            port: smtp_config.port,            
            user: smtp_config.user,
            pass: smtp_config.pass
        }
    }

    let account = new Account(accountObj)
    
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

        let from = JSON.parse(req.params.from);

        let account = doc;

        if(!doc){
            res.json({error: 'Usuário não encontrado.'})
            return next()
        }

        const transporter = nodemailer.createTransport({
            host: account.smtp_config.host,
            port: account.smtp_config.port,
            auth: {
                user: account.smtp_config.user,
                pass: account.smtp_config.pass
            }
        });

        const mailOptions = {
            from : '"'+from.name+'" <'+from.email+'>',
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

server.listen(process.env.PORT_API_MAILER || 3000, () => {
    console.log('%s na porta %s', server.name, server.url)
})
