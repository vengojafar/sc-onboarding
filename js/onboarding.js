var organizationName = "";
var onboardedScreensArr = [];
var allScreensToOnboardArr = [];

$(document).ready(function () {
    $("#btn-submit-apikey").click(function () {
        var apiKey = $("#text-apikey").val();

        if (apiKey.includes(":")) {
            $(this).addClass("disabled");
            $("#icon-error").addClass("d-none");
            checkApiKeyAndGetOrgName(apiKey, apiCheckCallback);
        }
    });
});

function apiCheckCallback(isValid, orgName) {
    if (isValid) {
        $("#icon-success").removeClass("d-none");
        $("#loading-screens").removeClass("d-none");
        organizationName = orgName;
        getAllScreens(allScreensCallback);
    }
    else {
        $("#icon-error").removeClass("d-none");
        $("#btn-submit-apikey").removeClass("disabled");
    }
}

function allScreensCallback(screensArr)
{
    $("#loading-screens").addClass("d-none");
    $("#list-allscreens").removeClass("d-none");

    screensArr.forEach(screen => {
        var onboardScreen = generateOnboardScreenObj(screen, screen.isConnected);
        allScreensToOnboardArr.push(onboardScreen);
    });

    updateAllScreensList();
}

function updateAllScreensList()
{
    $("#list-allscreens").empty();
    $("#screen-count").text(allScreensToOnboardArr.length)

    allScreensToOnboardArr.forEach(onboardScreen => {
        $("#list-allscreens").append(addScreenToOnboardListItem(onboardScreen));
        populateScreenForms(onboardScreen);
    });
}

