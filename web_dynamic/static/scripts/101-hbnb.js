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

  // Search by filters
  function search (filters = {}) {
    $.ajax({
      type: 'POST',
      url: `http://${host}:5001/api/v1/places_search/`,
      data: JSON.stringify(filters),
      contentType: 'application/json',
      success: function (data) {
        createPlaces(data);
      }
    });
  }

  // Creating places
  function createPlaces (data) {
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
              <div class="reviews" id="reviews-${place.id}">
                <h2><span class='toggle-reviews' data-id="${place.id}" data-state='hidden'>Show</span> Reviews</h2>
                <ul></ul>
              </div>
            </article>
          `;
      })
    );
  }

  // Show the reviews
  function displayReviews (placeId, reviewsLocation) {
    $.get(
      `http://${host}:5001/api/v1/places/${placeId}/reviews`,
      function (reviews) {
        const sortedReviews = reviews.sort(function (a, b) {
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
        const reviewsPromise = sortedReviews.map(function (review) {
          return getUserFullName(review.user_id).then(function (fullName) {
            return `
            <li>
              <h3>From ${fullName} the ${displayDate(new Date(review.updated_at))}</h3>
              <p>${review.text}</p>
            </li>
            `;
          });
        });
        Promise.all(reviewsPromise).then(function (reviewList) {
          reviewsLocation.html(reviewList.join(''));
        });
      }
    );
  }

  // Get user full name
  function getUserFullName (userId) {
    return new Promise(function (resolve, reject) {
      $.get(`http://${host}:5001/api/v1/users/${userId}`, function (user) {
        resolve(`${user.first_name} ${user.last_name}`);
      });
    });
  }

  // Display the reviews
  $('body').on('click', '.reviews h2 span', function () {
    const placeId = $(this).attr('data-id');
    const reviewsElement = $(`#reviews-${placeId} ul`);
    reviewsElement.toggle('show', function () {
      if ($(this).is(':visible')) {
        displayReviews(placeId, reviewsElement);
        $(this)
          .closest('.reviews')
          .find('.toggle-reviews')
          .text('Hide')
          .attr('data-state', 'visible');
      } else {
        $(this)
          .closest('.reviews')
          .find('.toggle-reviews')
          .text('Show')
          .attr('data-state', 'hidden');
      }
    });
  });

  // Calling Search on Click envent
  $('#search').click(function () {
    const filters = {
      states: Object.keys(states),
      cities: Object.keys(cities),
      amenities: Object.keys(amenities)
    };
    search(filters);
  });

  // Calling for the first time to display the full places
  search();
});

// HELPER FUNCTIONS
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

function displayDate (date) {
  return (
    date.getDate() +
    'th ' +
    date.toLocaleDateString('default', { month: 'long', year: 'numeric' })
  );
}
