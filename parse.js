var https = require('https');

var options = {
    'method': 'POST',
    'hostname': 'graphql.us.screencloud.com',
    'path': '/graphql',
    'headers': {
        'Authorization': 'Bearer a3392906-24f2-402a-8cd1-88fe6ef7709f:ed519a47000aa4d14065e5b4c2c473ad',
        'Content-Type': 'application/json'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        var jObj = JSON.parse(body.toString())
        
        console.log(`Name, Ad Unit Id, Playlist Name, Is Connected`);
        var screens = jObj.data.allScreens.nodes;
        screens.forEach(screen => {
            var playlistItems = screen.playlistsByScreenId.nodes[0];
            if (!JSON.stringify(playlistItems).includes("2e9b84e4-9957-4886-b081-75ba99e219c6")) {
                console.log(`${screen.name}, ${screen.env.ad_unit_id}, ${playlistItems.name}, ${screen.isConnected}`);
            }
        })
    });

    res.on("error", function (error) {
        console.error(error);
    });
});

var postData = JSON.stringify({
    query: `query {allScreens(orderBy: CREATED_AT_DESC) {nodes {id,name,isConnected,env,playlistsByScreenId{nodes{name,content}}}}}`,
    variables: {}
});

req.write(postData);
req.end();