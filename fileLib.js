const fs = require('fs')

module.exports = {
    copy: function(source, distrination, deleteSource=false) {
        this.createDir(distrination)
        if(fs.existsSync(source)) {
            if(deleteSource) {
                fs.renameSync(source, distrination)
            } else {
                fs.copyFileSync(source, distrination)
            }
            return distrination
        }
        return null
    }, 

    exist: function(dir) {
        return fs.existsSync(dir)
    },
    
    createDir: function(path) {
        var dist = ""
        path.split('/').forEach(v => {
            if(v.indexOf(".") < 0) {
                dist += "/"+v
                if (!fs.existsSync("."+dist)) fs.mkdirSync("."+dist)
            }
        })
    },
}