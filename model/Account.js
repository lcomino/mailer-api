const schema = {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    active: { type: Boolean, default: false },
    token_api : { type: String, default : '' },
    created_at: { type: Date, default: Date.now },
    smtp_config : { 
        host : { type: String },
        port : { type: Number },
        user : { type: String },
        pass : { type: String }
    }
  }

const MODEL_NAME = 'Account'

module.exports = ( mongoose ) => mongoose.model( MODEL_NAME, schema )