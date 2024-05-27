
/**
 * Internet Status
 */
const updateOnlineStatus = () => {
    // document.getElementById('status').innerHTML = navigator.onLine ? 'online' : 'offline'
    if(navigator.onLine){
        document.getElementById('status').classList.add("online")
    }
}
window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)
updateOnlineStatus()

/**
 * Update UI Upon dispatch event
 * @param {*} event 
 */
const dispatched = (event) => {
    const server    = window.storage.getSync('server');
    document.getElementById('dispatchtext').textContent = 'Stop Fusion' 
    var statusText = document.getElementById('statusText');
    console.log(server.balancing)
    statusText.innerHTML = "Fusion On ("+server.balancing.length+")";
    document.getElementById('status').classList.add("fusion")
}
window.addEventListener('dispatch_online', dispatched)

/**
 * Update UI Upon dispatch-kill event
 * @param {*} event 
 */
const dispatch_offline = (event) => {
    var statusText = document.getElementById('statusText');
    statusText.innerHTML = "Default Network";
    document.getElementById('dispatchtext').textContent = 'Start Fusion' 
    document.getElementById('status').classList.remove("fusion")
}
window.addEventListener('dispatch_offline', dispatch_offline)

/**
 * Refresh Networks
 */
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
    const server    = window.storage.getSync('server');
    
    if(e.checked && !server.balancing.includes(e.value)){
        server.balancing.push(e.value);
    }else{
        server.balancing.splice(server.balancing.indexOf(e.value), 1);   
    }
    
    await window.saveActiveAdaptors(server)
    setTimeout(updateActiveNetworks, 500);
}
const updateActiveNetworks = async (e) => {
    const server    = window.storage.getSync('server');

    let adaptors  = await window.getAdaptors()

    var ul = document.getElementById('proxying')
    ul.innerHTML = ""

    for (let index = 0; index < adaptors.length; index++) {
        const element = adaptors[index];
        if(server.balancing.includes(element.address)) {
            

            let item = element.adaptor
            +'  <div class="actions">'
            +'    <div>'
            +'      <i style="font-size:25px" class="icons10-download-2"></i>'
            +'      <span style="font-size:15px;"> ∞</span>'
            +'    </div>'
            +'    <div>'
            +'      <i style="font-size:25px" class="icons10-upload-2"></i>'
            +'      <span style="font-size:15px;"> ∞</span>'
            +'    </div>'
            +'  </div>'

            var li = document.createElement("li");
            li.classList.add("app-list-item")
            
            li.innerHTML = (item);
            ul.appendChild(li);
        }

    }
}
updateActiveNetworks();
const activateServer = async (e) => {
    const server    = window.storage.getSync('server');

    if(server.online) {
        // document.getElementById('server').classList.remove("online")
        document.getElementById('server').setAttribute('disabled','')
        document.getElementById('SelectNetworkDialogTrigger').removeAttribute('disabled')
        await window.killServer()

    }else {
        document.getElementById('SelectNetworkDialogTrigger').setAttribute('disabled','true')
        await window.runDispatcher()
    }
    
}
const launchApp = async (e) => {
    const adaptors = await window.getAdaptors()
    const server    = window.storage.getSync('server');
        
    document.getElementById('availableNetworkCount').innerHTML = adaptors.length
        
    if(server.online) {
        document.getElementById('SelectNetworkDialogTrigger').setAttribute('disabled','true') 

        this.dispatchEvent(new Event("dispatch_online", {
            bubbles: true,
            detail: { text: () => 'online' },
        }),);
    }else {
        document.getElementById('SelectNetworkDialogTrigger').removeAttribute('disabled') 
        this.dispatchEvent(new Event("dispatch_offline", {
            bubbles: true,
            detail: { text: () => 'offline' },
        }),);
    }
    
}
launchApp()

window.__setTheme = async () => {
    let userTheme = await window.storage.getSync("user_theme")
    let OSTheme = await window.storage.getSync("os_theme")
    let defaultTheme = 'light'
    
    
    document.documentElement.setAttribute(
        'data-theme',
        userTheme || OSTheme || defaultTheme,
    )
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async event =>  {
    const newColorScheme = event.matches ? "dark" : "light";
    // document.getElementsByName('html')[0].setAttribute('data-theme', newColorScheme )
    await window.setOSTheme()
    window.__setTheme()
});
window.setOSTheme()