const _users=require('./_users');
const _tokens=require('./_tokens');
const _order=require('./_order');
const checkout=require('./checkout');

//handler for handling all the routes
let handlers={};



//Define user routers
handlers.users=(data,callback)=>{
    const acceptableMethods=['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1)
    {
        handlers._users[data.method](data,callback);
    }
    else
    {
        callback(405)
    }
}
//Define users subhandlers
handlers._users=_users




//Define token handler
handlers.tokens=(data,callback)=>{
    const acceptableMethods=['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1)
    {
        handlers._tokens[data.method](data,callback);
    }
    else
    {
        callback(405)
    }
}
//define token subhandlers
handlers._tokens=_tokens



//Define order handlers
handlers.order=(data,callback)=>{
    const acceptableMethods=['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1)
    {
        handlers._order[data.method](data,callback);
    }
    else
    {
        callback(405)
    }
}
//Define order subhandlers
handlers._order=_order



//Define checkout handlers
handlers.checkout=checkout
handlers.notFound=(data,callback)=>{
    callback(404);
}
module.exports=handlers