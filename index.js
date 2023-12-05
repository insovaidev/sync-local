const express = require('express')
const app = express()
const cors = require('cors')
const axios = require('axios')
const fs = require('fs')
const fileLib = require('./fileLib')
let  formidable = require('formidable')

const UPLOAD_DIR = 'uploads/'
const PORT = 5001
const SYNC_CENRAL_URL = 'http://192.168.88.25:3001/' // Sync Central API 
const LOCAL_API_URL = 'http://192.168.88.25:5000/' // Local API
const LOCAL_PORT_CODE = 'PHN' // Ex: Local Port  Phnom Penh


// Allow close domain
app.use(cors())

// Accept Form Submition
const bodyParser = require('body-parser')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use('/uploads', express.static('uploads'))

app.post('/sync/upload_sync', async (req, res, next) => { 
    const form = new formidable.IncomingForm()
    const [fields, files] = await form.parse(req)
    
    if(files && files.file && files.file.length) {
        const file = files.file[0]   
        const attachments = req.headers.attachments
        try {
            if(!fileLib.exist(UPLOAD_DIR+attachments)){
                if(fileLib.copy(file.filepath, UPLOAD_DIR+attachments, true)){
                    // console.log('upload')          
                }
            }
            return res.send({'message': 'success'})
        } catch (error) {
            next()
        }
    }
}) 

// Users
app.post('/syncs/users', async (req, res, next) => {      
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    const sid = sync_logs.users != undefined ? sync_logs.users : 0
    try {    
        const sync_data_response = await axios.post(SYNC_CENRAL_URL+'syncs/users', {'sid': parseInt(sid), 'port':  LOCAL_PORT_CODE}) // Request to Sync-Central-API for new data update
        if(sync_data_response && sync_data_response.data != null && sync_data_response.data.data) {
            const body = sync_data_response.data
            const sync_users_to_local = await axios.post(LOCAL_API_URL+'syncs/users_from_central', body) // Request to Local-API for add/update new data
            sync_logs.users = sync_users_to_local.data.sid
            fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
        }
        return res.send({'message': 'success'})
    } catch (error) {
        console.log(error)
        next()
        // res.status(201).send({'message': 'CONFUSE SERVER'})
    }
})

// Ports
app.post('/syncs/ports', async (req, res, next) => {      
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    const sid = sync_logs.ports != undefined ? sync_logs.ports : 0
    try {    
        const sync_data_response = await axios.post(SYNC_CENRAL_URL+'syncs/ports', {'sid': parseInt(sid)}) // Request to Sync-Central-API for new data update
        if(sync_data_response && sync_data_response.data != null && sync_data_response.data.data) {
            const body = sync_data_response.data
            const sync_ports_to_local = await axios.post(LOCAL_API_URL+'syncs/ports_from_central', body) // Request to Local-API for add/update new data
            sync_logs.ports = sync_ports_to_local.data.sid
            fs.writeFileSync('sync_logs', JSON.stringify(sync_logs))
        }
        return res.send({'message': 'success'})
    } catch (error) {
        console.log(error)
        next()
        // res.status(201).send({'message': 'CONFUSE SERVER'})
    }
})

// Countries
app.post('/syncs/countries', async (req, res, next) => {    
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    const sid = sync_logs.countries != undefined ? sync_logs.countries : 0

    try {    
        const sync_data_response = await axios.post(SYNC_CENRAL_URL+'syncs/countries', {'sid': parseInt(sid)}) // Request to Sync-Central-API for new data update
        if(sync_data_response && sync_data_response.data != null && sync_data_response.data.data) {
            const body = sync_data_response.data
            const sync_countries_to_local = await axios.post(LOCAL_API_URL+'syncs/countries_from_central', body) // Request to Local-API for add/update new data
        }
        return res.send({'message': 'success'})
    } catch (error) {
        console.log(error)
        next()
        // res.status(201).send({'message': 'CONFUSE SERVER'})
    }
})

// Visa Types
app.post('/syncs/visa_types', async (req, res, next) => {    
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    const sid = sync_logs.countries != undefined ? sync_logs.countries : 0

    try {    
        const sync_data_response = await axios.post(SYNC_CENRAL_URL+'syncs/visa_types', {'sid': parseInt(sid)}) // Request to Sync-Central-API for new data update
        if(sync_data_response && sync_data_response.data != null && sync_data_response.data.data) {
            const body = sync_data_response.data
            const sync_visa_types_to_local = await axios.post(LOCAL_API_URL+'syncs/visa_types_from_central', body) // Request to Local-API for add/update new data
        }
        return res.send({'message': 'success'})
    } catch (error) {
        console.log(error)
        next()
        // res.status(201).send({'message': 'CONFUSE SERVER'})
    }
})

