const fs=require('fs');
const path=require('path');
const helpers=require('./helpers');
 // Container for the module
let lib={};

//Define base directory of the data folder
lib.baseDir=path.join(__dirname,'/../.data/')

//write data to file
lib.create=(dir,file,data,callback)=>{
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err,fileDescriptor)=>{
        if(!err&&fileDescriptor)
        {
            var stringData=JSON.stringify(data);
            fs.writeFile(fileDescriptor,stringData,(err)=>{
                if(!err)
                {
                    fs.close(fileDescriptor,(err)=>{
                        if(!err)
                        {
                            callback(false);
                        }
                        else
                        {
                            let errData={};
                            errData.message='ERROR';
                            errData.type=err;
                            callback(errData);                    
                        }
                    })
                }
                else
                {
                    let errData={};
                    errData.message='ERROR';
                    errData.type=err;
                    callback(errData)
                }
            })
        }
        else
        {
            let errData={};
            errData.message='ERROR'
            errData.type=err;
            if(!fileDescriptor)
            {
                errData.fileDescriptor='File Descriptor is missing'
            }
            callback(errData);
        }
    })
}
//read data from a file
lib.read=(dir,file,callback)=>{
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',(err,data)=>{
        if(!err&&data)
        {
            const jsonData=helpers.parseJsonToObject(data);
            callback(false,jsonData);
        }
        else
        {
            callback(err,data)
        }
    })
}
//update data from a file
lib.update=(dir,file,data,callback)=>{
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',
   (err,fileDescriptor)=>{
    if(!err&&fileDescriptor)
    {
        //Convert data to string
        var stringData=JSON.stringify(data)
        //write to file.
        fs.ftruncate(fileDescriptor,(err)=>{
            if(!err)
            {
                //Write to file and close it
                fs.writeFile(fileDescriptor,stringData,(err)=>{
                    if(!err)
                    {
                        //close file
                        fs.close(fileDescriptor,(err)=>{
                            if(!err)
                            {
                                callback(false)
                            }
                            else
                            {
                                callback(err)
                            }
                        })
                    }
                    else
                    {
                        callback(err)
                    }
                })
            }
            else
            {
                callback(err)
            }
        })
    }
    else
    {
        
        callback('Could not open file.It may not exists')
    }
   })
}
//Delete a file
lib.delete=(dir,file,callback)=>{
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',(err)=>{
        if(!err)
        {
            callback(false)
        }
        else
        {
            callback(err)
        }
    })
}
module.exports=lib