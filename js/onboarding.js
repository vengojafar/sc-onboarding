var organizationName = "";
var onboardedScreensArr = [];

$("#btn-submit-apikey").click(function () {
    var apiKey = $("#text-apikey").val();

    if (apiKey.includes(":")) {
        $(this).addClass("disabled");
        $("#icon-error").addClass("d-none");
        checkApiKeyAndGetOrgName(apiKey, apiCheckCallback);
    }
});

function apiCheckCallback(isValid, orgName) {
    if (isValid) {
        $("#icon-success").removeClass("d-none");
        $("#card-allscreens").removeClass("d-none");
        organizationName = orgName;
        getAllScreens(screensCallback);
    }
    else {
        $("#icon-error").removeClass("d-none");
        $("#btn-submit-apikey").removeClass("disabled");
    }
}

function screensCallback(screensArr) {
    $("#loading-screens").addClass("d-none");
    $("#list-allscreens").removeClass("d-none");
    $("#screen-count").text(screensArr.length)
    screensArr.forEach(screen => {
        $("#list-allscreens").append(addToAllScreensList(screen));
    });
}

function addToAllScreensList(screen) {
    var li = '<li class="list-group-item">';
    li += '<div class="row">';
    li += '<div class="col-2">';
    li += (screen.isConnected ? '<span class="badge bg-success">Online' : '<span class="badge bg-secondary">Offline') + '</span>';
    li += '</div>';
    li += '<div class="col-8">';
    li += screen.name;
    li += '</div>';
    li += '<div class="col-2 text-end">';
    li += '<button class="btn btn-sm btn-outline-dark btn-add" onclick="addScreenEvent(\'' + screen.id + '\')">Add to list</button>';
    li += '</div>';
    li += '</div>';
    li += '</li>';

    return li;
}

function addScreenEvent(id) {
    getScreenById(id, parseScreen);
}

function parseScreen(screen) {
    var onboardScreen = {
        "network_name": organizationName,
        "asset": {},
        "device": {},
        "venue": {},
        "location": {},
        "slot": {},
        "restrictions": {},
        "operating_hours": {}
    };
    onboardScreen.asset.name = "";
    onboardScreen.asset.category = "";
    onboardScreen.asset.size = "";
    onboardScreen.asset.aspect_ratio = screen.playerWidth + ":" + screen.playerHeight;

    onboardScreen.device.id = screen.id;
    onboardScreen.device.name = screen.name;
    onboardScreen.device.description = screen.deviceModel + " " + screen.devicePlatform;

    onboardScreen.venue.id = "";
    onboardScreen.venue.name = "";
    onboardScreen.venue.category_name = "";

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
    onboardScreen.location.structure_type_name = "";
    onboardScreen.location.placement_type_name = "";

    onboardScreen.slot.height = screen.playerHeight;
    onboardScreen.slot.width = screen.playerWidth;
    onboardScreen.slot.top_left_x = 0;
    onboardScreen.slot.top_left_y = 0;
    onboardScreen.slot.duration = 15;
    onboardScreen.slot.share_of_voice = 0.25;

    onboardScreen.restrictions.creative_categories = "";
    onboardScreen.restrictions.other = "";

    onboardScreen.operating_hours.always_open = "";
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

    onboardedScreensArr.push(onboardScreen);
    $("#onboard-count").text(onboardedScreensArr.length)

    $("#list-onboardscreens").append(addToOnboardScreenList(onboardScreen));
}

function addToOnboardScreenList(screen) {
    var li = '<li class="list-group-item">';
    li += '<div class="row">';
    li += '<div class="col-12">';
    li += '<p>' + JSON.stringify(screen) + '</p>';
    li += '</div>';
    li += '</div>';
    li += '</li>';

    return li;
}