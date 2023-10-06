function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const menuOptions = {
    "ip_logs": document.querySelector(`.menu-content a[type=ip_logs]`),
    "location_logs": document.querySelector(`.menu-content a[type=location_logs]`),
    "docs": document.querySelector(`.menu-content a[type=docs]`)
}

const objects = {
    "info": document.querySelector(".info"),
}

document.querySelector(".title").addEventListener("click", () => {
    objects["info"].innerHTML = "";
});

menuOptions["location_logs"].addEventListener("click", openLocation);
menuOptions["ip_logs"].addEventListener("click", openIP);

function openLocation() {
    try {
        loading();
        getLogsFile("location").then(data => {
            objects["info"].innerHTML = "<h3 class='info_title'>Location Logs<h3> <div class='info_content'></div>";
            if (data != null && data != undefined) {
                for (let option of Object.keys(data)) {
                    let logOption = document.createElement("div");
                    logOption.innerHTML = `<h3>IP: ${option}</h3>`;
                    logOption.setAttribute("class", "logOption logOptionLocation");
                    logOption.setAttribute("ip", option);
                    document.querySelector(".info_content").append(logOption);
    
                    let logData = document.createElement("div");
                    logData.innerHTML = `<h4>Log Info</h4>`;
    
                    const methods = data[option];
                    let htmlData = "";
                    let htmlDataList = "";
                    if (methods != null) {
                        for (let method of Object.keys(methods)) {
                            let dataOptions = methods[method];
                            let dataOptionCount = 0;
                            if (dataOptions != null) {
                                for (let dataOption of Object.keys(dataOptions)) {
                                    if (dataOptionCount == 0) {
                                        htmlDataList = htmlDataList + `<br><h4>${method}</h4> <ul> <br> <a target="_blank" href="https://www.latlong.net/c/?lat=${dataOptions["latitude"]}&long=${dataOptions["longitude"]}"><button>ON MAP</button></a> <button class="removeLocationMethod" method="${method}" ip="${option}">Remove Method</button> <br> <br>`;
                                    }
                                    if (dataOptionCount == 0) {
                                        htmlDataList = htmlDataList + `
                                             <li><b>IP: </b> ${option} </li>
                                        `;
                                    }
                                    htmlDataList = htmlDataList + `
                                        <li><b>${dataOption}: </b> ${dataOptions[dataOption]} </li>
                                    `;
                                    dataOptionCount++;
                                    if (dataOptionCount >= Object.keys(dataOptions).length) {
                                        htmlDataList = htmlDataList + "</ul>";
                                    }
                                }
                            }
                        }
                    }

                    htmlData = `
                                ${htmlDataList}
                                <br><br>
                                <button class="removeLocation" ip="${option}">Total Removal</button>
                                <h5 style='user-select: none;'><br><br>* Methods that return NULL are not displayed </h5>
                            `
                    
                    logData.innerHTML = logData.innerHTML + htmlData;
                    logData.setAttribute("class", "logData logDataLocation");
                    logData.setAttribute("ip", option);
                    logData.style.display = "none";
                    document.querySelector(".info_content").append(logData);
                    try {
                        document.querySelector(`.logOptionLocation[ip="${option}"]`).addEventListener("click", openOptioLoctionnData);
                        document.querySelector(`.removeLocation[ip="${option}"]`).addEventListener("click", removeLocation);
                        const removeLocationMethod = document.querySelectorAll(`.removeLocationMethod[ip="${option}"]`);
                        for (let rlm of removeLocationMethod) {
                            rlm.addEventListener("click", removeMethodLocation);
                        }
                    } catch (error) {
                        console.log("");
                    }
                    
                }
            }
        });
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

function openIP() {
    try {
        loading();
        getLogsFile("ip").then(data => {
            objects["info"].innerHTML = `<h3 class="info_title">IP Logs<h3> 
            <div class="ips-config">
                <div class="transfer-data-from-host">
                    <h4>Transfer Data From Host</h4>
                    <button class="transfer-ips">START</button>
                </div>
                <div class="remove-data-from-host">
                    <h4>Remove Data From Host</h4>
                    <button class="remove-ips">REMOVE</button>
                </div>
            </div>
                
            <div class="info_content"></div>`;
            document.querySelector(".transfer-ips").addEventListener("click", transferIps);
            if (data != null && data != undefined) {
                for (let option of Object.keys(data)) {
                    optionDatas = data[option];
                    let logOption = document.createElement("div");
                    logOption.innerHTML = `<h3>${option}</h3>`;
                    logOption.setAttribute("class", "logOption logOptionIP");
                    logOption.setAttribute("id", option);
                    document.querySelector(".info_content").append(logOption);
    
                    let logData = document.createElement("div");
                    logData.innerHTML = `<h4>Log Info</h4>`;
    
                    let htmlData = "";
                    let htmlDataList = "";
                    let dataOptionCount = 0;
                    for (let optionData of Object.keys(optionDatas)) {
                        if (dataOptionCount == 0) {
                            htmlDataList = htmlDataList + `
                                <br><ul>
                            `;
                        }
                        htmlDataList = htmlDataList + `
                            <li><b>${optionData}: </b> ${optionDatas[optionData]} </li>
                        `;
                        dataOptionCount++;
                        if (dataOptionCount >= Object.keys(optionDatas).length) {
                            htmlDataList = htmlDataList + "</ul>";
                        }
                    }

                    htmlData = `
                                ${htmlDataList}
                                <br><br>
                                <button class="removeIP" id="${option}">Total Removal</button>
                            `
                    
                    logData.innerHTML = logData.innerHTML + htmlData;
                    logData.setAttribute("class", "logData logDataIP");
                    logData.setAttribute("id", option);
                    logData.style.display = "none";
                    document.querySelector(".info_content").append(logData);
                    try {
                        document.querySelector(`.logOptionIP[id="${option}"]`).addEventListener("click", openOptionIPData);
                        document.querySelector(`.removeIP[id="${option}"]`).addEventListener("click", removeIP);
                        document.querySelector(".remove-ips").addEventListener("click", removeHostIPs)
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            }
        });
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

function removeHostIPs() {
    ajax({
        url: "./geolocc.php",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({"type": "removeHostIps"}),
        success: () => {
            loading();
        }
    });
}

async function transferIps() {
    hostFileResult = {};
    localFileResult = {};

    try {
        let hostFile = await fetch("./../host/data.json");
        hostFileResult = await hostFile.json();
    } catch (error) {
        
    }

    try {
        let localFile = await fetch("./../logs/ip/logs.json");
        localFileResult = await localFile.json();
    } catch (error) {

    }

    ajax({
        url: "./geolocc.php",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({"type": "transferIps", "host": hostFileResult, "local": localFileResult}),
        success: () => {
            openIP();
        }
    });
}

let currentOpenLocationOptionData = "";

function openOptioLoctionnData() {
    try {
        const logDatas = document.querySelectorAll(".logDataLocation");
        const logOptions = document.querySelectorAll(".logOptionLocation");
        
        for (let logData of logDatas) {
            logData.style.display = "none";
        }

        for (let logOption of logOptions) {
            logOption.style.marginBottom = "20px";
            logOption.style.borderBottomLeftRadius = "5px";
            logOption.style.borderBottomRightRadius = "5px";
        }

        let ip = this.getAttribute("ip");
        if (currentOpenLocationOptionData != ip) {
            this.style.marginBottom = "0px";
            this.style.borderBottomLeftRadius = "0px";
            this.style.borderBottomRightRadius = "0px";
            document.querySelector(`.logData[ip="${ip}"]`).style.display = "block";
            currentOpenLocationOptionData = ip;
        } else {
            currentOpenLocationOptionData = 0;
        }
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

let currentOpenIPOptionData = "";

function openOptionIPData() {
    try {
        const logDatas = document.querySelectorAll(".logDataIP");
        const logOptions = document.querySelectorAll(".logOptionIP");
        
        for (let logData of logDatas) {
            logData.style.display = "none";
        }

        for (let logOption of logOptions) {
            logOption.style.marginBottom = "20px";
            logOption.style.borderBottomLeftRadius = "5px";
            logOption.style.borderBottomRightRadius = "5px";
        }

        let id = this.getAttribute("id");
        if (currentOpenIPOptionData != id) {
            this.style.marginBottom = "0px";
            this.style.borderBottomLeftRadius = "0px";
            this.style.borderBottomRightRadius = "0px";
            document.querySelector(`.logDataIP[id="${id}"]`).style.display = "block";
            currentOpenIPOptionData = id;
        } else {
            currentOpenIPOptionData = 0;
        }
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

async function removeLocation() {
    try {
        let ip = this.getAttribute("ip");
        let response = await fetch("./../logs/location/logs.json");
        let result = await response.json();
        delete result[ip];
        ajax({
            url: "./geolocc.php",
            method: "POST",
            dataType: "json",
            data: JSON.stringify({"type": "removeLocation", "result": result}),
            success: () => {
                openLocation();
            }
        });
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

async function removeIP() {
    try {
        let id = this.getAttribute("id");
        let response = await fetch("./../logs/ip/logs.json");
        let result = await response.json();
        delete result[id];
        ajax({
            url: "./geolocc.php",
            method: "POST",
            dataType: "json",
            data: JSON.stringify({"type": "removeIP", "result": result}),
            success: () => {
                openIP();
            }
        });
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

async function removeMethodLocation() {
    try {
        let ip = this.getAttribute("ip");
        let method = this.getAttribute("method");
        let response = await fetch("./../logs/location/logs.json");
        let result = await response.json();
        delete result[ip][method];
        ajax({
            url: "./geolocc.php",
            method: "POST",
            dataType: "json",
            data: JSON.stringify({"type": "removeLocation", "result": result}),
            success: () => {
                openLocation();
            }
        });
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

async function getLogsFile(type) {
    try {
        if (type == "location") {
            let response = await fetch("./../logs/location/logs.json");
            let result = await response.json();
            return result;
        }
        if (type == "ip") {
            let response = await fetch("./../logs/ip/logs.json");
            let result = await response.json();
            return result;
        }
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

async function loading() {
    try {
        document.querySelector(".loading").style.display = "block";
        await sleep(2000);
        document.querySelector(".loading").style.display = "none";   
    } catch (error) {
        console.error("GEOLOCC => " + error);
    }
}

function ajax(arg) {
    let url = arg.url;
    let method = arg.method;
    let dataType = arg.dataType;
    let data = arg.data;
    let success = arg.success;

    let xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if (dataType == "json") {
        xhr.setRequestHeader('Content-type', 'application/json');
    } else {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    xhr.onload = () => {
        success(xhr.response);
    }
      
    xhr.onerror = error => {
        console.log("GEOLOCC => " + error);
    }
    
    xhr.send(data);
}