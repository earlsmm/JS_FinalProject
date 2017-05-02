var map
var markers = []

var greenMarker = 'images/greenMapMarker.png';
var greenFoodIcon = 'images/greenFoodIcon.png';
var pinkStarMapMarker = 'images/starPinkMapMarker.png';
var blueMarker = 'images/blueMapMarker.png';
var orangeMarker = 'images/orangeMapMarker.png';
var redMarker = 'images/redMapMarker.png';

//A utility function that translates a given type to an icon
function getIcon(type) {
	switch(type) {
		case "food": return greenMarker;
		case "attraction": return redMarker;
    case "museum": return blueMarker;
    case "bar": return orangeMarker;
		//default: return "icons/footprint.png";
	}
}

// Filter map markers
// var filters = {Sights: false, ArtAndArch: false, Food: false}
//
// $(function () {
//     $('input[name=filter]').change(function (e) {
//      map_filter(this.id);
//       filter_markers()
//   });
// })
//
// var get_set_options = function() {
//   ret_array = []
//   for (option in filters) {
//     if (filters[option]) {
//       ret_array.push(option)
//     }
//   }
//   return ret_array;
// }
//
// var filter_markers = function() {
//   set_filters = get_set_options()
//
//   // for each marker, check to see if all required options are set
//   for (i = 0; i < markers.length; i++) {
//     marker = markers[i];
//
//     // start the filter check assuming the marker will be displayed
//     // if any of the required features are missing, set 'keep' to false
//     // to discard this marker
//     keep=true
//     mapset = map
//     for (opt=0; opt<set_filters.length; opt++) {
//       if (!marker.properties[set_filters[opt]]) {
//         keep = false;
//       }
//     }
//     marker.setVisible(keep)
//   }
// }
//
// var map_filter = function(id_val) {
//    if (filters[id_val])
//       filters[id_val] = false
//    else
//       filters[id_val] = true
// }

// after the geojson is loaded, iterate through the map data to create markers
// and add the pop up (info) windows

function loadMarkers() {
  //console.log('creating markers')
  var infoWindow = new google.maps.InfoWindow({
      maxWidth: 250
  })

  geojson_url = 'https://raw.githubusercontent.com/earlsmm/JS_FinalProject/master/detroitVisitorIdeas.geojson'

  $.getJSON(geojson_url, function(result) {
      // Post select to url.
      data = result['features']
      $.each(data, function(key, val) {
        var point = new google.maps.LatLng(
            parseFloat(val['geometry']['coordinates'][1]),
            parseFloat(val['geometry']['coordinates'][0]));
        var titleText = val['properties']['Name']
        var address1 = val['properties']['Address1']
        var address2 = val['properties']['Address2']
        var link = val['properties']['Link']
        var descriptionText = val['properties']['Notes']
        var marker = new google.maps.Marker({
          position: point,
          title: titleText,
          map: map,
          properties: val['properties'],
          icon: getIcon(val['properties']['type'])
         });

        var markerInfo = "<div><a href='" + link +  "' target='_blank'><h3>" + titleText + "</h3></a>" + address1 + "<br>" + address2 + "<br><br>" + descriptionText + "</div>"

        marker.addListener('click', function() {
              infoWindow.close()
              infoWindow.setContent(markerInfo)
              infoWindow.open(map, marker)
            });
        markers.push(marker)
      });
  });
}//end loadMarkers function

var current_marker;

function showVisibleMarkers() {
  var bounds = map.getBounds(),
    count = 0;

  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i],
      infoPanel = $('.info-' + (i + 1)); // array indexes start at zero, but not our class names :)

    if (bounds.contains(marker.getPosition()) === true) {
      infoPanel.show();
      count++;
    } else {
      infoPanel.hide();
    }
  }

  $('#infos h3 span').html(count).val;
}//end showVisibleMarkers

//initialize the map
function initMap() {

    map_options = {
      zoom: 14, //set default zoom level
      mapTypeId: google.maps.MapTypeId.roadmap,  //set default map type
      center: {lat: 42.341056, lng: -83.0535502}, //center the map
    }

    map_document = document.getElementById('map')
    map = new google.maps.Map(map_document, map_options);

    autocomplete = new google.maps.places.Autocomplete(document.getElementById('map-search-autocomplete'));

    autocomplete.bindTo('bounds', map);

    marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: pinkStarMapMarker
    });

    infoWindow = new google.maps.InfoWindow();

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        var lat;
        var lng;

         map.setCenter(place.geometry.location);
         map.setZoom(15);

         marker.setIcon({
            icon: pinkStarMapMarker,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        });

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

    }); //end of autocomplete

    loadMarkers()

    google.maps.event.addListener(map, 'idle', function() {
      showVisibleMarkers();
    });//end showVisibleMarkers
}

google.maps.event.addDomListener(window, 'load', initMap);

//opens Info Windows with click on side info panel
function myClick(id){
  google.maps.event.trigger(markers[id], 'click');
}
