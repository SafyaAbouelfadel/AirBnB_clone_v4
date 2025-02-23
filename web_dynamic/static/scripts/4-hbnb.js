$(document).ready(function () {
  const host = '0.0.0.0';
  const checkedAmenity = {};
  $('input:checkbox').click(function () {
    if ($(this).is(':checked')) {
      checkedAmenity[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete checkedAmenity[$(this).attr('data-id')];
    }
    const listAmenity = Object.values(checkedAmenity).join(', ');
    $('.amenities h4').html(
      listAmenity.length
        ? listAmenity.length >= 29
          ? listAmenity.slice(0, 29).concat('...')
          : listAmenity
        : '&nbsp;'
    );
  });
  $.get(`http://${host}:5001/api/v1/status`, function (data) {
    if (data.status === 'OK') {
      $('DIV#api_status').addClass('available');
    } else {
      $('DIV#api_status').removeClass('available');
    }
  });

  function search (filters = {}) {
    $.ajax({
      type: 'POST',
      url: `http://${host}:5001/api/v1/places_search/`,
      data: JSON.stringify(filters),
      contentType: 'application/json',
      success: function (data) {
        $('SECTION.places').empty();
        $('SECTION.places').append(
          data.map(function (place) {
            return `
            <article>
              <div class="title_box">
                <h2>${place.name}</h2>
                <div class="price_by_night">$${place.price_by_night}</div>
              </div>
              <div class="information">
                <div class="max_guest">${place.max_guest} ${pluralDisplay(place.max_guest, 'Guest')}</div>
                <div class="number_rooms">${place.number_rooms} ${pluralDisplay(place.number_rooms, 'Badroom')}</div>
                <div class="number_bathrooms">${place.number_bathrooms} ${pluralDisplay(place.number_bathrooms, 'Bathroom')}</div>
              </div>
              <div class="description">${place.description || 'No Description Provided'}</div>
            </article>
          `;
          })
        );
      }
    });
  }

  $('#search').click(function () {
    const filters = { amenities: Object.keys(checkedAmenity) };
    search(filters);
  });

  search();
});

function pluralDisplay (number, name) {
  return number === 1 ? name : name + 's';
}
