var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {

    center: { lat: 37.871, lng: -122.272747 },
    zoom: 11,
    
    disableDefaultUI: true,

    zoomControl: true,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  });

  map.setMapTypeId('terrain');

  const geocoder = new google.maps.Geocoder;

  map.data.addListener("click", function(event) {

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const latlng = `${lat},${lng}`

    geocodeLatLng(geocoder, latlng);
  });

  map.data.loadGeoJson('https://gist.githubusercontent.com/JessieSidWho/390d018648b7c4a7cbe88deb813db0a7/raw/45879ff7bf33b9364e0cb8bfe3cddea7e53091e5/sfbay.geojson');

  let selected; // stores last selected area
 
  map.data.setStyle(function(feature) {
    var color = 'white';

    return /** @type {!google.maps.Data.StyleOptions} */({
      fillColor: color,
      strokeColor: "darkblue",
      strokeWeight: 1,
    });
  });

  map.data.addListener('click', function(event) {
    map.data.revertStyle();
    event.feature.setProperty('isColorful', true);
    map.data.overrideStyle(event.feature, {
      strokeWeight: 4,
      fillColor: "red"
    });
    selected = event.feature;
  });

  map.data.addListener('mouseover', function(event) {
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, {
      strokeWeight: 4,
      fillColor: "blue"
    });
    if (selected) {
      map.data.overrideStyle(selected, {
        fillColor: "red"
      });
    }
  });

  map.data.addListener('mouseout', function(event) {
    map.data.revertStyle();
    if (selected) {
      map.data.overrideStyle(selected, {
        fillColor: "red"
      });
    }
  });
}

function geocodeLatLng(geocoder, input) {
  const latlngStr = input.split(',', 2);
  const latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};

  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        const address = results[0].formatted_address.split(",");
        const stateNzip = address[2].toLowerCase().trim().split(" ");
        const city = address[1].toLowerCase().trim();
        const state = stateNzip[0];
        const zip = stateNzip[1];

        // GET
        $.ajax({
          url: "/api/form/" + zip,
          method: "GET",
        }).then(function(response){
          console.log(response[0]);

          $("#infoZip").html(response[0].zip);
          $("#infoCity").html(response[0].city);
          $("#infoRprop").html(response[0].rproperties);
          $("#infoCprop").html(response[0].cproperties);
          $("#infoYear").html(response[0].avgyearbuilt);
          $("#infoSqft").html(response[0].avgsqft);
          $("#infoSales19").html(response[0].sales2019);
          $("#infoFp19").html(response[0].flippercent2019 + "%");
          $("#infoFh19").html(response[0].flippedhomes2019);
          $("#infoSales18").html(response[0].sales2018);
          $("#infoFp18").html(response[0].flippercent2018 + "%");
          $("#infoFh18").html(response[0].flippedhomes2018);
          
          sessionStorage.setItem("zip", zip);

          $("#flipStats i").removeClass("delay-2s");
          $("#flipStats i").toggleClass("animated flip");
          setTimeout(function() {
            $("#flipStats i").toggleClass("animated flip");
          }, 10);
          
        });

        $.ajax({
          url: "/main",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            city,
            state,
            zip
          })
        }).then(result => {

          const url = `https://www.zillow.com/widgets/search/LargeSearchBoxWidget.htm?did=zillow-large-search-box-iframe-widget&type=iframe&rgname=${result.city}+${result.state}&shvi=yes`
          $("#widget").attr("src", url);

          const city = result.city.replace(/\s+/g, "_");

          console.log(city);

          $(".crime-stats").hide();
          $(`#${city}`).show();

          sessionStorage.setItem("city", city);
        }); 

      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

if (sessionStorage.getItem("city")) {
  $(".crime-stats").hide();
  $(`#${sessionStorage.getItem("city")}`).show();
}
$(document).ready(function() {
  let zip="94703";

  if (sessionStorage.getItem("zip")) {
    zip = sessionStorage.getItem("zip")
  }

  console.log(zip);

  $.ajax({
    url: "/api/form/" + zip,
    method: "GET",
  }).then(function(response){
    console.log(response[0]);

    $("#infoZip").html(response[0].zip);
    $("#infoCity").html(response[0].city);
    $("#infoRprop").html(response[0].rproperties);
    $("#infoCprop").html(response[0].cproperties);
    $("#infoYear").html(response[0].avgyearbuilt);
    $("#infoSqft").html(response[0].avgsqft);
    $("#infoSales19").html(response[0].sales2019);
    $("#infoFp19").html(response[0].flippercent2019 + "%");
    $("#infoFh19").html(response[0].flippedhomes2019);
    $("#infoSales18").html(response[0].sales2018);
    $("#infoFp18").html(response[0].flippercent2018 + "%");
    $("#infoFh18").html(response[0].flippedhomes2018);
    
  });
})