// Activity
app.post('/sync/activities', async(req, res, next) => {    
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.activities != undefined ? sync_logs.activities : 0
    try {
        const activities_data = await axios.post(LOCAL_API_URL+'syncs/activity_logs_to_central', { 'sid': sid }) // Request to Local-API to get new activity
        if(activities_data.data && activities_data.data.data != undefined){
            const body = activities_data.data.data
            const sync_data_to_central = await axios.post(SYNC_CENRAL_URL+'sync/activities', body) // Request to Sync-Central-API to sync data 
            if(sync_data_to_central.data && sync_data_to_central.data.sid){
                sync_logs.activities = sync_data_to_central.data.sid
                fs.writeFileSync('sync_logs', JSON.stringify(sync_logs)) // Update sync_logs
                return res.send({'sid': sync_logs.activities})
            } 
        }
        return res.send({'data': null})
    } catch (error) {
        console.log(error)
        next()
    }
})

// Checklists
app.post('/sync/checklists', async(req, res, next) => {
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.checklists != undefined ? sync_logs.checklists : 0
    try {
        const checklists_data = await axios.post(LOCAL_API_URL+'syncs/checklists_to_central', {'sid': sid}) // Request to Local-API to get new checklists 
        if(checklists_data.data && checklists_data.data.data != undefined){
            const body = checklists_data.data.data
            const sync_data_to_central = await axios.post(SYNC_CENRAL_URL+'sync/checklists', body) // Request to Sync-Central-API to sync data           
            if(sync_data_to_central.data && sync_data_to_central.data.sid){
                sync_logs.checklists = sync_data_to_central.data.sid
                fs.writeFileSync('sync_logs', JSON.stringify(sync_logs)) // Update sync_logs
                return res.send({'sid': sync_logs.checklists})
            } 
        }
        return res.send({'data': null})
    } catch (error) {
        console.log(error)
        next()
    }
})


// Passports
app.post('/sync/passports', async(req, res, next) => {
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.passports != undefined ? sync_logs.passports : 0
    try {
        const passports_data = await axios.post(LOCAL_API_URL+'syncs/passports_to_central', {'sid': sid}) // Request to Local-API to get new passports
        if(passports_data.data && passports_data.data.data != undefined){
            const body = passports_data.data.data
            const sync_data_to_central = await axios.post(SYNC_CENRAL_URL+'sync/passports', body) // Request to Sync-Central-API to sync data           
            if(sync_data_to_central.data && sync_data_to_central.data.sid){
                sync_logs.passports = sync_data_to_central.data.sid
                fs.writeFileSync('sync_logs', JSON.stringify(sync_logs)) // Update sync_logs
                return res.send({'sid': sync_logs.passports})
            } 
        }
        return res.send({'data': null})
    } catch (error) {
        console.log(error)
        next()
    }
})


// Visas
app.post('/sync/visas', async(req, res, next) => {
    let sync_logs = {}
    if(result = await fs.readFileSync('sync_logs')) sync_logs = JSON.parse(result)
    let sid = sync_logs.visas != undefined ? sync_logs.visas : 0

    try {

        const visas_data = await axios.post(LOCAL_API_URL+'syncs/visas_to_central', {'sid': sid}) // Request to Local-API to get new passports
        
        console.log(visas_data.data)


        if(visas_data.data && visas_data.data.data != undefined){
            const body = visas_data.data.data
            const data = body
            
            // const sync_data_to_central = await axios.post(SYNC_CENRAL_URL+'sync/visas', body) // Request to Sync-Central-API to sync data           
        
            if(data && data.length){
                // Upload To Central
                data.forEach(async val => {
                    let attFiles = null
                    if(val.attachments != undefined ){
                        attFiles = JSON.parse(val.attachments)
                        if( attFiles !=undefined){
                            for (const [key, value] of Object.entries(attFiles)) {
                                const data = new FormData();
                                data.append('file', fs.createReadStream(UPLOAD_DIR+value));                                
                                try {
                                    const upload = await axios.post('http://192.168.88.25:3001/sync/upload_sync', data, { headers: { 'attachments': value,  'accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.8','Content-Type': `multipart/form-data; boundary=${data._boundary}`,}})  
                                } catch (error) {
                                    //  
                                }          
                            }
                        }                  
                   } 
                })
    
    
                // Send Data To Central
                // try {
                //     const result = await axios.post(config.centralUrl+'syncs/visas_from_sub', { 'data': data })
                //     if(result && result.status==200){
                //         await visaSyncModel.delete()
                //         return res.send({'message': 'sync success'})
                //     }
                // } catch (error) {
                //     // console.log('sync error')
                // }
            }
            
            // if(sync_data_to_central.data && sync_data_to_central.data.sid){
            //     sync_logs.visas = sync_data_to_central.data.sid
            //     fs.writeFileSync('sync_logs', JSON.stringify(sync_logs)) // Update sync_logs
            //     return res.send({'sid': sync_logs.visas})
            // } 
        }
        return res.send({'data': null})
    } catch (error) {
        console.log(error)
        next()
    }
})




















app.use(function (req, res, next) {
    res.status(404).send({"message":"Page No Found"})
})

app.listen(PORT, console.log(`App running on port ${PORT} `))