function populateScreenForms(onboardScreen){
    $(`#btn-save-${onboardScreen.device.id}`).click(function () {
        $(`#formhelp-${onboardScreen.device.id}`).empty();

        if (onboardScreen.device.name == "ScreenCloud Player") {
            $(`#formhelp-${onboardScreen.device.id}`).append(`<li>Warning: Device name should changed in Studio.</li>`);
        }

        if (inputtedParametersAreValid(onboardScreen.device.id)) {
            addOrUpdateOnboardedScreen(onboardScreen);
            updateOnboardedScreenList();
            //TODO Add alert confirmation
            
            setEnvInStudio(onboardScreen.device.id, onboardScreen.env, function(){});
            if (($(this).text()).includes("Add")) {
                $(`#badges-${onboardScreen.device.id}`).append(`<span class="badge bg-primary">Added</span>`);
            }

            $(this).text("Update Screen");
            new bootstrap.Collapse(`#collapse-${onboardScreen.device.id}`, { toggle: true });

            $(`#btn-reload-${onboardScreen.device.id}`).hide();
        }
        else {
            $(`#formhelp-${onboardScreen.device.id}`).append(`<li>Error: Each parameters needs to be filled in.</li>`);
        }
    });

    $(`#btn-reload-${onboardScreen.device.id}`).click(function () {
        getScreenById(onboardScreen.device.id, function(screen) {
            var newOnboardScreen = generateOnboardScreenObj(screen, screen.isConnected);
            var exisitingScreenIndex = allScreensToOnboardArr.findIndex(s => s.device.id === newOnboardScreen.device.id);
            allScreensToOnboardArr[exisitingScreenIndex] = newOnboardScreen;
            populateScreenForms(newOnboardScreen);
        });
    });

    $(`#formhelp-${onboardScreen.device.id}`).empty();
    $(`#badges-${onboardScreen.device.id}`).empty();

    $(`#badges-${onboardScreen.device.id}`).append(`${(onboardScreen.is_connected ? '<span class="badge bg-success">Online' : '<span class="badge bg-danger">Offline') + '</span> '}`);
    $(`#badges-${onboardScreen.device.id}`).append(`${(onboardScreen.env.ad_unit_id != null ? '<span class="badge bg-warning">Onboarded</span> ' : "")}`);

    $(`#form-devicename-${onboardScreen.device.id}`).val(onboardScreen.device.name);
    $(`#form-locationaddress-${onboardScreen.device.id}`).val(onboardScreen.location.street_address_1);

    if (onboardScreen.location.street_address_1 == "") {
        $(`#btn-save-${onboardScreen.device.id}`).hide();
        $(`#formhelp-${onboardScreen.device.id}`).append(`<li>Error: Address needs to be added in Studio.</li>`);
    }

    if (onboardScreen.asset.name != "") {
        $("#form-assetname-" + onboardScreen.device.id).val(onboardScreen.asset.name);
    }

    if (onboardScreen.asset.size != "") {
        $("#form-assetsize-" + onboardScreen.device.id).val(onboardScreen.asset.size);
    }

    if (onboardScreen.venue.name != "") {
        $("#form-venuename-" + onboardScreen.device.id).val(onboardScreen.venue.name);
    }

    if (onboardScreen.venue.id != "") {
        $("#form-venueid-" + onboardScreen.device.id).val(onboardScreen.venue.id);
    }

    var options = $("#form-assetcategory-" + onboardScreen.device.id)[0].options;
    for (var i = 0; i < options.length; i++) {
        $("#form-assetcategory-" + onboardScreen.device.id)[0].options[i].selected = false;
    }
    $("#form-assetcategory-" + onboardScreen.device.id)[0].options[0].selected = true;
    if (onboardScreen.asset.category != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.asset.category) {
                $("#form-assetcategory-" + onboardScreen.device.id)[0].options[i].selected = true;
                break;
            }
        }
    }

    options = $("#form-venuecategory-" + onboardScreen.device.id)[0].options;
    for (var i = 0; i < options.length; i++) {
        $("#form-venuecategory-" + onboardScreen.device.id)[0].options[i].selected = false;
    }
    $("#form-venuecategory-" + onboardScreen.device.id)[0].options[0].selected = true;
    if (onboardScreen.venue.category_name != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.venue.category_name) {
                $("#form-venuecategory-" + onboardScreen.device.id)[0].options[i].selected = true;
                break;
            }
        }
    }

    options = $("#form-structurecategory-" + onboardScreen.device.id)[0].options;
    for (var i = 0; i < options.length; i++) {
        $("#form-structurecategory-" + onboardScreen.device.id)[0].options[i].selected = false;
    }
    $("#form-structurecategory-" + onboardScreen.device.id)[0].options[0].selected = true;
    if (onboardScreen.location.structure_type_name != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.location.structure_type_name) {
                $("#form-structurecategory-" + onboardScreen.device.id)[0].options[i].selected = true;
                break;
            }
        }
    }

    options = $("#form-placementcategory-" + onboardScreen.device.id)[0].options;
    for (var i = 0; i < options.length; i++) {
        $("#form-placementcategory-" + onboardScreen.device.id)[0].options[i].selected = false;
    }
    $("#form-placementcategory-" + onboardScreen.device.id)[0].options[0].selected = true;
    if (onboardScreen.location.placement_type_name != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.location.placement_type_name) {
                $("#form-placementcategory-" + onboardScreen.device.id)[0].options[i].selected = true;
                break;
            }
        }
    }
}

function inputtedParametersAreValid(id)
{
    return ($("#form-assetcategory-" + id).val() != null &&
            $("#form-venuecategory-" + id).val() != null &&
            $("#form-placementcategory-" + id).val() != null &&
            $("#form-structurecategory-" + id).val() != null &&
            $("#form-assetname-" + id).val() != '' &&
            $("#form-assetsize-" + id).val() != '' &&
            $("#form-venuename-" + id).val() != '' &&
            $("#form-venueid-" + id).val() != '');
}

function updateOnboardedScreenList()
{
    $("#onboard-count").text(onboardedScreensArr.length)
    $("#list-onboardscreens").empty();
    onboardedScreensArr.forEach(os => {
        $("#list-onboardscreens").append(addToOnboardedScreenList(os));

        $(`#btn-remove-${os.device.id}`).click(function(){
            var exisitingScreenIndex = onboardedScreensArr.findIndex(s => s.device.id === os.device.id);
            onboardedScreensArr.splice(exisitingScreenIndex, 1);

            updateOnboardedScreenList();
            populateScreenForms(os);
            $(`#btn-reload-${os.device.id}`).show();
            $(`#btn-save-${os.device.id}`).show();
            $(`#btn-save-${os.device.id}`).text("Save and Add to List");
        });
    });
}

