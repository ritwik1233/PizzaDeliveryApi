const url=require('url');
const handlers=require('./handlers');
const stringDecoder=require('string_decoder').StringDecoder;
const helpers=require('./helpers');
let serverConfig={}
serverConfig.unifiedServer=(req,res)=>{
    //get url and parsed url
    const parsedUrl=url.parse(req.url,true)
    //get path from url
    const path=parsedUrl.pathname;
    //get trimmedPath
    const trimmedPath=path.replace(/^\/+|\/$/g,'');
    //parse the trimmedPath
    const queryStringObject=parsedUrl.query;
    //get method
    const method=req.method.toLowerCase();
    //get headers
    const headers=req.headers;
    
    var decoder=new stringDecoder('utf-8');
    //get payload
    let buffer='';
    req.on('data',(data)=>{
        buffer+=decoder.write(data)
    })

    req.on('end',()=>{
        buffer+=decoder.end()
        const choosenHanlder=typeof(router[trimmedPath])!=='undefined'?router[trimmedPath]:handlers.notFound;
        const data={
            'trimmedPath':trimmedPath,
            'queryStringObject':queryStringObject,
            'method':method,
            'headers':headers,
            'payload':helpers.parseJsonToObject(buffer)
        }
        choosenHanlder(data,(statusCode,payload)=>{
            //define Default status code
            statusCode=typeof(statusCode)=='number'?statusCode:200;
            //define default payload
            payload=typeof(payload)=='object'?payload:{};
            // Convert payload to a string
            //this payload is the payload send by the handler to the user
            var payloadString=JSON.stringify(payload)
            //return response
            //Set content type
            res.setHeader('Content-type','application/json')
            //Write status code
            res.writeHead(statusCode);
            //write payload and response end
            res.end(payloadString);
            //If response is 200 print green or  red
            if(statusCode==200||statusCode==201)
            {
                console.log('\x1b[32m%s\x1b[0m',method.toUpperCase()+'/'+trimmedPath+' '+statusCode)
            }
            else
            {
                console.log('\x1b[31m%s\x1b[0m',method.toUpperCase()+'/'+trimmedPath+' '+statusCode)
            }
            console.log('Returning this response',statusCode,payloadString)
        }) 
    })
}

var router={}
router={
    'users':handlers.users,
    'tokens':handlers.tokens,
    'order':handlers.order,
    'checkout':handlers.checkout
}
module.exports=serverConfig
