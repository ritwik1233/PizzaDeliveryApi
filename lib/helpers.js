const crypto=require('crypto');
const https=require('https');
const querystring=require('querystring');
const config=require('./config');

let helpers={}
helpers.parseJsonToObject=(str)=>{
    try{
        var obj=JSON.parse(str)
        return obj;
    }
    catch(e)
    {   
        return {};

    }
}
//create a sha256 hash
helpers.hash=(string)=>{
    if(typeof(string)=='string'&&string.length>0)
    {
        const hash=crypto.createHmac('sha256',config.stagging.hashingSecret)
        .update(string)
        .digest('hex');
        return hash;
    }
    else
    {
        return false
    }
}
//create random string
helpers.createRandomString=(stringLength)=>{
    stringLength=typeof(stringLength)=='number'&&stringLength>0?stringLength:false
    if(stringLength)
    {
        var possibleCharacters='abcdefghijklmnopqrstuvwxyz0123456789';
        //start the final string

        var str='';
        for(i=1;i<=stringLength;i++)
        {
            //get a random character from the possible characters
            var randomCharacter=possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length))
            //Append this character to the final string
            str+=randomCharacter
        }
        return str;
    }
    else
    {
        return false
    }
}
//handle stripe payment api 
helpers.payStripe=(amount,email,cardType,callback)=>{
    const payload={
    'amount':amount,
    'currency':'usd' ,
    'source':cardType,
    'receipt_email':email
        }
var stringPayload = querystring.stringify(payload);
const requestDetails={
    'protocol' : 'https:',
    'hostname' : 'api.stripe.com',
    'method' : 'POST',
    'path':'/v1/charges',
    'headers' : {
        'Authorization' : 'Bearer '+config.stagging.stripe_api_key,
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' : Buffer.byteLength(stringPayload)
      }    
    }
var req=https.request(requestDetails,(res)=>{
    var status=res.statusCode
    if(status==200||status==201)
    {
        callback(false,{'status':status,'message':res.statusMessage,'headers':res.headers});
    }
    else
    {
        callback(true,{'status':status,'message':res.statusMessage,'headers':res.headers})
    }
})
req.on('error',function(e){
    callback(true,{'Error':e})
});
req.write(stringPayload);
req.end();

}
//handle mailgun api
helpers.sendMail=(emailData,callback)=>{

    var payload = {
        'from': 'Pizza Delivery <postmaster@'+config.stagging.mailgun_domain+'>',
        'to': emailData.email,
        'subject': 'Food delivery orderID: '+emailData.orderID,
        'text': 'Congratulations Your order has been placed. \n Total Amount:'+emailData.totalAmount
    };
    var stringPayload=querystring.stringify(payload);
        var reqDetails = {
            'auth': config.stagging.mailgun_api_key,
            'hostname': 'api.mailgun.net',
            'method': 'POST',
            'path': '/v3/'+config.stagging.mailgun_domain+'/messages',
            'headers':{
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)              
            }
        };
    var req=https.request(reqDetails,(res)=>{
    var status=res.statusCode
            if(status==200||status==201)
            {
                callback(false,{'status':status,'message':res.statusMessage,'headers':res.headers});
            }
            else
            {
                callback(true,{'status':status,'message':res.statusMessage,'headers':res.headers})
            }
        })
        req.on('error',function(e){
          
            callback(true,{'Error':e})
        });
        req.write(stringPayload);
        req.end();

    
}
module.exports=helpers;