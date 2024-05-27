
const updateOnlineStatus = () => {
    // document.getElementById('status').innerHTML = navigator.onLine ? 'online' : 'offline'
    if(navigator.onLine){
        document.getElementById('status').classList.add("online")
    }
}
window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

const dispatched = (event) => {
    const server    = window.storage.getSync('server');

    var statusText = document.getElementById('statusText');
    console.log(server.balancing)
    statusText.innerHTML = "Fusion On ("+server.balancing.length+")";
    document.getElementById('status').classList.add("fusion")
}
window.addEventListener('dispatch_online', dispatched)

const dispatch_offline = (event) => {
    var statusText = document.getElementById('statusText');
    statusText.innerHTML = "Default Network";

    document.getElementById('status').classList.remove("fusion")
}
window.addEventListener('dispatch_offline', dispatch_offline)


updateOnlineStatus()

const refreshNetworks = async () => {
    let adaptors  = await window.getAdaptors()

    const server    = await window.storage.getSync('server');

    // document.getElementById('server_ip').value = server.ip
    var ul = document.getElementById('networks')
    ul.innerHTML = ""

    let AvailableIPs = []

    for (let index = 0; index < adaptors.length; index++) {
        const element = adaptors[index];
        AvailableIPs.push(element.address)
        
        // document.getElementById('networks').innerHTML = element.address
        
        var checkbox = document.createElement("input");
        checkbox.type = 'checkbox'
        // if(server.balancing.includes(element.address))
        //     checkbox.checked = true
        checkbox.value = element.address
        checkbox.onclick = setActive

        
        var a = '<a href="#/">'+
            '  <img alt="image" style="display: none;">'+
            '  <div class="app-list-item-container">'+
            '    <span class="app-list-title"><label for="CheckBoxDefault_'+element.adaptor+'">'+element.address+'</label></span>'+
            '    <p class="app-list-subtitle">'+element.adaptor+'</p>'+
            '  </div>'+
            '</a>'+
            '<div style="flex: 0.2 1 0%;">'+
            '  <input class="app-checkbox" '+(server.balancing.includes(element.address)?'checked':'')+' type="checkbox" value="'+element.address+'" onclick="setActive(this)" id="CheckBoxDefault_'+element.adaptor+'" >'+
            '</div>'
        
        var li = document.createElement("li");
        li.classList.add("app-list-item")
        
        li.innerHTML = (a);
        ul.appendChild(li);
    }
    
    for (let sIndex = 0; sIndex < server.balancing.length; sIndex++) {
        const element = server.balancing[sIndex];
        
        if(!AvailableIPs.includes(element)){
            server.balancing.splice(server.balancing.indexOf(element), 1);   
        }
    }

    await window.saveActiveAdaptors(server)
    // alert ("Network Adaptors successfuly updated.")
}
refreshNetworks()

const setActive = async (e) => {
    console.log(e)
    const server    = window.storage.getSync('server');
    
    if(e.checked && !server.balancing.includes(e.value)){
        server.balancing.push(e.value);
    }else{
        server.balancing.splice(server.balancing.indexOf(e.value), 1);   
    }
    console.log(server)
    var result = await window.saveActiveAdaptors(server)
    console.log(result)
}

const activateServer = async (e) => {
    const server    = window.storage.getSync('server');
    if(server.online) {
        document.getElementById('server').classList.remove("online")
        let dispatched = await window.killServer()
        console.log("shutdown:"+dispatched)

    }else {
        document.getElementById('server').classList.add("online")
        await window.runDispatcher()
        console.log("start: dispatched")
    }
    
}