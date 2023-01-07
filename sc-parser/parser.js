function getJsonFile() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jObj = JSON.parse(this.responseText);
            parse(jObj.data.allScreens.nodes);
        }
    };
    xmlhttp.open("GET", "terraboost.json", true);
    xmlhttp.send();
}

function parse(screens) {
    var regexp = new RegExp(/(?<!\d)\d{5}(?!\d)/g); 
    var state;
    screens.forEach(screen => {
        state = "";
        if (screen.screenGroupByScreenGroupId.name == "Vallarta" || screen.screenGroupByScreenGroupId.name == "Safeway" || screen.screenGroupByScreenGroupId.name == "Marianos") {
            document.getElementById("data").innerHTML += "Terraboost"; //network_name
            document.getElementById("data").innerHTML += ";";

            var matches = screen.name.match(regexp);

            document.getElementById("data").innerHTML += matches[0]; //venue_id
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.screenGroupByScreenGroupId.name; //venue.name
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "Grocery"; //venue.category_name
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "Terraboost Wipe Dispenser Kiosk"; //asset.name
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "Kiosk"; //asset.category
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "32"; //asset.size
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "9:16"; //asset.aspect_ratio
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "video/mp4"; //asset.mime_type
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.id; //device.id
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.name; //device.name
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //device.description
            document.getElementById("data").innerHTML += ";";

            if (screen.env.sc_address != undefined && screen.env.sc_address.endsWith("USA"))
            {
                screen.env.sc_address = screen.env.sc_address.replace(", USA", "");
                state = screen.env.sc_address.substring(screen.env.sc_address.lastIndexOf(", ") + 2);
                //screen.env.sc_address = screen.env.sc_address.replace((", " + state), "");
            }
            document.getElementById("data").innerHTML += screen.env.sc_address === undefined ? "" : screen.env.sc_address; //location.street_address
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //location.street_address_2
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.env.sc_locality === undefined ? "" : screen.env.sc_locality; //location.city
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += state; //location.state
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //location.postal_code
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "USA"; //location.country
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.env.sc_latitude === undefined ? "" : screen.env.sc_latitude; //location.latitude
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.env.sc_longitude === undefined ? "" : screen.env.sc_longitude; //location.longitude
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "Furniture"; //location.structure_type_name
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "Entrance/Exit"; //location.placement_type_name
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //location.altitude
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //location.bearing
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.playerHeight; //slot.height
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += screen.playerWidth; //slot.width
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "0"; //slot.top_left_x
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "0"; //slot.top_left_y
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "15"; //slot.duration
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "0.25"; //slot.share_of_voice
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //restrictions.creative_categories
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //restrictions.other
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += "TRUE"; //operating_hours.always_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.sunday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.sunday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.monday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.monday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.tuesday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.tuesday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.wednesday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.wednesday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.thursday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.thursday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.friday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.friday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.saturday_open
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //operating_hours.saturday_close
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += (screen.isConnected == false ? "Not " : "") + "Connected"; //notes
            document.getElementById("data").innerHTML += ";";
            document.getElementById("data").innerHTML += ""; //location.google_place_id
            document.getElementById("data").innerHTML += "<br>";
        }
    });
}