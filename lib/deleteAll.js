const _data=require('./data');

let deleteAll={}

deleteAll.verifyToken=(id,email,callback)=>{
    //lookup token
    
    _data.read('tokens',id,(err,tokenData)=>{
        if(!err&&tokenData)
        {
            //check that the token is for the given user and has not expired
            if(tokenData.email==email&&tokenData.expires>Date.now())
            {
                callback(true);
            }
            else
            {   
                callback(false);
            }
        }
        else
        {
            callback(false);
        }
    })

}

//Description:This handler is used to delete all  items in the cart 
//parameters=email
deleteAll.deleteAll=(data,callback)=>{
    if(data.method=='get')
    {
        const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
        const email=typeof(data.queryStringObject.email)=='string'&&data.queryStringObject.email.length>0?data.queryStringObject.email.trim():false;
        deleteAll.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                _data.delete('order',email,(err)=>{
                    if(!err)
                    {
                        callback(200)

                    }
                    else
                    {
                        callback(500,{'Error':'Unable to delete the shopping cart'})
                    }
                })
            }
            else
            {
                callback(401,{'Error':'Token is invalid'})
            }
        })
    }
    else
    {
        callback(400,{'Error':'Invalid rest method'})
    }
    

}
module.exports=deleteAll
