const http=require('http');
const serverConfig=require('./lib/server');
const config=require('./lib/config')

//create server
const server=http.createServer((req,res)=>{
    serverConfig.unifiedServer(req,res)
})

//listen server on PORT
server.listen(config.stagging.httpPort,(err)=>{
    console.log("Server on")

})