function addOrUpdateOnboardedScreen(onboardScreen)
{
    var id = onboardScreen.device.id;
    onboardScreen.asset.name = $("#form-assetname-" + id).val();
    onboardScreen.asset.size = $("#form-assetsize-" + id).val();
    onboardScreen.venue.id = $("#form-venueid-" + id).val();
    onboardScreen.venue.name = $("#form-venuename-" + id).val();
    onboardScreen.asset.category = $("#form-assetcategory-" + id).val();
    onboardScreen.venue.category_name = $("#form-venuecategory-" + id).val();
    onboardScreen.location.structure_type_name = $("#form-structurecategory-" + id).val();
    onboardScreen.location.placement_type_name = $("#form-placementcategory-" + id).val();

    onboardScreen.env["ad_unit_id"] = onboardScreen.device.id;
    onboardScreen.env["vengo.asset.name"] = onboardScreen.asset.name;
    onboardScreen.env["vengo.asset.size"] = onboardScreen.asset.size;
    onboardScreen.env["vengo.asset.category"] = onboardScreen.asset.category;
    onboardScreen.env["vengo.venue.category_name"] = onboardScreen.venue.category_name;
    onboardScreen.env["vengo.venue.id"] = onboardScreen.venue.id;
    onboardScreen.env["vengo.venue.name"] = onboardScreen.venue.name;
    onboardScreen.env["vengo.location.structure_type_name"] = onboardScreen.location.structure_type_name;
    onboardScreen.env["vengo.location.placement_type_name"] = onboardScreen.location.placement_type_name;

    var exisitingScreenIndex = onboardedScreensArr.findIndex(s => s.device.id === onboardScreen.device.id);
    if (exisitingScreenIndex > -1) {
        onboardedScreensArr[exisitingScreenIndex] = onboardScreen;
    }
    else
    {
        onboardedScreensArr.push(onboardScreen);
    }
}

