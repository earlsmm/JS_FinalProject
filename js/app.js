
var map
var markers = []

// start out with filter features set to false, so no filtering happens by default
var filters = {Sights: false, ArtAndArch: false, Food: false}

$(function () {
    $('input[name=filter]').change(function (e) {
     map_filter(this.id);
      filter_markers()
  });
})

var get_set_options = function() {
  ret_array = []
  for (option in filters) {
    if (filters[option]) {
      ret_array.push(option)
    }
  }
  return ret_array;
}

var filter_markers = function() {
  set_filters = get_set_options()

  // for each marker, check to see if all required options are set
  for (i = 0; i < markers.length; i++) {
    marker = markers[i];

    // start the filter check assuming the marker will be displayed
    // if any of the required features are missing, set 'keep' to false
    // to discard this marker
    keep=true
    mapset = map
    for (opt=0; opt<set_filters.length; opt++) {
      if (!marker.properties[set_filters[opt]]) {
        keep = false;
      }
    }
    marker.setVisible(keep)
  }
}

var map_filter = function(id_val) {
   if (filters[id_val])
      filters[id_val] = false
   else
      filters[id_val] = true
}

// after the geojson is loaded, iterate through the map data to create markers
// and add the pop up (info) windows
function loadMarkers() {
  console.log('creating markers')
  var infoWindow = new google.maps.InfoWindow()
  geojson_url = 'https://raw.githubusercontent.com/earlsmm/JS_FinalProject/master/detroitVisitorIdeas.geojson'

  $.getJSON(geojson_url, function(result) {
      // Post select to url.
      data = result['features']
      $.each(data, function(key, val) {
        var point = new google.maps.LatLng(
                parseFloat(val['geometry']['coordinates'][1]),
                parseFloat(val['geometry']['coordinates'][0]));
        var titleText = val['properties']['Name']
        var descriptionText = val['properties']['Notes']
        var marker = new google.maps.Marker({
          position: point,
          title: titleText,
          map: map,
          properties: val['properties']
         });

        var markerInfo = "<div><h3>" + titleText + "</h3>Notes: " + descriptionText + "</div>"

        marker.addListener('click', function() {
              infoWindow.close()
              infoWindow.setContent(markerInfo)
              infoWindow.open(map, marker)
            });
        markers.push(marker)
      });
  });
}

function initMap() {
    map_options = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      center: {lat: 42.341056, lng: -83.0535502} ,
    }

    map_document = document.getElementById('map')
    map = new google.maps.Map(map_document,map_options);
    loadMarkers()

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        var lat;
        var lng;

        map.setCenter(place.geometry.location);
        map.setZoom(14);

        marker.setIcon({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        });

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        lat = place.geometry.location.lat();
        lng = place.geometry.location.lng();

        $.ajax({
            url: 'stores.php',
            type: 'get',
            dataType: 'json',
            data: {
                lat: lat,
                lng: lng
            }
        }).done(function (response) {
            var i;
            var store;
            var stores;
            var infoMarkup = [];
            var storeMarker;
            var storeLocation;

            if (response.count !== 0) {
                stores = response.results;

                for (i = 0; i < response.count; i = i + 1) {
                    store = stores[i];

                    infoMarkup.push('<div class="map-marker-info"><strong>' + store.address + '</strong> <p>' + store.distance.miles + ' miles from you &bull; ' + store.telephone + '</p></div>');

                    storeLocation = new google.maps.LatLng(
                        store.location.lat,
                        store.location.lng
                    );

                    storeMarker = new google.maps.Marker({
                        map: map,
                        position: storeLocation
                    });

                    google.maps.event.addListener(storeMarker, 'click', (function (storeMarker, i) {
                        return function () {
                            infoWindow.setContent('<div>' + infoMarkup[i] + '</div>');
                            infoWindow.open(map, storeMarker);
                        };
                    })(storeMarker, i));
                }
            }

        });

    });
}

google.maps.event.addDomListener(window, 'load', initMap);
