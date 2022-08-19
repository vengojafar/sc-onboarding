var apiKeyCheckQuery = "{currentOrg{id,name}}"
var allScreensQuery = "{allScreens(orderBy: CREATED_AT_DESC) {nodes {id,name,isConnected}}}";
var screenByIdQuery = '{screenById(id: "$id"){name,id,isConnected,createdAt,playerWidth,playerHeight,deviceModel,devicePlatform,env,operatingHours,playlistsByScreenId {nodes {name,content}}}}';

var validApiKey = "";

function formatQuery(query) {
    return JSON.stringify({
        query: "query " + query,
        variables: {}
    });
}

function checkApiKeyAndGetOrgName(apiKey, apiCheckCallback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var qr = JSON.parse(this.responseText);
                if (qr.data.currentOrg.id != null) {       
                    validApiKey = apiKey;
                    apiCheckCallback(true, qr.data.currentOrg.name);
                }
                else {
                    apiCheckCallback(false, "");
                }
            }
            else {
                apiCheckCallback(false, "");
            }
        }
    });
    xhr.open("POST", "https://graphql.us.screencloud.com/graphql");
    xhr.setRequestHeader("Authorization", "Bearer " + apiKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(formatQuery(apiKeyCheckQuery));
}

function getAllScreens(screensCallback)
{
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status === 200) {
            var qr = JSON.parse(this.responseText);
            screensCallback(qr.data.allScreens.nodes);
        }
    });
    xhr.open("POST", "https://graphql.us.screencloud.com/graphql");
    xhr.setRequestHeader("Authorization", "Bearer " + validApiKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(formatQuery(allScreensQuery));
}

function getScreenById(id, screenByIdCallback)
{
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status === 200) {
            var qr = JSON.parse(this.responseText);
            screenByIdCallback(qr.data.screenById);
        }
    });
    xhr.open("POST", "https://graphql.us.screencloud.com/graphql");
    xhr.setRequestHeader("Authorization", "Bearer " + validApiKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(formatQuery(screenByIdQuery.replace("$id", id)));
}