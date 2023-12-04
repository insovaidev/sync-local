const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs')
const axios = require('axios')

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


// Sync Users
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

// Sync Ports
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

// Sync Countries
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

// Sync Visa Types
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

// Sync Activity to Central
app.post('/sync/activities', async(req, res, next) => {
    try {
        const result = await axios.post(LOCAL_API_URL+'syncs/activity_logs_to_central', {})
        return res.send({'message': 'success'})
    } catch (error) {
        console.log(error)
        next()
    }
})

// Sync Checklists to Central
app.post('/sync/checklists', async(req, res, next) => {
    try {
        const result = await axios.post(LOCAL_API_URL+'syncs/checklists_to_central', {})
        const body = result.data

        if(result.data){
            const sync_data_to_central = await axios.post(SYNC_CENRAL_URL+'sync/checklists', body)
        }

        return res.send({'message': 'success'})
    } catch (error) {
        console.log(error)
        next()
    }
})


app.use(function (req, res, next) {
    res.status(404).send({"message":"Page No Found"})
})

app.listen(PORT, console.log(`App running on port ${PORT} `))