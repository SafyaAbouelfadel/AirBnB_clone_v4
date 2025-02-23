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
});
