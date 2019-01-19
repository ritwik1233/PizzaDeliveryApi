const helpers=require('./helpers');
const _data=require('./data');

//this is used to handle the checkout handler

var checkout=(data,callback)=>{
    //make sure that the method is get
    if(data.method=='get')
    {
        //verify that token exists
        const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
        //verify that the token is valid

        

        _data.read('tokens',token,(err,tokenData)=>{
            if(!err&&tokenData)
            {

                //verify user data for the token
                _data.read('users',tokenData.email,(err,userData)=>{
                    if(!err&&userData)
                    {
                         //read the data from order cart
                    _data.read('order',userData.email,(err,orderData)=>{
                    if(!err&&orderData)
                    {
                        //calculate the total amount
                        var amount=orderData.orders.reduce((acc, val)=>{
                            return acc+val.TotalPrice
                            },0).toString()
                        //call stripe api for payment
                        helpers.payStripe(amount,orderData.email,userData.cardType,(err,data)=>{
                           if(!err)
                           {
                               //Create an email object for mailgun api
                                var emailObject=
                                {
                                    'orderID':helpers.createRandomString(20),
                                    'email':orderData.email,
                                    'totalAmount':amount,
                                   
                               }
                               //call mailgun api
                               helpers.sendMail(emailObject,(err,data)=>{
                                   if(!err)
                                   {
                                       //delete the order cart from the file system
                                       _data.delete('order',emailObject.email,(err)=>{
                                        if(!err)
                                        {
                                            callback(200)
                                        }
                                        else
                                        {
                                            callback(500,{'Error':'Could not update orderDB'})
                                        }
                                       })
                                      
                                   }
                                   else
                                   {
                                       callback(data.status,data)
                                   }
                               })
                           }
                           else
                           {
                            callback(data.status,{'Error':data})
                           }
                       })
                       }
                    else
                    {
                        callback(400,{'Error':'Order data does not exists'})
                    }
                })
                    }
                    else
                    {
                        callback(500,{'Error':'No userdat'})
                    }
                })
               
            }
            else
            {
                callback(400,{'Error':'Token data does not exists'})
            }
        })
    }
    else
    {
         callback(500)
    }
}
module.exports=checkout