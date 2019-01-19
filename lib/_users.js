const helpers=require('./helpers')
const _data=require('./data');
const config=require('./config');
let _users={}

//Description:This method is used to verify that the token sent from the header is valid
//Parameters :id,email 
_users.verifyToken=(id,email,callback)=>{
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
//Description:This handlers is used to create a new user
//Method:POST
//parameters:name,email,password,street,cardType
_users.post=(data,callback)=>{  
    const name=typeof(data.payload.name)=='string'&&data.payload.name.trim().length>0?data.payload.name.trim():false;
    const email=typeof(data.payload.email)=='string'&&data.payload.email.trim().length>0?data.payload.email.trim():false;
    const password=typeof(data.payload.password)=='string'&&data.payload.password.trim().length>0?data.payload.password.trim():false;
    const address=typeof(data.payload.address)=='string'&&data.payload.address.trim().length>0?data.payload.address.trim():false;
    const cardType=typeof(data.payload.cardType)=='string'&&data.payload.cardType.trim().length>0&&config.stagging.acceptedCreditCards.indexOf(data.payload.cardType)>-1?data.payload.cardType.trim():false;
    if(name&&email&&password&&address&&cardType)
    {
       
       _data.read('users',email,(err,data)=>{
           if(err)
           {
                let hashPassword=helpers.hash(password)
                if(hashPassword)
                {
                    const userObject={
                        'name':name,
                        'email':email,
                        'hashPassword':hashPassword,
                        'address':address,
                        'cardType':cardType
                    }
                    _data.create('users',email,userObject,(err)=>{
                        if(!err)
                        {
                            callback(200)
                        }
                        else
                        {
                            callback(500,err)
                        }
                    })

                }

           }
           else
           {
               callback(400,err);
           }
       })
     
    }
    else
    {
        callback(400,{'Error':'Missing required fields'});
    }
}
//Description:This handlers is used to update an existing user
//Method:PUT
//parameters:name(optional),email,password(optional),street(optional),cardType(optional),token
_users.put=(data,callback)=>{
    const name=typeof(data.payload.name)=='string'&&data.payload.name.trim().length>0?data.payload.name.trim():false;
    const email=typeof(data.payload.email)=='string'&&data.payload.email.trim().length>0?data.payload.email.trim():false;
    const password=typeof(data.payload.password)=='string'&&data.payload.password.trim().length>0?data.payload.password.trim():false;
    const address=typeof(data.payload.address)=='string'&&data.payload.address.trim().length>0?data.payload.address.trim():false;
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
    const cardType=typeof(data.payload.cardType)=='string'&&data.payload.cardType.trim().length>0&&config.stagging.acceptedCreditCards.indexOf(data.payload.cardType)>-1?data.payload.cardType.trim():false;
    if(email)
    {
        _users.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
              _data.read('users',email,(err,userData)=>{
                            if(!err&&userData)
                            {
                                if(name)
                                {
                                    userData.name=name;
                                }
                                if(password)
                                {
                                    userData.hashPassword=helpers.hash(password);
                                }
                                if(address)
                                {
                                    userData.address=address
                                }
                                if(cardType)
                                {
                                    userData.cardType=cardType
                                }
                                _data.update('users',email,userData,(err=>{
                                    if(!err)
                                    {
                                        callback(200)
                                    }
                                    else
                                    {
                                        callback(500,{'Error':'Could not update the data'})
                                    }
                                }))
                
                            }
                            else
                            {
                                callback(400,{'Error':'Specified user doesnot exists'})
                            }
              
              })
              
            }
            else
            {
               callback(401,{'Error':'token not verified'})
            
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required fields'})
    }
    
}
//Description:This handlers is used to create a new user
//Method:DELETE
//parameters:email,token
_users.delete=(data,callback)=>{
    const email=typeof(data.queryStringObject.email)=='string'&&data.queryStringObject.email.length>0?data.queryStringObject.email.trim():false;
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
    if(email)
    {
        _users.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                _data.read('users',email,(err,userData)=>{
                    if(!err&&userData)
                    {
                        _data.delete('users',email,(err)=>{
                            if(!err)
                            {
                                callback(200)
                            }
                            else
                            {
                                callback(500,{'Error':'Could not delete users'})
                            }
                        })
                    }
                    else
                    {
                        callback(400,{'Error':'Cannot find user'})
                    }
                })
            }
            else
            {
                callback(401,{'Error':'Token is not verified'})
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required Fields'})
    }
}
//Description:This handlers is used to get details of a  user
//Method:GET
//parameters:email,token
_users.get=(data,callback)=>{
    const email=typeof(data.queryStringObject.email)=='string'&&data.queryStringObject.email.length>0?data.queryStringObject.email.trim():false;
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false;
    if(email)
    {
        _users.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                _data.read('users',email,(err,userData)=>{
                    if(!err&&userData)
                    {
                        callback(200,userData)
                    }
                    else
                    {
                        callback(500,{'Error':'No data Found'})
                    }
                })
            }
            else
            {
                callback(401,{'Error':'Token is not valid'})
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required Fields'})
    }
}

module.exports=_users