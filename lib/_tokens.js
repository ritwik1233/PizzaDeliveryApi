var helpers=require('./helpers');
const _data=require('./data');

let _tokens={}


//Description:This handler is used to create a token
//Parameters:email,password
_tokens.post=(data,callback)=>{
    const email=typeof(data.payload.email)=='string'&&data.payload.email.trim().length>0?data.payload.email.trim():false;
    const password=typeof(data.payload.password)=='string'&&data.payload.password.trim().length>0?data.payload.password.trim():false;
    if(email&&password)
    {
        _data.read('users',email,(err,userData)=>{
            if(!err&&userData)
            {
                var hashPassword=helpers.hash(password);
                if(hashPassword==userData.hashPassword)
                {
                    var tokenID=helpers.createRandomString(20)
                    var expires=Date.now()+1000*60*60;
                    var tokenObject={
                        'id':tokenID,
                        'email':email,
                        'expires':expires
                    }    
                    _data.create('tokens',tokenID,tokenObject,(err)=>{
                        if(!err)
                        {
                            callback(200,tokenObject)
                        }   
                        else
                        {
                            callback(500,{'Error':'Token doesnot exists'})
                        }
                    })
                
                }
                else
                {
                    callback(400,{'Error':'user data does not exists'})
                }
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required fields'})
    }
}
//Descirption:This handler is used to delete a token
//Parameters:id(token id)
_tokens.delete=(data,callback)=>{
    
    var id=typeof(data.queryStringObject.id)=='string'&&data.queryStringObject.id.length==20?data.queryStringObject.id.trim():false; 
    if(id)
    {
        _data.read('tokens',id,(err,data)=>{
            if(!err&&data)
            {
                _data.delete('tokens',id,(err)=>{
                    if(!err)
                    {
                        callback(200)
                    }
                    else
                    {
                        callback(500,{'Error':'Unable to delete token'})
                    }
                })
  
            }
            else
            {
                callback(400,{'Error':'Missing required fields'})
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required fields'})
    }

}
module.exports=_tokens