function generateOnboardScreenObj(screen, isConnected)
{
    var onboardScreen = {
        "network_name": organizationName,
        "asset": {},
        "device": {},
        "venue": {},
        "location": {},
        "slot": {},
        "restrictions": {},
        "operating_hours": {},
        "is_connected" : isConnected,
        "env" : screen.env
    };

    onboardScreen.asset.name = screen.env["vengo.asset.name"] != null ? screen.env["vengo.asset.name"] : "";
    onboardScreen.asset.category = screen.env["vengo.asset.category"] != null ? screen.env["vengo.asset.category"] : "";
    onboardScreen.asset.size = screen.env["vengo.asset.size"] != null ? screen.env["vengo.asset.size"] : "";
    //var r = gcd(screen.playerWidth, screen.playerHeight);
    onboardScreen.asset.aspect_ratio = parseInt(screen.playerWidth) + ":" + parseInt(screen.playerHeight);

    onboardScreen.device.id = screen.id;
    onboardScreen.device.name = screen.name;
    onboardScreen.device.description = screen.deviceModel + " " + screen.devicePlatform;

    onboardScreen.venue.id = screen.env["vengo.venue.id"] != null ? screen.env["vengo.venue.id"] : "";
    onboardScreen.venue.name = screen.env["vengo.venue.name"] != null ? screen.env["vengo.venue.name"] : "";
    onboardScreen.venue.category_name = screen.env["vengo.venue.category_name"] != null ? screen.env["vengo.venue.category_name"] : "";

    var state = "";
    if (screen.env.sc_address != undefined && screen.env.sc_address.endsWith("USA")) {
        screen.env.sc_address = screen.env.sc_address.replace(", USA", "");
        state = screen.env.sc_address.substring(screen.env.sc_address.lastIndexOf(", ") + 2);
        //screen.env.sc_address = screen.env.sc_address.replace((", " + state), "");
    }

    onboardScreen.location.street_address_1 = screen.env.sc_address === undefined ? "" : screen.env.sc_address;
    onboardScreen.location.street_address_2 = "";
    onboardScreen.location.city = screen.env.sc_locality === undefined ? "" : screen.env.sc_locality;
    onboardScreen.location.state = state;
    onboardScreen.location.postal_code = "";
    onboardScreen.location.country = screen.env.sc_country === undefined ? "" : screen.env.sc_country;
    onboardScreen.location.latitude = screen.env.sc_latitude === undefined ? "" : screen.env.sc_latitude;
    onboardScreen.location.longitude = screen.env.sc_longitude === undefined ? "" : screen.env.sc_longitude;
    onboardScreen.location.structure_type_name = screen.env["vengo.location.structure_type_name"] != null ? screen.env["vengo.location.structure_type_name"] : "";
    onboardScreen.location.placement_type_name = screen.env["vengo.location.placement_type_name"] != null ? screen.env["vengo.location.placement_type_name"] : "";

    onboardScreen.slot.height = screen.playerHeight;
    onboardScreen.slot.width = screen.playerWidth;
    onboardScreen.slot.top_left_x = 0;
    onboardScreen.slot.top_left_y = 0;
    onboardScreen.slot.duration = 15;
    onboardScreen.slot.share_of_voice = 0.25;

    onboardScreen.restrictions.creative_categories = "";
    onboardScreen.restrictions.other = "";

    onboardScreen.operating_hours.always_open = true;
    onboardScreen.operating_hours.sunday_open = "";
    onboardScreen.operating_hours.sunday_close = "";
    onboardScreen.operating_hours.monday_open = "";
    onboardScreen.operating_hours.monday_close = "";
    onboardScreen.operating_hours.tuesday_open = "";
    onboardScreen.operating_hours.tuesday_close = "";
    onboardScreen.operating_hours.wednesday_open = "";
    onboardScreen.operating_hours.wednesday_close = "";
    onboardScreen.operating_hours.thursday_open = "";
    onboardScreen.operating_hours.thursday_close = "";
    onboardScreen.operating_hours.friday_open = "";
    onboardScreen.operating_hours.friday_close = "";
    onboardScreen.operating_hours.saturday_open = "";
    onboardScreen.operating_hours.saturday_close = "";

    if (screen.operatingHours != null && screen.operatingHours.day != undefined) {
        onboardScreen.operating_hours.always_open = false;
        onboardScreen.operating_hours.sunday_open = Math.round(screen.operatingHours.day.sun.start / 3600);
        onboardScreen.operating_hours.sunday_close = Math.round(screen.operatingHours.day.sun.end / 3600);
        onboardScreen.operating_hours.monday_open = Math.round(screen.operatingHours.day.mon.start / 3600);
        onboardScreen.operating_hours.monday_close = Math.round(screen.operatingHours.day.mon.end / 3600);
        onboardScreen.operating_hours.tuesday_open = Math.round(screen.operatingHours.day.tue.start / 3600);
        onboardScreen.operating_hours.tuesday_close = Math.round(screen.operatingHours.day.tue.end / 3600);
        onboardScreen.operating_hours.wednesday_open = Math.round(screen.operatingHours.day.wed.start / 3600);
        onboardScreen.operating_hours.wednesday_close = Math.round(screen.operatingHours.day.wed.end / 3600);
        onboardScreen.operating_hours.thursday_open = Math.round(screen.operatingHours.day.thu.start / 3600);
        onboardScreen.operating_hours.thursday_close = Math.round(screen.operatingHours.day.thu.end / 3600);
        onboardScreen.operating_hours.friday_open = Math.round(screen.operatingHours.day.fri.start / 3600);
        onboardScreen.operating_hours.friday_close = Math.round(screen.operatingHours.day.fri.end / 3600);
        onboardScreen.operating_hours.saturday_open = Math.round(screen.operatingHours.day.sat.start / 3600);
        onboardScreen.operating_hours.saturday_close = Math.round(screen.operatingHours.day.sat.end / 3600);
    }

    return onboardScreen;
}

