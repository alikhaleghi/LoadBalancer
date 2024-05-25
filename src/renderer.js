
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

    document.getElementById('server_ip').value = server.ip
    var ul = document.getElementById('networks')
    ul.innerHTML = ""
    for (let index = 0; index < adaptors.length; index++) {
        const element = adaptors[index];
        
        // document.getElementById('networks').innerHTML = element.address
        
        var checkbox = document.createElement("input");
        checkbox.type = 'checkbox'
        if(server.balancing.includes(element.address))
            checkbox.checked = true
        checkbox.value = element.address
        checkbox.onclick = setActive
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(element.address,element.address));
        li.appendChild(checkbox);
        ul.appendChild(li);
    }
    // alert ("Network Adaptors successfuly updated.")
}
refreshNetworks()

const setActive = async (e) => {
    const server    = window.storage.getSync('server');
        
    if(!server.balancing.includes(e.target.value)){
        server.balancing.push(e.target.value);
    }else{
        server.balancing.splice(server.balancing.indexOf(e.target.value), 1);   
    }
    console.log(server)
    var result = await window.saveActiveAdaptors(server)
    console.log(result)
}

const activateServer = async (e) => {
    const server    = window.storage.getSync('server');
    if(server.online) {
        let dispatched = await window.killServer()
        console.log("shutdown:"+dispatched)

    }else {
        let dispatched = await window.runDispatcher()
        console.log("start:"+dispatched)

    }
    
}