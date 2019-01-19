var helpers=require('./helpers');
const _data=require('./data');

let _order={}
//Description:This method is used to verify the user token
//parameter:id,email
_order.verifyToken=(id,email,callback)=>{
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
//Description:This handler is used to post a new order
//parameters=email,orderItem,Quantity,orderType
_order.post=(data,callback)=>{
    const email=typeof(data.payload.email)=='string'&&data.payload.email.trim().length>0?data.payload.email.trim():false;
    const orderItem=typeof(data.payload.orderItem)=='string'&&data.payload.orderItem.trim().length>0?data.payload.orderItem.trim():false;
    const Quantity=typeof(data.payload.Quantity)=='number'&&data.payload.Quantity>0?data.payload.Quantity:false;
    const orderType=typeof(data.payload.orderType)=='string'&&data.payload.orderType.trim().length>0?data.payload.orderType.trim():false;
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
  //verify the payload parmaters
    if(email&&orderItem&&Quantity&&orderType)
    {
        //verify the token
        _order.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                //read the menu
            _data.read('menu','menu',(err,menuData)=>{
                if(!err&&data)
                {   
                    //get the menu Item
                    var menuItem=menuData.filter(eachData=>{
                        //check the orderitem,and filter it out
                        if(Object.keys(eachData)==orderItem)
                        {
                            return true
                        }
                        else
                        {
                            return false;
                        }
                    }).map(eachData=>{
                        return eachData[orderItem];
                    })[0]
                    if(menuItem!==undefined)
                    {
                        var totalPrice=menuItem.filter(eachValue=>{
                            //check the quantity and filter it out
                            if(Object.keys(eachValue)==orderType)
                            {
                                return true;
                            }
                            else
                            {
                                return false;
                            }
                        }).map(eachData=>{
                            //multiply the price of the item with the quantity
                            return eachData[orderType]*Quantity
                        })
                        //if orderType is valid
                        if(totalPrice.length>0)
                        {
    
                            _data.read('order',email,(err,data)=>{
                                if(err)
                                {
                                    //if data does not exists create new data 
                                    var id=helpers.createRandomString(20);
                                    var orderObject={
                                        'orderID':id,
                                        'orderItem':orderItem,
                                        'TotalPrice':totalPrice[0]        
                                    }
                                    
                                    var orderArray=[orderObject]
                                    
                                    var orderDetails={
                                        'email':email,
                                        'orders':orderArray
                                    }
                                    //create new order data
                                    _data.create('order',email,orderDetails,(err)=>{
                                        if(!err)
                                        {
                                            callback(200)
                                        }
                                        else
                                        {
                                            callback(500,{'Error':'Could not Create data'})
                                        }
                                    })
                                }
                                else
                                {
                                    //update existing data
                                    var id=helpers.createRandomString(20); 
                                    var eachData=data.orders.filter(eachData=>{
                                        if(eachData.orderItem==orderItem)
                                        {
                                            return true;
                                        }
                                        else
                                        {
                                            return false;
                                        }
                                    }).map(eachData=>{
                                        eachData.TotalPrice+=totalPrice[0]
                                        return eachData
                                    })
                                    if(eachData.length>0)
                                    {
                                        //update existing Price
                                        var dataArray=data.orders.map(eachValue=>{
                                            if(eachValue.orderID==eachData.orderID)
                                            {
                                                eachValue.TotalPrice=eachData.TotalPrice
                                            }
                                            return eachValue
                                        })
                                        var orderDetails={
                                            'email':email,
                                            'orders':dataArray
                                        }
                                        _data.update('order',email,orderDetails,(err)=>{
                                            if(!err)
                                            {
                                                callback(200)
                                            }
                                            else
                                            {
                                                callback(500,{'Error':'Could not Create data'})
                                            }
                                        })
                                    }
                                    else
                                    {
                                        //create new data and add to order cart
                                    var orderObject={
                                        'orderID':id,
                                        'orderItem':orderItem,
                                        'TotalPrice':totalPrice[0]        
                                    }
                                    var orderArray=data.orders
                                    orderArray.push(orderObject)
                                    var orderDetails={
                                        'email':email,
                                        'orders':orderArray
                                    }
                                    _data.update('order',email,orderDetails,(err)=>{
                                        if(!err)
                                        {
                                            callback(200)
                                        }
                                        else
                                        {
                                            callback(500,{'Error':'Could not Create data'})
                                        }
                                    })
                                    }
                                    
                                }
                            })
                        }
                        else
                        {
                            callback(400,{'Error':'Pizza size not available'})
                        }
                    }
                    else
                    {
                        callback(400,{'Error':'Item doesnot exists in the menu'})
                    }
                    
                    
                }
                else
                {
                    callback(500,{'Error':'Unable to load the menu'})
                }
            })
            }
            else
            {
                callback(401,{'Error':'Token not authorised'})
            }
        })
        
    }
    else
    {
        callback(400,{'Error':'Missing required fields'})
    }
    
}
//Description:This handler is used to get order cart information
//parameters=email ,token
_order.get=(data,callback)=>{
    var email=typeof(data.queryStringObject.email)=='string'&&data.queryStringObject.email.length>0?data.queryStringObject.email.trim():false;
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
    if(email)
    {
        _order.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                _data.read('order',email,(err,data)=>{
                    if(!err&&data)
                    {
                        callback(200,data)
                    }
                    else
                    {
                        callback(400,{'Error':'Could not find data'})
                    }
                })
            }
            else
            {
                callback(401,{'Error':'Token is not authorised'})
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required fields'})
    }
}
//Description:This handler is used to update an item in the order cart 
//parameters=email ,orderID,Quantity,orderType
_order.put=(data,callback)=>{
    
    var email=typeof(data.payload.email)=='string'&&data.payload.email.length>0?data.payload.email.trim():false;
    var orderID=typeof(data.payload.orderID)=='string'&&data.payload.orderID.trim().length>0?data.payload.orderID.trim():false;
    const Quantity=typeof(data.payload.Quantity)=='number'&&data.payload.Quantity>0?data.payload.Quantity:false;
    const orderType=typeof(data.payload.orderType)=='string'&&data.payload.orderType.trim().length>0?data.payload.orderType.trim():false; 
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
    if(email&&orderID&&Quantity&&orderType)
    {
        //Verify that the token is valid 
        _order.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                //open the order cart
                _data.read('order',email,(err,data)=>{
                    if(!err&&data)
                    {
                        //Extract the json data from the orders array where id is a match 
                        var filterData={};
                                for(var i =0;i<data.orders.length;i++)
                                {
                                    if(data.orders[i].orderID==orderID)
                                    {
                                        filterData=data.orders[i]
                                    }
                                }
                        //open the menu.json file and calculate the totalPrice
                        _data.read('menu','menu',(err,menuData)=>{
                            if(!err&&menuData)
                            {
                                var menuFilter=menuData.filter(eachData=>{
                                    if(Object.keys(eachData)==filterData.orderItem)
                                    {
                                        return true;
                                    }
                                    else
                                    {
                                        return false;
                                    }
                                }).map(eachData=>{
                                    return eachData[filterData.orderItem]
                                })[0].filter(eachValue=>{
                                    if(Object.keys(eachValue)==orderType)
                                    {
                                        return true;
                                    }
                                    else
                                    {
                                        return false;
                                    }
                                })
                                if(menuFilter.length>0)
                                {
                                    //Total Price 
                                    var totalPrice=menuFilter[0][orderType]*Quantity
                                    filterData.TotalPrice+=totalPrice
                                    //update the total Price for that item in the orders array
                                    var orderArray=data.orders.map(eachData=>{
                                        if(eachData.orderID===orderID)
                                        {
                                            eachData.TotalPrice=filterData.TotalPrice
                                        }
                                        return eachData
                                    })
                                    //create a new order details object
                                    var orderDetails={
                                        'email':email,
                                        'orders':orderArray
                                    }
                                    //update the order details
                                    _data.update('order',email,orderDetails,(err)=>{
                                        if(!err)
                                        {
                                            callback(200)
                                        }
                                        else
                                        {
                                            callback(400,{'Error':'Could not update data'})
                                        }
                                    })
                                }
                                else
                                {
                                    callback(400,{'Error':'Invalid Data sent '})
                                }
                               
                            }
                            else
                            {
                                callback(500,{'Error':'Menu data does not exists'})
                            }
                        })
                    }
                    else
                    {
                        callback(400,{'Error':'cannot find data'})
                    }
                })
            }
            else
            {
                callback(401,{'Error':'Token not authorised'})
            }
        })
    }   
    else
    {
        callback(400,{'Error':'missing required fields'})
    }
}
//Description:This handler is used to delete an individual order item from the cart 
//parameters=email ,orderID,token
_order.delete=(data,callback)=>{
    var orderID=typeof(data.queryStringObject.orderID)=='string'&&data.queryStringObject.orderID.trim().length>0?data.queryStringObject.orderID.trim():false;
    var email=typeof(data.queryStringObject.email)=='string'&&data.queryStringObject.email.length>0?data.queryStringObject.email.trim():false;
    const token=typeof(data.headers.token)=='string'&&data.headers.token.trim().length==20?data.headers.token.trim():false; 
    if(orderID&&email)
    {
        _order.verifyToken(token,email,(tokenIsValid)=>{
            if(tokenIsValid)
            {
                _data.read('order',email,(err,data)=>{
                    if(!err)
                    {
                        var orders=data.orders.filter(eachData=>{
                            return eachData.orderID!==orderID
                        })
                        var orderDetails={
                            'email':email,
                            'orders':orders

                        }
                        _data.update('order',email,orderDetails,(err)=>{
                            if(!err)
                            {
                                callback(200)
                            }
                            else
                            {
                                callback(400,{'Error':'Unable to update the order details'})
                            }
                        })
                    }
                    else
                    {
                        callback(400,{'Error':'No email found'})
                    }
                })
            }
            else
            {
                callback(401,{'Error':'Token not authorised'})
            }
        })
    }
    else
    {
        callback(400,{'Error':'Missing required fields'})
    }



}


module.exports=_order