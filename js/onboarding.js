var organizationName = "";
var onboardedScreensArr = [];
var allScreensToOnboardArr = [];

toastr.options.escapeHtml = true;

$(document).ready(function () {
    $("#btn-submit-apikey").click(function () {
        var apiKey = $("#text-apikey").val();

        if (apiKey.includes(":")) {
            $(this).blur();
            $(this).addClass("disabled");
            $("#icon-error").addClass("d-none");
            checkApiKeyAndGetOrgName(apiKey, apiCheckCallback);
        }
        else{
            Swal.fire({
                icon: 'error',
                title: 'Invalid API Key',
                text: 'The API key entered is in an invalid format.',
            })
        }
    });

    $("#btn-export-screens").click(function () {
        if (onboardedScreensArr.length > 0) {
            var apiKey = $("#text-apikey").val();

            var jObj = {
                "organization_name": organizationName,
                "screencloud_key": apiKey,
                "email": "",
                "screens": onboardedScreensArr
            };

            var fileName = `vengo_export-${Date.now()}.json`;
            var fileToSave = new Blob([JSON.stringify(jObj, undefined, 2)], {
                type: 'application/json'
            });
            console.log(fileName);
            saveAs(fileToSave, fileName);
        }
    });

    $("#btn-submit-screens").click(function () {
        if (onboardedScreensArr.length > 0){
            Swal.fire({
                title: 'Submit List?',
                text: "List of screens will be sent to Vengo for onboarding",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Save'
            }).then((result) => {
                if (result.isConfirmed) {
                    var apiKey = $("#text-apikey").val();

                    var jObj = {
                        "organization_name": organizationName,
                        "screencloud_key": apiKey,
                        "email": "",
                        "screens": onboardedScreensArr
                    };

                    var csvHtml = "";
                    onboardedScreensArr.forEach(onboardScreen => {
                        csvHtml += `${onboardScreen.network_name};${onboardScreen.venue.id};${onboardScreen.venue.name};${onboardScreen.venue.category_code};${onboardScreen.asset.name};${onboardScreen.asset.category};${onboardScreen.asset.size};${onboardScreen.asset.aspect_ratio};"video/mp4";${onboardScreen.device.id};${onboardScreen.device.name};${onboardScreen.device.description};${onboardScreen.location.street_address_1};${onboardScreen.location.street_address_2};${onboardScreen.location.city};${onboardScreen.location.state};${onboardScreen.location.postal_code};${onboardScreen.location.country};${onboardScreen.location.latitude};${onboardScreen.location.longitude};${onboardScreen.location.structure_type_code};${onboardScreen.location.placement_type_code};;;${onboardScreen.slot.height};${onboardScreen.slot.width};${onboardScreen.slot.top_left_x};${onboardScreen.slot.top_left_y};${onboardScreen.slot.duration};${onboardScreen.slot.share_of_voice};${onboardScreen.restrictions.creative_categories};${onboardScreen.restrictions.other};${onboardScreen.operating_hours.always_open} <br>`;
                    });

                    //$("#json-string").text(JSON.stringify(jObj, undefined, 2));
                    //$("#csv-string").html(csvHtml);

                    //console.log(csvHtml);
                    console.log(jObj);

                    var url = "https://staging.vengo.tv/onboard/screencloud";
                    //url = "https://localhost:5001/onboard/screencloud";
                    var xhr = new XMLHttpRequest();
                    xhr.addEventListener("readystatechange", function () {
                        if (this.readyState === 4 && this.status === 200) {
                            toastr.success('List successfully sent to Vengo');
                            $("#btn-submit-screens").hide();
                        }
                    });
                    xhr.open("POST", url);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.send(JSON.stringify(jObj));
                }
            })
        }
        
    });

    $(".accordion-button").click(function (){
        var target = $(this).attr('data-bs-target');
        var loaded = $(this).attr('data-loaded');

        if (loaded == undefined)
        {
            Swal.fire({
                title:'Loading...',
                showConfirmButton:false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            if (target.includes("online-notonboarded")) {
                setTimeout(() => {
                    allScreensToOnboardArr.forEach(onboardScreen => {
                        if (onboardScreen.is_connected && onboardScreen.env.ad_unit_id == null) {
                            $("#list-online-notonboarded").append(addScreenToOnboardListItem(onboardScreen));
                            populateScreenForms(onboardScreen);
                        }
                    });
                    $(this).attr('data-loaded', true);
                    Swal.close();
                }, 500);
                
            }
            else if (target.includes("online-onboarded"))
            {
                setTimeout(() => {
                    allScreensToOnboardArr.forEach(onboardScreen => {
                        if (onboardScreen.is_connected && onboardScreen.env.ad_unit_id != null) {
                            $("#list-online-onboarded").append(addScreenToOnboardListItem(onboardScreen));
                            populateScreenForms(onboardScreen);
                        }
                    });
                    $(this).attr('data-loaded', true);
                    Swal.close();
                }, 500);
            }
            else if (target.includes("offline-onboarded")) {
                setTimeout(() => {
                    allScreensToOnboardArr.forEach(onboardScreen => {
                        if (!onboardScreen.is_connected && onboardScreen.env.ad_unit_id != null) {
                            $("#list-offline-onboarded").append(addScreenToOnboardListItem(onboardScreen));
                            populateScreenForms(onboardScreen);
                        }
                    });
                    $(this).attr('data-loaded', true);
                    Swal.close();
                }, 500);
            }
            else if (target.includes("offline")) {
                setTimeout(() => {
                    allScreensToOnboardArr.forEach(onboardScreen => {
                        if (!onboardScreen.is_connected && onboardScreen.env.ad_unit_id == null) {
                            $("#list-offline").append(addScreenToOnboardListItem(onboardScreen));
                            populateScreenForms(onboardScreen);
                        }
                    });
                    $(this).attr('data-loaded', true);
                    Swal.close();
                }, 500);
            }
        }
        
    });
});

function apiCheckCallback(isValid, orgName) {
    if (isValid) {
        $("#icon-success").removeClass("d-none");
        $("#loading-screens").removeClass("d-none");
        organizationName = orgName;
        getAllScreens(allScreensCallback);
        setTimeout(() => {
            new bootstrap.Collapse('#collapse-apikey', {hide: true})
        }, 1000);
    }
    else {
        $("#icon-error").removeClass("d-none");
        $("#btn-submit-apikey").removeClass("disabled");
    }
}

function allScreensCallback(screensArr) {
    screensArr.forEach(screen => {
        var onboardScreen = generateOnboardScreenObj(screen, screen.isConnected);
        allScreensToOnboardArr.push(onboardScreen);
    });

    $("#org-name").text(organizationName);
    $("#screen-count").text(allScreensToOnboardArr.length)

    updateAllScreensList();

    $("#loading-screens").addClass("d-none");
    $("#acc-allscreens").removeClass("d-none");
    //$("#collapse-online-notonboarded").addClass("show");
    $("#div-onboard").removeClass("d-none");
}

function updateAllScreensList() {
    //$("#list-allscreens").empty();
    $("#list-online-notonboarded").empty();
    $("#list-online-onboarded").empty();
    $("#list-offline-onboarded").empty();
    $("#list-offline").empty();

    var onlineOnboardedCount = 0;
    var onlineNotOnboardedCount = 0;
    var offlineOnboardedCount = 0;
    var offlineCount = 0;

    allScreensToOnboardArr.forEach(onboardScreen => {
        if (onboardScreen.is_connected){
            if (onboardScreen.env.ad_unit_id != null){
                onlineOnboardedCount++;
                $("#online-onboarded-count").text(onlineOnboardedCount)
            }
            else {
                onlineNotOnboardedCount++;
                $("#online-notonboarded-count").text(onlineNotOnboardedCount)
            }
        }
        else {
            if (onboardScreen.env.ad_unit_id != null) {
                offlineOnboardedCount++;
                $("#offline-onboarded-count").text(offlineOnboardedCount)
                
            }
            else {
                offlineCount++;
                $("#offline-count").text(offlineCount)
            }
        }
    });
}

function populateScreenForms(onboardScreen) {
    $("#form-assetname-" + onboardScreen.device.id).val("");
    $("#form-assetsize-" + onboardScreen.device.id).val("");
    $("#form-venuename-" + onboardScreen.device.id).val("");
    $("#form-venueid-" + onboardScreen.device.id).val("");

    $(`#btn-save-${onboardScreen.device.id}`).click(function () {
        $(`#formhelp-${onboardScreen.device.id}`).empty();

        if (onboardScreen.device.name == "ScreenCloud Player") {
            $(`#formhelp-${onboardScreen.device.id}`).append(`<li>Warning: Device name should changed in Studio.</li>`);
        }

        if (inputtedParametersAreValid(onboardScreen.device.id)) {
            Swal.fire({
                title: 'Save and Add to List?',
                text: onboardScreen.device.name + " will be onboarded as " + generateFormattedDeviceName($("#form-venuename-" + onboardScreen.device.id).val(), $("#form-venueid-" + onboardScreen.device.id).val(), $("#form-venueplacement-" + onboardScreen.device.id).val(), onboardScreen.network_name),
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continue'
            }).then((result) => {
                if (result.isConfirmed) {
                    addOrUpdateOnboardedScreen(onboardScreen);
                    updateOnboardedScreenList();
                    toastr.success(onboardScreen.device.name + ' has been added to the onboarding list');
                    setEnvInStudio(onboardScreen.device.id, onboardScreen.env, function () {
                        toastr.info('Changes have been saved to Studio');
                    });
                    if (($(this).text()).includes("Add")) {
                        $(`#badges-${onboardScreen.device.id}`).append(`<span class="badge bg-primary">Added</span>`);
                    }

                    $(this).text("Update Screen");
                    new bootstrap.Collapse(`#collapse-${onboardScreen.device.id}`, { toggle: true });

                    $(`#btn-reload-${onboardScreen.device.id}`).hide();
                }
            })
        }
        else {
            $(`#formhelp-${onboardScreen.device.id}`).append(`<li>Error: Each parameter needs to be filled in.</li>`);
        }
    });

    $(`#btn-reload-${onboardScreen.device.id}`).click(function () {
        reloadFromStudio(onboardScreen.device.id);
    });

    $(`#btn-copy-${onboardScreen.device.id}`).click(function () {
        $("#form-assetname-" + onboardScreen.device.id).val($("#form-assetname-default").val());
        $("#form-assetsize-" + onboardScreen.device.id).val($("#form-assetsize-default").val());
        $("#form-venuename-" + onboardScreen.device.id).val($("#form-venuename-default").val());
        $("#form-venueplacement-" + onboardScreen.device.id).val($("#form-venueplacement-default").val());
        $("#form-assetcategory-" + onboardScreen.device.id).val($("#form-assetcategory-default").val());
        $("#form-venuecategory-" + onboardScreen.device.id).val($("#form-venuecategory-default").val());
        $("#form-placementcategory-" + onboardScreen.device.id).val($("#form-placementcategory-default").val());
        $("#form-structurecategory-" + onboardScreen.device.id).val($("#form-structurecategory-default").val());
    });

    $(`#formhelp-${onboardScreen.device.id}`).empty();
    $(`#badges-${onboardScreen.device.id}`).empty();

    $(`#badges-${onboardScreen.device.id}`).append(`${(onboardScreen.is_connected ? '<span class="badge bg-success">Online' : '<span class="badge bg-secondary">Offline') + '</span> '}`);
    $(`#badges-${onboardScreen.device.id}`).append(`${(onboardScreen.location.postal_code == "" ? '<span class="badge bg-danger">Address Incomplete</span> ' : "")}`);
    $(`#badges-${onboardScreen.device.id}`).append(`${(onboardScreen.env.ad_unit_id != null ? '<span class="badge bg-warning">Onboarded</span> ' : "")}`);
    $(`#badges-${onboardScreen.device.id}`).append(`${((onboardScreen.env["vengo.onboarded"] != null && onboardScreen.env["vengo.onboarded"] != false) ? '<span class="badge bg-success">Ads Enabled</span> ' : "")}`);

    $(`#form-devicename-${onboardScreen.device.id}`).val(onboardScreen.device.name);
    $(`#form-locationaddress-${onboardScreen.device.id}`).val(`${onboardScreen.location.street_address_1}, ${onboardScreen.location.city}, ${onboardScreen.location.state} ${onboardScreen.location.postal_code}`);
    $(`#form-locationaddress-${onboardScreen.device.id}`).attr('title', `Lat/Long: ${onboardScreen.location.latitude}, ${onboardScreen.location.longitude}`)

    if (onboardScreen.location.street_address_1 == "") {
        $(`#btn-save-${onboardScreen.device.id}`).hide();
        $(`#formhelp-${onboardScreen.device.id}`).append(`<li>Error: Incomplete address</li>`);
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

    if (onboardScreen.venue.placement != "") {
        $("#form-venueplacement-" + onboardScreen.device.id).val(onboardScreen.venue.placement);
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
    if (onboardScreen.venue.category_code != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.venue.category_code) {
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
    if (onboardScreen.location.structure_type_code != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.location.structure_type_code) {
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
    if (onboardScreen.location.placement_type_code != "") {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == onboardScreen.location.placement_type_code) {
                $("#form-placementcategory-" + onboardScreen.device.id)[0].options[i].selected = true;
                break;
            }
        }
    }

    if (onboardScreen.device.formatted_name == "")
    {
        $("#form-formatteddevicename-" + onboardScreen.device.id).val(generateFormattedDeviceName($("#form-venuename-" + onboardScreen.device.id).val(), $("#form-venueid-" + onboardScreen.device.id).val(), $("#form-venueplacement-" + onboardScreen.device.id).val(), onboardScreen.network_name))
    }

    $("#form-venueid-" + onboardScreen.device.id).change(function() {
        $("#form-formatteddevicename-" + onboardScreen.device.id).val(generateFormattedDeviceName($("#form-venuename-" + onboardScreen.device.id).val(), $("#form-venueid-" + onboardScreen.device.id).val(), $("#form-venueplacement-" + onboardScreen.device.id).val(), onboardScreen.network_name))
    });

    $("#form-venuename-" + onboardScreen.device.id).change(function () {
        $("#form-formatteddevicename-" + onboardScreen.device.id).val(generateFormattedDeviceName($("#form-venuename-" + onboardScreen.device.id).val(), $("#form-venueid-" + onboardScreen.device.id).val(), $("#form-venueplacement-" + onboardScreen.device.id).val(), onboardScreen.network_name))
    });

    $("#form-venueplacement-" + onboardScreen.device.id).change(function () {
        $("#form-formatteddevicename-" + onboardScreen.device.id).val(generateFormattedDeviceName($("#form-venuename-" + onboardScreen.device.id).val(), $("#form-venueid-" + onboardScreen.device.id).val(), $("#form-venueplacement-" + onboardScreen.device.id).val(), onboardScreen.network_name))
    });
}

function inputtedParametersAreValid(id) {
    return ($("#form-assetcategory-" + id).val() != null &&
        $("#form-venuecategory-" + id).val() != null &&
        $("#form-placementcategory-" + id).val() != null &&
        $("#form-structurecategory-" + id).val() != null &&
        $("#form-assetname-" + id).val() != '' &&
        $("#form-assetsize-" + id).val() != '' &&
        $("#form-venuename-" + id).val() != '' &&
        $("#form-venueplacement-" + id).val() != '' &&
        $("#form-venueid-" + id).val() != '');
}

function updateOnboardedScreenList() {
    $("#onboard-count").text(onboardedScreensArr.length)
    $("#list-onboardscreens").empty();
    onboardedScreensArr.forEach(os => {
        $("#list-onboardscreens").append(addToOnboardedScreenList(os));

        $(`#btn-remove-${os.device.id}`).click(function () {
            var exisitingScreenIndex = onboardedScreensArr.findIndex(s => s.device.id === os.device.id);
            onboardedScreensArr.splice(exisitingScreenIndex, 1);

            updateOnboardedScreenList();
            populateScreenForms(os);
            $(`#btn-reload-${os.device.id}`).show();
            $(`#btn-save-${os.device.id}`).show();
            $(`#btn-save-${os.device.id}`).text("Save and Add to List");

            toastr.success(os.device.name + ' removed from the onboarding list');
        });
    });
}

function addOrUpdateOnboardedScreen(onboardScreen) {
    var id = onboardScreen.device.id;
    
    onboardScreen.asset.name = $("#form-assetname-" + id).val();
    onboardScreen.asset.size = $("#form-assetsize-" + id).val();
    onboardScreen.venue.id = $("#form-venueid-" + id).val();
    onboardScreen.venue.name = $("#form-venuename-" + id).val();
    onboardScreen.venue.placement = $("#form-venueplacement-" + id).val();
    onboardScreen.asset.category = $("#form-assetcategory-" + id).val();
    onboardScreen.venue.category_code = $("#form-venuecategory-" + id).val();
    onboardScreen.location.structure_type_code = $("#form-structurecategory-" + id).val();
    onboardScreen.location.placement_type_code = $("#form-placementcategory-" + id).val();
    onboardScreen.device.name = generateFormattedDeviceName(onboardScreen.venue.name, onboardScreen.venue.id, onboardScreen.venue.placement, onboardScreen.network_name);

    onboardScreen.env["ad_unit_id"] = onboardScreen.device.id;
    onboardScreen.env["vengo.network_name"] = onboardScreen.network_name;
    onboardScreen.env["vengo.device.name"] = onboardScreen.device.name;
    onboardScreen.env["vengo.asset.name"] = onboardScreen.asset.name;
    onboardScreen.env["vengo.asset.size"] = onboardScreen.asset.size;
    onboardScreen.env["vengo.asset.category"] = onboardScreen.asset.category;
    onboardScreen.env["vengo.venue.category_name"] = onboardScreen.venue.category_code;
    onboardScreen.env["vengo.venue.id"] = onboardScreen.venue.id;
    onboardScreen.env["vengo.venue.name"] = onboardScreen.venue.name;
    onboardScreen.env["vengo.venue.placement"] = onboardScreen.venue.placement;
    onboardScreen.env["vengo.location.structure_type_name"] = onboardScreen.location.structure_type_code;
    onboardScreen.env["vengo.location.placement_type_name"] = onboardScreen.location.placement_type_code;
    onboardScreen.env["vengo.location.street_address"] = onboardScreen.location.street_address_1;
    onboardScreen.env["vengo.location.city"] = onboardScreen.location.city;
    onboardScreen.env["vengo.location.state"] = onboardScreen.location.state;
    onboardScreen.env["vengo.location.postal_code"] = onboardScreen.location.postal_code;
    onboardScreen.env["vengo.location.country"] = onboardScreen.location.country;
    onboardScreen.env["vengo.location.latitude"] = onboardScreen.location.latitude;
    onboardScreen.env["vengo.location.longitude"] = onboardScreen.location.longitude;
    onboardScreen.env["vengo.onboarded.date"] = new Date().toISOString();
    if (onboardScreen.env["vengo.onboarded"] == null) {
        onboardScreen.env["vengo.onboarded"] = false;
    }

    var exisitingScreenIndex = onboardedScreensArr.findIndex(s => s.device.id === onboardScreen.device.id);
    if (exisitingScreenIndex > -1) {
        onboardedScreensArr[exisitingScreenIndex] = onboardScreen;
    }
    else {
        onboardedScreensArr.push(onboardScreen);
    }
}

function getScreenObjectFromId(screenId){
    var existingIndex = allScreensToOnboardArr.findIndex(s => s.device.id === screenId);
    if (existingIndex > -1)
    {
        return allScreensToOnboardArr[existingIndex];
    }

    return null;
}

function reloadFromStudio(id){
    getScreenById(id, function (screen) {
        var newOnboardScreen = generateOnboardScreenObj(screen, screen.isConnected);
        var exisitingScreenIndex = allScreensToOnboardArr.findIndex(s => s.device.id === newOnboardScreen.device.id);
        allScreensToOnboardArr[exisitingScreenIndex] = newOnboardScreen;
        $(`#btn-save-${id}`).show();
        populateScreenForms(newOnboardScreen);

        toastr.info('Reloaded screen from Studio');
    });
}

function saveAddressInStudio(onboardScreen, placeObj){
    var id = onboardScreen.device.id;
    onboardScreen.asset.name = $("#form-assetname-" + id).val();
    onboardScreen.asset.size = $("#form-assetsize-" + id).val();
    onboardScreen.venue.id = $("#form-venueid-" + id).val();
    onboardScreen.venue.name = $("#form-venuename-" + id).val();
    onboardScreen.venue.placement = $("#form-venueplacement-" + id).val();
    onboardScreen.asset.category = $("#form-assetcategory-" + id).val();
    onboardScreen.venue.category_code = $("#form-venuecategory-" + id).val();
    onboardScreen.location.structure_type_code = $("#form-structurecategory-" + id).val();
    onboardScreen.location.placement_type_code = $("#form-placementcategory-" + id).val();

    onboardScreen.env["vengo.asset.name"] = onboardScreen.asset.name;
    onboardScreen.env["vengo.asset.size"] = onboardScreen.asset.size;
    onboardScreen.env["vengo.asset.category"] = onboardScreen.asset.category;
    onboardScreen.env["vengo.venue.category_name"] = onboardScreen.venue.category_code;
    onboardScreen.env["vengo.venue.id"] = onboardScreen.venue.id;
    onboardScreen.env["vengo.venue.name"] = onboardScreen.venue.name;
    onboardScreen.env["vengo.venue.placement"] = onboardScreen.venue.placement;
    onboardScreen.env["vengo.location.structure_type_name"] = onboardScreen.location.structure_type_code;
    onboardScreen.env["vengo.location.placement_type_name"] = onboardScreen.location.placement_type_code;

    onboardScreen.env["vengo.location.latitude"] = placeObj.latitude;
    onboardScreen.env["vengo.location.longitude"] = placeObj.longitude;

    placeObj.address.forEach(component => {
        let { long_name, types } = component

        if (types.includes('street_number')) {
            onboardScreen.env["vengo.location.street_address"] = long_name + " "
        } else if (types.includes('route')) {
            onboardScreen.env["vengo.location.street_address"] += long_name
        } else if (types.includes('locality')) {
            onboardScreen.env["vengo.location.city"] = long_name
        } else if (types.includes('administrative_area_level_1')) {
            onboardScreen.env["vengo.location.state"] = long_name
        } else if (types.includes('country')) {
            onboardScreen.env["vengo.location.country"] = long_name
        } else if (types.includes('postal_code')) {
            onboardScreen.env["vengo.location.postal_code"] = long_name
        }
    });

    setEnvInStudio(onboardScreen.device.id, onboardScreen.env, function () {
        toastr.info('Changes have been saved to Studio');
        setTimeout(() => {
            reloadFromStudio(onboardScreen.device.id);
        }, 500);
        
    });
}

function generateFormattedDeviceName(venueName, venueId, venuePlacement, networkName)
{
    return `${venueName} - ${venueId} ${venuePlacement} - ${networkName}`;
}

function generateOnboardScreenObj(screen, isConnected) {
    var onboardScreen = {
        "network_id": "",
        "network_name": organizationName,
        "asset": {},
        "device": {},
        "venue": {},
        "location": {},
        "slot": {},
        "measurement": {},
        "restrictions": {},
        "operating_hours": {},
        "is_connected": isConnected,
        "env": screen.env,
        "playlist_name": "",
        "created_at" : screen.createdAt
    };

    try{
        onboardScreen.playlist_name = screen.playlistsByScreenId.nodes[0].name;
    }
    catch (err)
    {
        console.error(err);
    }

    onboardScreen.asset.name = screen.env["vengo.asset.name"] != null ? screen.env["vengo.asset.name"] : "";
    onboardScreen.asset.category = screen.env["vengo.asset.category"] != null ? screen.env["vengo.asset.category"] : "";
    onboardScreen.asset.size = screen.env["vengo.asset.size"] != null ? screen.env["vengo.asset.size"] : "";
    var r = gcd(screen.playerWidth, screen.playerHeight);
    onboardScreen.asset.aspect_ratio = parseInt(screen.playerWidth)/r + ":" + parseInt(screen.playerHeight)/r;
    onboardScreen.asset.mime_types = ["video/mp4", "image/jpeg"];

    onboardScreen.device.id = screen.id;
    onboardScreen.device.name = screen.name;
    onboardScreen.device.formatted_name = screen.env["vengo.device.name"] != null ? screen.env["vengo.device.name"] : "";
    onboardScreen.device.description = screen.deviceModel + " " + screen.devicePlatform;

    onboardScreen.venue.id = screen.env["vengo.venue.id"] != null ? screen.env["vengo.venue.id"] : "";
    onboardScreen.venue.name = screen.env["vengo.venue.name"] != null ? screen.env["vengo.venue.name"] : "";
    onboardScreen.venue.placement = screen.env["vengo.venue.placement"] != null ? screen.env["vengo.venue.placement"] : "";
    onboardScreen.venue.category_code = screen.env["vengo.venue.category_name"] != null ? screen.env["vengo.venue.category_name"] : "";

    var state = "";
    var address = "";
    if (screen.env.sc_address != undefined && screen.env.sc_address.endsWith("USA")) {
        address = screen.env.sc_address.replace(", USA", "");
        state = address.substring(address.lastIndexOf(", ") + 2);
        address = address.substring(0, address.substring(0, address.indexOf(", " + state)).lastIndexOf(","));
        //screen.env.sc_address = screen.env.sc_address.replace((", " + state), "");
    }

    onboardScreen.location.street_address_1 = screen.env.sc_address === undefined ? "" : address;
    onboardScreen.location.street_address_2 = "";
    onboardScreen.location.city = screen.env.sc_locality === undefined ? "" : screen.env.sc_locality;
    onboardScreen.location.state = state;
    onboardScreen.location.postal_code = "";
    onboardScreen.location.country = screen.env.sc_country === undefined ? "" : screen.env.sc_country;
    onboardScreen.location.latitude = screen.env.sc_latitude === undefined ? "" : screen.env.sc_latitude;
    onboardScreen.location.longitude = screen.env.sc_longitude === undefined ? "" : screen.env.sc_longitude;
    onboardScreen.location.structure_type_code = screen.env["vengo.location.structure_type_name"] != null ? screen.env["vengo.location.structure_type_name"] : "";
    onboardScreen.location.placement_type_code = screen.env["vengo.location.placement_type_name"] != null ? screen.env["vengo.location.placement_type_name"] : "";

    if (screen.env["vengo.location.street_address"] != null) {
        onboardScreen.location.street_address_1 = screen.env["vengo.location.street_address"]
        onboardScreen.location.street_address_2 = "";
        onboardScreen.location.city = screen.env["vengo.location.city"]
        onboardScreen.location.state = screen.env["vengo.location.state"]
        onboardScreen.location.postal_code = screen.env["vengo.location.postal_code"]
        onboardScreen.location.country = screen.env["vengo.location.country"]
        onboardScreen.location.latitude = screen.env["vengo.location.latitude"]
        onboardScreen.location.longitude = screen.env["vengo.location.longitude"]
    }

    onboardScreen.slot.height = screen.playerHeight;
    onboardScreen.slot.width = screen.playerWidth;
    onboardScreen.slot.top_left_x = 0;
    onboardScreen.slot.top_left_y = 0;
    onboardScreen.slot.duration = 15;
    onboardScreen.slot.share_of_voice = 0.25;
    onboardScreen.slot.mime_types = ["video/mp4", "image/jpeg"];
    onboardScreen.slot.audio_enabled = false;

    onboardScreen.measurement.provider = "publisher";
    onboardScreen.measurement.provider_id = screen.id;

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
        <div>${screen.device.name}</div>
        <button class="btn btn-danger" id="btn-remove-${screen.device.id}">Remove</button>
    </li>`;

    return li;
}

function addScreenToOnboardListItem(onboardScreen) {
    var li =
        `<li class="list-group-item mt-2 pb-3 px-0">
        <div class="row pb-2">
            <div id="badges-${onboardScreen.device.id}" class="col-12">
            </div>
        </div>
        <div class="row g-2 pb-2">
            <div class="col-12">
                <div class="input-group">
                    <form class="form-floating">
                        <input type="text" class="form-control border-end-0" id="form-devicename-${onboardScreen.device.id}" placeholder=""
                            value="${onboardScreen.device.name}" readonly title="Ad Unit ID: ${onboardScreen.device.id}">
                        <label for="form-devicename-${onboardScreen.device.id}">Studio Name</label>
                    </form>
                    <button class="btn btn-link border border-start-0 text-decoration-none" style="border-color: #ced4da!important;" data-bs-toggle="collapse" data-bs-target="#collapse-${onboardScreen.device.id}">Edit <i class="bi bi-chevron-down"></i></button>
                </div>
            </div>
        </div>
        <div id="collapse-${onboardScreen.device.id}" class="row g-2 mx-1 px-1 pb-2 border-start border-end border-bottom border-1 rounded-bottom bg-light collapse">
            <div class="col-md-6 col-12 text-muted px-2" style="font-size: small;">Ad Unit ID: ${onboardScreen.device.id}</div>
            <div class="col-md-6 col-12 text-md-end text-muted px-2" style="font-size: small;">Created At: ${onboardScreen.created_at}</div>
            <div class="col-12">
                <div class="form-floating">
                    <input type="text" class="form-control" id="form-formatteddevicename-${onboardScreen.device.id}" placeholder=""
                            value="${onboardScreen.device.formatted_name}" readonly>
                        <label for="form-formatteddevicename-${onboardScreen.device.id}">Device Name</label>
                </div>
            </div>
            <div class="col-md-3 col-12">
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
            <div class="col-md-6 col-12">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-assetname-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-assetname-${onboardScreen.device.id}">Model</label>
                </form>
            </div>
            <div class="col-md-3 col-12">
                <div class="input-group">
                    <form class="form-floating">
                        <input type="text" class="form-control" id="form-assetsize-${onboardScreen.device.id}" placeholder=""
                            value="">
                        <label for="form-assetsize-${onboardScreen.device.id}">Screen Size</label>
                    </form>
                    <span class="input-group-text">inch</span>
                </div>
            </div>
            <div class="col-md-2 col-12">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-venueid-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-venueid-${onboardScreen.device.id}">Location ID</label>
                </form>
            </div>
            <div class="col-md-5 col-12">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-venuename-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-venuename-${onboardScreen.device.id}">Location Name</label>
                </form>
            </div>
            <div class="col-md-5 col-12">
                <form class="form-floating">
                    <input type="text" class="form-control" id="form-venueplacement-${onboardScreen.device.id}" placeholder=""
                        value="">
                    <label for="form-venueplacement-${onboardScreen.device.id}">Placement within Location</label>
                </form>
            </div>
            <div class="col-md-4 col-12">
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
            <div class="col-md-4 col-12">
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
            <div class="col-md-4 col-12">
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
                <div class="input-group">
                    <form class="form-floating">
                        <textarea class="form-control border-end-0" id="form-locationaddress-${onboardScreen.device.id}" placeholder="" readonly>${onboardScreen.location.street_address_1}</textarea>
                        <label for="form-locationaddress-${onboardScreen.device.id}">Location Address</label>
                    </form>
                    <button class="btn btn-outline-primary border border-start-0 text-decoration-none" style="border-color: #ced4da!important;" data-bs-toggle="modal" data-bs-target="#modal-address" data-bs-id="${onboardScreen.device.id}"><i class="bi bi-pin-map-fill"></i> Edit</button>
                </div>
            </div>
            <div class="col-12">
                <div class="form-floating">
                    <input type="text" class="form-control" id="form-playlistname-${onboardScreen.device.id}" value="${onboardScreen.playlist_name}" readonly>
                    <label for="form-playlistname-${onboardScreen.device.id}">Associated Playlist Name</label>
                </div>
            </div>
            <ul id="formhelp-${onboardScreen.device.id}" class="form-text ms-4">
            </ul>
            <div class="col-12 d-flex">
                <div class="me-auto">
                    <button class="btn btn-primary" id="btn-copy-${onboardScreen.device.id}">Copy Default Parameters</button>
                    <button class="btn btn-primary" id="btn-reload-${onboardScreen.device.id}">Reload from Studio</button>
                </div>
                <button class="btn btn-success ms-1" id="btn-save-${onboardScreen.device.id}">Save and Add to List</button>
            </div>
        </div>
    </li>`;

    return li;
}

//https://stackoverflow.com/a/1186465
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) { var temp = a; a = b; b = temp; }
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}