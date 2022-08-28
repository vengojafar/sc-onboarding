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
        $("#loading-screens").removeClass("d-none");
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
    li += '<button class="btn btn-sm btn-outline-dark btn-add" onclick="addScreenEvent(\'' + screen.id + '\')">Add</button>';
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
    var r = gcd(screen.playerWidth, screen.playerHeight);
    onboardScreen.asset.aspect_ratio = parseInt(screen.playerWidth) / r + ":" + parseInt(screen.playerHeight) / r;

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

    onboardedScreensArr.push(onboardScreen);
    $("#onboard-count").text(onboardedScreensArr.length)

    $("#list-onboardscreens").append(addScreenToOnboardListItem(onboardScreen));
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

function addScreenToOnboardListItem(onboardScreen) {
    var li =   
    `<li class="list-group-item mt-2 pb-3">
        <div class="row g-2 pb-2">
            <div class="col-12">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-devicename-${onboardScreen.device.id}" placeholder=""
                        value="${onboardScreen.device.name}" readonly>
                    <label for="form-devicename-${onboardScreen.device.id}">Device Name</label>
                </form>
            </div>
        </div>
        <div class="row g-2 mx-1 px-1 pb-2 border-start border-end border-bottom border-1 rounded-bottom bg-light">
            <div class="col-3">
                <div class="form-floating">
                    <select class="form-select" id="form-assetcategory-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select type</option>
                        <option value="asset-1">Billboard</option>
                        <option value="asset-2">Cinema</option>
                        <option value="asset-3">Display Panel</option>
                        <option value="asset-4">Elevator Display</option>
                        <option value="asset-5">Kiosk</option>
                        <option value="asset-6">Point of Sale</option>
                        <option value="asset-7">Screen/TV Monitor</option>
                        <option value="asset-8">Shelter</option>
                        <option value="asset-9">Spectacular</option>
                        <option value="asset-10">Vending Machine</option>
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
                        <option value="venue-1">Airports</option>
                        <option value="venue-2">Apartment Buildings</option>
                        <option value="venue-3">Arrival Hall</option>
                        <option value="venue-4">Baggage Claim</option>
                        <option value="venue-5">Banks</option>
                        <option value="venue-6">Bars</option>
                        <option value="venue-7">Billboards</option>
                        <option value="venue-8">Bus</option>
                        <option value="venue-9">Bus Shelters</option>
                        <option value="venue-10">Buses Displays</option>
                        <option value="venue-11">Casual Dining</option>
                        <option value="venue-12">Check Out</option>
                        <option value="venue-13">Club House</option>
                        <option value="venue-14">Colleges and Universities</option>
                        <option value="venue-15">Concert Venues</option>
                        <option value="venue-16">Concourse</option>
                        <option value="venue-17">Convenience Stores</option>
                        <option value="venue-18">Departures Hall</option>
                        <option value="venue-19">Dispensaries</option>
                        <option value="venue-20">DMVs</option>
                        <option value="venue-21">Doctor's Offices</option>
                        <option value="venue-22">Education</option>
                        <option value="venue-23">Elevator (Office)</option>
                        <option value="venue-24">Elevator (Hotel)</option>
                        <option value="venue-25">Elevator (Residential)</option>
                        <option value="venue-26">Entertainment</option>
                        <option value="venue-27">Financial</option>
                        <option value="venue-28">Fitness Equipment</option>
                        <option value="venue-29">Food Court (Airport)</option>
                        <option value="venue-30">Food Court (Mall)</option>
                        <option value="venue-31">Food Court (Movie Theater)</option>
                        <option value="venue-32">Gas Stations</option>
                        <option value="venue-33">Gates</option>
                        <option value="venue-34">Golf Carts</option>
                        <option value="venue-35">Government</option>
                        <option value="venue-36">Grocery</option>
                        <option value="venue-37">Gyms</option>
                        <option value="venue-38">Health & Beauty</option>
                        <option value="venue-39">Highway</option>
                        <option value="venue-40">Hotels</option>
                        <option value="venue-41">Liquor Stores</option>
                        <option value="venue-42">Lobby (Gym)</option>
                        <option value="venue-43">Lobby (Office)</option>
                        <option value="venue-44">Lobby (Movie Theater)</option>
                        <option value="venue-45">Lobby (Hotel)</option>
                        <option value="venue-46">Lobby (Residential)</option>
                        <option value="venue-47">Lounges</option>
                        <option value="venue-48">Mall</option>
                        <option value="venue-49">Military Bases</option>
                        <option value="venue-50">Movie Theaters</option>
                        <option value="venue-51">Museums and Galleries</option>
                        <option value="venue-52">Office Buildings</option>
                        <option value="venue-53">Office Buildings</option>
                        <option value="venue-54">Outdoor</option>
                        <option value="venue-55">Parking Garages</option>
                        <option value="venue-56">Pharmacies</option>
                        <option value="venue-57">Platform (Subway)</option>
                        <option value="venue-58">Platform (Train Station)</option>
                        <option value="venue-59">Point of Care</option>
                        <option value="venue-60">Pump</option>
                        <option value="venue-61">QSR</option>
                        <option value="venue-62">Recreational Locations</option>
                        <option value="venue-63">Residential</option>
                        <option value="venue-64">Retail</option>
                        <option value="venue-65">Roadside</option>
                        <option value="venue-66">Salons</option>
                        <option value="venue-67">Schools</option>
                        <option value="venue-68">Shop</option>
                        <option value="venue-69">Shop Entrance</option>
                        <option value="venue-70">Shopping Area</option>
                        <option value="venue-71">Spas</option>
                        <option value="venue-72">Spectacular (Malls)</option>
                        <option value="venue-73">Spectacular (Billboards)</option>
                        <option value="venue-74">Sport Arena</option>
                        <option value="venue-75">Sports Entertainment</option>
                        <option value="venue-76">Subway</option>
                        <option value="venue-77">Subway Train</option>
                        <option value="venue-78">Taxi & Rideshare Top</option>
                        <option value="venue-79">Taxi & Rideshare TV</option>
                        <option value="venue-80">Terminal</option>
                        <option value="venue-81">Theme Parks</option>
                        <option value="venue-82">Train</option>
                        <option value="venue-83">Train Stations</option>
                        <option value="venue-84">Transit</option>
                        <option value="venue-85">Urban Panels</option>
                        <option value="venue-86">Veterinary Offices</option>
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
                    <select class="form-select" id="form-placementname-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select placement</option>
                        <option value="placement-2">Above Bar</option>
                        <option value="placement-12">Above Food Sales</option>
                        <option value="placement-9">Above Interactive Zone</option>
                        <option value="placement-32">Above Staircase</option>
                        <option value="placement-36">Airport Gate</option>
                        <option value="placement-37">Aisle</option>
                        <option value="placement-5">At Pump</option>
                        <option value="placement-34">Baggage Claim</option>
                        <option value="placement-8">Bathroom</option>
                        <option value="placement-38">Bathroom Exterior</option>
                        <option value="placement-29">Bathroom Men</option>
                        <option value="placement-31">Bathroom Unisex</option>
                        <option value="placement-30">Bathroom Women</option>
                        <option value="placement-17">Cart</option>
                        <option value="placement-18">Cart Return</option>
                        <option value="placement-39">Checkout Area</option>
                        <option value="placement-22">Concourse</option>
                        <option value="placement-40">Curbside</option>
                        <option value="placement-19">Customer Service Area</option>
                        <option value="placement-16">Dining Area</option>
                        <option value="placement-7">Elevator</option>
                        <option value="placement-25">Elevator Lobby</option>
                        <option value="placement-41">Endcap</option>
                        <option value="placement-3">Entrance/Exit</option>
                        <option value="placement-42">EV Charging Parking</option>
                        <option value="placement-21">Fare Gate</option>
                        <option value="placement-23">Fare Machines</option>
                        <option value="placement-6">Hallway</option>
                        <option value="placement-35">In Queue</option>
                        <option value="placement-26">In Seating</option>
                        <option value="placement-10">Inside Auditorium</option>
                        <option value="placement-11">Interior Corridor</option>
                        <option value="placement-43">Jet Bridge</option>
                        <option value="placement-44">Lobby</option>
                        <option value="placement-45">Locker Room Men</option>
                        <option value="placement-46">Locker Room Women</option>
                        <option value="placement-47">Merge Point</option>
                        <option value="placement-1">One On One</option>
                        <option value="placement-28">Open Floor</option>
                        <option value="placement-24">Parking Lot</option>
                        <option value="placement-27">Pet Relief Area</option>
                        <option value="placement-20">Platform</option>
                        <option value="placement-48">Playground</option>
                        <option value="placement-15">Recptacle Area</option>
                        <option value="placement-4">Register</option>
                        <option value="placement-49">Resident Amenity</option>
                        <option value="placement-50">Resident Laundry Room</option>
                        <option value="placement-51">Resident Mailroom</option>
                        <option value="placement-14">Scoreboard</option>
                        <option value="placement-33">Ticketing/Check-in</option>
                        <option value="placement-13">Waiting Area</option>
                    </select>
                    <label for="form-placementname-${onboardScreen.device.id}">Placement Category</label>
                </div>
            </div>
            <div class="col-6">
                <div class="form-floating">
                    <select class="form-select" id="form-structurename-${onboardScreen.device.id}">
                        <option value="" disabled selected>Select structure</option>
                        <option value="structure-1">Ceiling</option>
                        <option value="structure-2">Column</option>
                        <option value="structure-3">Elevator</option>
                        <option value="structure-4">Exterior Wall</option>
                        <option value="structure-5">Floor</option>
                        <option value="structure-6">Freestanding</option>
                        <option value="structure-7">Furniture</option>
                        <option value="structure-8">Interior Wall</option>
                        <option value="structure-9">Rooftop</option>
                        <option value="structure-10">Stairs</option>
                        <option value="structure-11">Tablet</option>
                        <option value="structure-12">Vechicle Exterior</option>
                        <option value="structure-13">Vehicle Interior</option>
                    </select>
                    <label for="form-structurename-${onboardScreen.device.id}">Structure Category</label>
                </div>
            </div>
            <div class="col-12">
                <div class="form-floating">
                    <textarea class="form-control" id="form-locationaddress-${onboardScreen.device.id}" placeholder="" readonly>${onboardScreen.location.street_address_1}</textarea>
                    <label for="form-locationaddress-${onboardScreen.device.id}">Location Address</label>
                </div>
            </div>
            <div class="col-12 text-end">
                <button class="btn btn-primary" id="btn-reload-${onboardScreen.device.id}">Reload from Studio</button>
                <button class="btn btn-primary" id="btn-save-${onboardScreen.device.id}">Save</button>
            </div>
        </div>
    </li>`;
    
    return li;
}

//https://stackoverflow.com/a/1186465
function gcd(a, b) {
    return (b == 0) ? a : gcd(b, a % b);
}