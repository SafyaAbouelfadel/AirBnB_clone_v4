$(document).ready(function () {
  const host = '0.0.0.0';

  // Get the status
  $.get(`http://${host}:5001/api/v1/status`, function (data) {
    if (data.status === 'OK') {
      $('DIV#api_status').addClass('available');
    } else {
      $('DIV#api_status').removeClass('available');
    }
  });

  // Get filters
  function getFilters (
    selector,
    checkedFilters,
    displaySelector,
    combine = false
  ) {
    $(selector).click(function () {
      if ($(this).is(':checked')) {
        checkedFilters[$(this).attr('data-id')] = $(this).attr('data-name');
      } else {
        delete checkedFilters[$(this).attr('data-id')];
      }

      const displaylist = combine
        ? { ...states, ...cities, ...checkedFilters }
        : checkedFilters;

      $(displaySelector).html(displayText(displaylist));
    });
  }

  // Get filters for States
  const states = {};
  getFilters(
    '.locations ul h2 input[type="checkbox"]',
    states,
    '.locations h4',
    true
  );

  // Get filters for Cities
  const cities = {};
  getFilters(
    '.locations ul li ul  li input[type="checkbox"]',
    cities,
    '.locations h4',
    true
  );

  // Get filters for amenities
  const amenities = {};
  getFilters('.amenities input[type="checkbox"]', amenities, '.amenities h4');

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
    const filters = {
      states: Object.keys(states),
      cities: Object.keys(cities),
      amenities: Object.keys(amenities)
    };
    search(filters);
  });

  search();
});

function pluralDisplay (number, name) {
  return number === 1 ? name : name + 's';
}

function displayText (list) {
  const listName = Object.values(list).join(', ');
  return listName.length
    ? listName.length >= 29
      ? listName.slice(0, 29).concat('...')
      : listName
    : '&nbsp;';
}
