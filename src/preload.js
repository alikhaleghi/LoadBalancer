// See the Electron documentation for details on how to use preload scripts:
// https://www.electr   onjs.org/docs/latest/tutorial/process-model#preload-scripts

var appRootDir = require('app-root-dir').get();
var kill  = require('tree-kill');
const { contextBridge } = require('electron')
const { exec } = require("child_process");
const util  = require("util");
const execPromise = util.promisify(exec);
const storage = require('electron-json-storage');
const path = require('path');
const isDev = process.env.npm_node_execpath ? true : false
const { remote } = require('electron')
storage.setDataPath((isDev ? (appRootDir + '/src/') : (path.parse(appRootDir).dir + '/src/'))+"/database")


contextBridge.exposeInMainWorld('storage', storage );
contextBridge.exposeInMainWorld('setOSTheme', async function() {
    let theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    await storage.set("os_theme", theme)

    document.documentElement.setAttribute(
        'data-theme',
        theme,
    )

    return theme
});
contextBridge.exposeInMainWorld('getActiveAdaptors', async function(server) {
    let server_item = storage.get("server")
    return server_item.balancing ? server.balancing : []
});
contextBridge.exposeInMainWorld('saveActiveAdaptors', async function(server) {
    storage.set("server", server)
});

contextBridge.exposeInMainWorld('killServer', async function() {
    const server    = storage.getSync('server');

    if(server.online) {
        kill(server.online);
        server.online = null
        storage.set("server", server)
        this.dispatchEvent(new Event("dispatch_offline", {
            bubbles: true,
            detail: { text: () => 'offline' },
        }),);
    }
});
contextBridge.exposeInMainWorld('runDispatcher', async function() {
    const server    = await storage.getSync('server');
    console.log(server)
    const path = require('path');
    const isDev = process.env.npm_node_execpath ? true : false

    var executablePath = isDev ? (appRootDir + '/src/dispatch/dispatch.exe') : (path.parse(appRootDir).dir + '/src/dispatch/dispatch.exe');
    
    
    let ips = '';
    for (let index = 0; index < server.balancing.length; index++) {
        const element = server.balancing[index];
        ips = ips+ ' ' + element
    }

    if(server.online) {
        console.log("is online: " + server.online)
        kill(server.online);
        console.log("killed: " + server.online)
        return
    }
    const exec = require('child_process').exec;

    let child_process_obj = await exec(executablePath +" start "+ ips, {
        cwd: isDev ? (appRootDir + '/src/dispatch/') : (path.parse(appRootDir).dir + '/src/dispatch/')
    }, (error, stdout, stderr) => {
        
        if (error) {
            
            server.online = null
            storage.set("server", server)
        } else {
            console.log(`stdout:`, stdout);
            console.log(`stderr:`, stderr);
        }
    });
    server.online = child_process_obj.pid
    storage.set("server", server)
    console.log("new online: " + child_process_obj.pid)
    this.dispatchEvent(new Event("dispatch_online", {
        bubbles: true,
        detail: { text: () => 'online' },
    }),);

});
contextBridge.exposeInMainWorld('getAdaptors', async function() {

    // console.log(storage.getSync('server').length)
    // console.log(storage.getSync('server'))
    // if(!storage.getSync('server').length) {
    //     storage.set("server", {
    //         type: 'socks',
    //         ip: '127.0.0.1',
    //         port: '1080',
    //         balancing: [
    //             // Ip Addresses
    //         ]
    //     })
    // }
    // const data = storage.getSync('adaptors', function(error, data) {
    //     if (error) throw error;
        
    //     return data
    // });
    const path = require('path');
    const fs = require('fs');
    const isDev = process.env.npm_node_execpath ? true : false

    // fs.readFile(path.join(path.parse(appRootDir).dir, 'dispatch', 'dispatch.exe'), (error, buffer) => {});
    var executablePath = 
    isDev ? 
        appRootDir + '/src/dispatch/dispatch.exe' 
    : 
    path.parse(appRootDir).dir + '/src/dispatch/dispatch.exe'
    ;
    
    console.log("dispatch.exe:",executablePath)

    var parameters = ['list'];
    let networks = []

    const result = await execWrapper(executablePath +" list", parameters);
    
    var r = /(.*)(║ [\d.\d.\d.\d]+)/gm

    var y = result.toString().match(r);  

    for (let index = 0; index < y.length; index++) {
        const element = y[index];

        networks.push({
            adaptor: (element.match(/[A-Za-z-]+/)[0]).substring(1),
            address: element.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g)[0]
        })
        
    }
    await storage.set("adaptors", networks)

    return networks
})

async function execWrapper(cmd,arg) {
    const { stdout, stderr } = await execPromise(cmd,arg);
    if (stdout) { 
      return stdout
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  }