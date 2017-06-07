/*This file will call the render.php endpoint to retrieve JSON
* data from restcountries.edu and print some information.
* it also provides a summary of the results.
*/


// given an array of strings, this returns each string and the number
// of times the string appears in the array
function getUniqueWithNum(regions){
    var uniqueRegions = [];
    var regionsWithNum = [];
    var idx;
    $.each(regions, function(i, el){
        idx = $.inArray(el, uniqueRegions);
        //if region is not been added to new array, count is 1
        //else increase the count(num) val
        if ( idx == -1) {
            uniqueRegions.push(el);
            regionsWithNum.push({"region":el,"num":1});
        }else {
            regionsWithNum[idx].num = regionsWithNum[idx].num+1;
        }
    });
    return regionsWithNum;
}

// given array of region and number of apperances, return an html table
function constructRegionStr(regionArr,reg) {
    var regionOut = '<table><thead><tr><td>' + reg + '</td><td>Count</td></tr></thead><tbody>';
    for (var k = 0; k < regionArr.length; k++){
        regionOut += '<tr>';
        regionOut += '<td>' + regionArr[k].region + '</td>';
        regionOut += '<td>' + regionArr[k].num + '</td>';
        regionOut += '</tr>';
    }
    regionOut += '</body></table>';
    return regionOut;
}

//main function to query php http server and get results form restcountries.eu
function fireAndPrintCountries(){
    var new_res = [];
    var countryCount = 0;
    var countryCountStr = '';
    var outputStr = '';
    var langs = [];
    var regions = []; 
    var regionCounter = [];
    var subregions = [];
    var subregionCounter = [];
    var regionOut = '';
    var subregionOut = '';

    if ( $('#country-in').val() === '' && $('#country-code').val() === '' ) {
        var encoded = '&#x1f620; plz input something';
        var decoded = $("<div/>").html(encoded).text();
        alert(decoded);
        return;
    }

    $.ajax({
    url : "render.php",
    type : "GET",
    data : {"country":$('#country-in').val(), "country-code":$('#country-code').val()},
    dataType:'json',
    success : function(data) {
        if ( data === false ){
            var encoded = '&#x2639 invald entry';
            var decoded = $("<div/>").html(encoded).text();
            alert(decoded);
            return;
        }
        new_res = JSON.parse(data);
        //if a country code is used, returns only an object, make it an array
        if (!Array.isArray(new_res)){
            new_res = [(JSON.parse(data))];    
        }

        //limit results to 50.. (might be better to do this on php end)
        if (new_res.length > 50){
            new_res = new_res.slice(0,50);
        }

        countryCount = new_res.length;
        countryCountStr = 'Found ' + countryCount + ' countries. [results limited to 50]';

        //sort by country
        new_res.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        //construct table to output country name, alpha codes, image of flag,
        // region, subregion and languages spoken
        outputStr = '<table><thead>' +
        '<tr>' +
        '<td>Flag</td>' +
        '<td>Name</td>' +
        '<td>Alpha Code 2</td>' +
        '<td>Alpha Code 3</td>' +
        '<td>Region</td>' +
        '<td>Subregion</td>' +
        '<td>Languages</td>' +
        '<tr>' +
        '</thead><tbody>';

        for ( var i = 0; i < new_res.length; i++ ) {
            //parse out languages
            langs = [];
            for (var j = 0; j < new_res[i].languages.length; j++){
                langs.push(new_res[i].languages[j].name);
            }

            //append to output str
            outputStr += '<tr>';
            outputStr += '<td>' + '<img src="' + new_res[i].flag + '"></img>' + '</td>';
            outputStr += '<td>' + new_res[i].name + '</td>';
            outputStr += '<td>' + new_res[i].alpha2Code + '</td>';
            outputStr += '<td>' + new_res[i].alpha3Code + '</td>';
            outputStr += '<td>' + new_res[i].region + '</td>';
            outputStr += '<td>' + new_res[i].subregion + '</td>';
            outputStr += '<td>' + langs.join(", ") + '</td>';
            outputStr += '</tr>';
        }
        outputStr += '</body></table>';

        //get just subregions
        regions = new_res.map(function(a) {return a.region;});

        //get regions with num of occurances
        regionCounter = getUniqueWithNum(regions);

        //get just subregions
        subregions = new_res.map(function(a) {return a.subregion;});

        //get subregions with num of occurances
        subregionCounter = getUniqueWithNum(subregions);

        //get html strings for output for regions and subregions
        regionOut = constructRegionStr(regionCounter,'Region');
        subregionOut = constructRegionStr(subregionCounter,'Subregion');

        //append the results to the dom
        $('#result').html(outputStr);
        $('#summary-count').html(countryCountStr);
        $('#summary-region').html(regionOut);
        $('#summary-subregion').html(subregionOut);
    },
    error : function(request,error) {
        alert("Request: "+JSON.stringify(request));
    }
   });

}

//trigger click on enter up
$("input").keyup(function(event){
    if(event.keyCode == 13){
        $("#submit").click();
    }
});

$( "#submit" ).click(function() {
    fireAndPrintCountries();
});