function addToOnboardedScreenList(screen) {
    var li = 
    `<li class="list-group-item d-flex justify-content-between align-items-center">
        <div>${screen.venue.name} - ${screen.venue.id} ${screen.device.name} - ${screen.network_name}</div>
        <button class="btn btn-danger" id="btn-remove-${screen.device.id}">Remove</button>
    </li>`;

    return li;
}

function addScreenToOnboardListItem(onboardScreen) {
    var li =   
    `<li class="list-group-item mt-2 pb-3">
        <div class="row pb-2">
            <div id="badges-${onboardScreen.device.id}" class="col-12">
            </div>
        </div>
        <div class="row g-2 pb-2">
            <div class="col-12">
                <div class="input-group">
                    <form class="form-floating">
                        <input type="text" class="form-control border-end-0" id="form-devicename-${onboardScreen.device.id}" placeholder=""
                            value="${onboardScreen.device.name}" readonly>
                        <label for="form-devicename-${onboardScreen.device.id}">Device Name</label>
                    </form>
                    <button class="btn btn-link border border-start-0 text-decoration-none" style="border-color: #ced4da!important;" data-bs-toggle="collapse" data-bs-target="#collapse-${onboardScreen.device.id}">Edit <i class="bi bi-chevron-down"></i></button>
                </div>
            </div>
        </div>
        <div id="collapse-${onboardScreen.device.id}" class="row g-2 mx-1 px-1 pb-2 border-start border-end border-bottom border-1 rounded-bottom bg-light collapse">
            <div class="col-3">
                <div class="form-floating">
                    <select class="form-select" id="form-assetcategory-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select type</option>
                        <option value="Billboard">Billboard</option>
                        <option value="Cinema">Cinema</option>
                        <option value="Display Panel">Display Panel</option>
                        <option value="Elevator Display">Elevator Display</option>
                        <option value="Kiosk">Kiosk</option>
                        <option value="Point of Sale">Point of Sale</option>
                        <option value="Screen">Screen/TV Monitor</option>
                        <option value="Shelter">Shelter</option>
                        <option value="Spectacular">Spectacular</option>
                        <option value="Vending Machine">Vending Machine</option>
                    </select>
                    <label for="form-assetcategory-${onboardScreen.device.id}">Device Category</label>
                </div>
            </div>
            <div class="col-6">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-assetname-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-assetname-${onboardScreen.device.id}">Model</label>
                </form>
            </div>
            <div class="col-3">
                <div class="input-group">
                    <form class="form-floating">
                        <input type="text" class="form-control" id="form-assetsize-${onboardScreen.device.id}" placeholder=""
                            value="">
                        <label for="form-assetsize-${onboardScreen.device.id}">Screen Size</label>
                    </form>
                    <span class="input-group-text">inch</span>
                </div>
            </div>
            <div class="col-3">
                <div class="form-floating">
                    <select class="form-select" id="form-venuecategory-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select venue</option>
                        <option value="1.101">Airports</option>
                        <option value="11.1101">Apartment Buildings</option>
                        <option value="1.101.10101">Arrival Hall</option>
                        <option value="1.101.10102">Baggage Claim</option>
                        <option value="10.1001">Banks</option>
                        <option value="8.804">Bars</option>
                        <option value="3.301">Billboards</option>
                        <option value="1.102.10201">Bus</option>
                        <option value="3.303">Bus Shelters</option>
                        <option value="1.102">Buses Displays</option>
                        <option value="8.805">Casual Dining</option>
                        <option value="2.203.20302">Check Out</option>
                        <option value="8.803.80302">Club House</option>
                        <option value="6.602">Colleges and Universities</option>
                        <option value="8.801.80103">Concert Venues</option>
                        <option value="2.205.20501">Concourse</option>
                        <option value="2.202">Convenience Stores</option>
                        <option value="1.101.10103">Departures Hall</option>
                        <option value="2.206">Dispensaries</option>
                        <option value="9.901">DMVs</option>
                        <option value="5.501">Doctor's Offices</option>
                        <option value="6">Education</option>
                        <option value="7.701.70101">Elevator (Office)</option>
                        <option value="8.807.80702">Elevator (Hotel)</option>
                        <option value="11.1101.110102">Elevator (Residential)</option>
                        <option value="8">Entertainment</option>
                        <option value="10">Financial</option>
                        <option value="4.401.40102">Fitness Equipment</option>
                        <option value="1.101.10104">Food Court (Airport)</option>
                        <option value="2.205.20502">Food Court (Mall)</option>
                        <option value="8.802.80202">Food Court (Movie Theater)</option>
                        <option value="2.201">Gas Stations</option>
                        <option value="1.101.10105">Gates</option>
                        <option value="8.808">Golf Carts</option>
                        <option value="9">Government</option>
                        <option value="2.203">Grocery</option>
                        <option value="4.401">Gyms</option>
                        <option value="4">Health & Beauty</option>
                        <option value="3.301.30102">Highway</option>
                        <option value="8.807">Hotels</option>
                        <option value="2.204">Liquor Stores</option>
                        <option value="4.401.40101">Lobby (Gym)</option>
                        <option value="7.701.70102">Lobby (Office)</option>
                        <option value="8.802.80201">Lobby (Movie Theater)</option>
                        <option value="8.807.80701">Lobby (Hotel)</option>
                        <option value="11.1101.110101">Lobby (Residential)</option>
                        <option value="1.101.10106">Lounges</option>
                        <option value="2.205">Mall</option>
                        <option value="9.902">Military Bases</option>
                        <option value="8.802">Movie Theaters</option>
                        <option value="8.801.80102">Museums and Galleries</option>
                        <option value="7.701">Office Buildings</option>
                        <option value="3">Outdoor</option>
                        <option value="2.208">Parking Garages</option>
                        <option value="2.207">Pharmacies</option>
                        <option value="1.105.10502">Platform (Subway)</option>
                        <option value="1.106.10602">Platform (Train Station)</option>
                        <option value="5">Point of Care</option>
                        <option value="2.201.20101">Pump</option>
                        <option value="8.806">QSR</option>
                        <option value="8.801">Recreational Locations</option>
                        <option value="11">Residential</option>
                        <option value="2">Retail</option>
                        <option value="3.301.30101">Roadside</option>
                        <option value="4.402">Salons</option>
                        <option value="6.601">Schools</option>
                        <option value="2.201.20102">Shop</option>
                        <option value="2.203.20301">Shop Entrance</option>
                        <option value="1.101.10107">Shopping Area</option>
                        <option value="4.403">Spas</option>
                        <option value="2.205.20503">Spectacular (Malls)</option>
                        <option value="3.301.30103">Spectacular (Billboards)</option>
                        <option value="8.803.80301">Sport Arena</option>
                        <option value="8.803">Sports Entertainment</option>
                        <option value="1.105">Subway</option>
                        <option value="1.105.10501">Subway Train</option>
                        <option value="1.104">Taxi & Rideshare Top</option>
                        <option value="1.103">Taxi & Rideshare TV</option>
                        <option value="1.102.10202">Terminal</option>
                        <option value="8.801.80101">Theme Parks</option>
                        <option value="1.106.10601">Train</option>
                        <option value="1.106">Train Stations</option>
                        <option value="1">Transit</option>
                        <option value="3.302">Urban Panels</option>
                        <option value="5.502">Veterinary Offices</option>
                    </select>
                    <label for="form-venuecategory-${onboardScreen.device.id}">Venue Category</label>
                </div>
            </div>
            <div class="col-6">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-venuename-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-venuename-${onboardScreen.device.id}">Location Name</label>
                </form>
            </div>
            <div class="col-3">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-venueid-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-venueid-${onboardScreen.device.id}">Location ID</label>
                </form>
            </div>
            <div class="col-6">
                <div class="form-floating">
                    <select class="form-select" id="form-placementcategory-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select placement</option>
                        <option value="2">Above Bar</option>
                        <option value="12">Above Food Sales</option>
                        <option value="9">Above Interactive Zone</option>
                        <option value="32">Above Staircase</option>
                        <option value="36">Airport Gate</option>
                        <option value="37">Aisle</option>
                        <option value="5">At Pump</option>
                        <option value="34">Baggage Claim</option>
                        <option value="8">Bathroom</option>
                        <option value="38">Bathroom Exterior</option>
                        <option value="29">Bathroom Men</option>
                        <option value="31">Bathroom Unisex</option>
                        <option value="30">Bathroom Women</option>
                        <option value="17">Cart</option>
                        <option value="18">Cart Return</option>
                        <option value="39">Checkout Area</option>
                        <option value="22">Concourse</option>
                        <option value="40">Curbside</option>
                        <option value="19">Customer Service Area</option>
                        <option value="16">Dining Area</option>
                        <option value="7">Elevator</option>
                        <option value="25">Elevator Lobby</option>
                        <option value="41">Endcap</option>
                        <option value="3">Entrance/Exit</option>
                        <option value="42">EV Charging Parking</option>
                        <option value="21">Fare Gate</option>
                        <option value="23">Fare Machines</option>
                        <option value="6">Hallway</option>
                        <option value="35">In Queue</option>
                        <option value="26">In Seating</option>
                        <option value="10">Inside Auditorium</option>
                        <option value="11">Interior Corridor</option>
                        <option value="43">Jet Bridge</option>
                        <option value="44">Lobby</option>
                        <option value="45">Locker Room Men</option>
                        <option value="46">Locker Room Women</option>
                        <option value="47">Merge Point</option>
                        <option value="1">One On One</option>
                        <option value="28">Open Floor</option>
                        <option value="24">Parking Lot</option>
                        <option value="27">Pet Relief Area</option>
                        <option value="20">Platform</option>
                        <option value="48">Playground</option>
                        <option value="15">Recptacle Area</option>
                        <option value="4">Register</option>
                        <option value="49">Resident Amenity</option>
                        <option value="50">Resident Laundry Room</option>
                        <option value="51">Resident Mailroom</option>
                        <option value="14">Scoreboard</option>
                        <option value="33">Ticketing/Check-in</option>
                        <option value="13">Waiting Area</option>
                    </select>
                    <label for="form-placementcategory-${onboardScreen.device.id}">Placement Category</label>
                </div>
            </div>
            <div class="col-6">
                <div class="form-floating">
                    <select class="form-select" id="form-structurecategory-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select structure</option>
                        <option value="1">Ceiling</option>
                        <option value="13">Column</option>
                        <option value="8">Elevator</option>
                        <option value="3">Exterior Wall</option>
                        <option value="11">Floor</option>
                        <option value="9">Freestanding</option>
                        <option value="10">Furniture</option>
                        <option value="2">Interior Wall</option>
                        <option value="12">Rooftop</option>
                        <option value="7">Stairs</option>
                        <option value="4">Tablet</option>
                        <option value="6">Vechicle Exterior</option>
                        <option value="5">Vehicle Interior</option>
                    </select>
                    <label for="form-structurecategory-${onboardScreen.device.id}">Structure Category</label>
                </div>
            </div>
            <div class="col-12">
                <div class="form-floating">
                    <textarea class="form-control" id="form-locationaddress-${onboardScreen.device.id}" placeholder="" readonly>${onboardScreen.location.street_address_1}</textarea>
                    <label for="form-locationaddress-${onboardScreen.device.id}">Location Address</label>
                </div>
            </div>
            <ul id="formhelp-${onboardScreen.device.id}" class="form-text ms-4">
            </ul>
            <div class="col-12 text-end">
                <button class="btn btn-primary" id="btn-reload-${onboardScreen.device.id}">Reload from Studio</button>
                <button class="btn btn-primary" id="btn-save-${onboardScreen.device.id}">Save and Add to List</button>
            </div>
        </div>
    </li>`;
    
    return li;
}

//https://stackoverflow.com/a/1186465
function gcd(a, b) {
    return (b == 0) ? a : gcd(b, a % b);
}