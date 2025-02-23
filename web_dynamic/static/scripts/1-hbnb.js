$(document).ready(function () {
  const checkedAmenity = {};
  $('input:checkbox').click(function () {
    if ($(this).is(':checked')) {
      checkedAmenity[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete checkedAmenity[$(this).attr('data-id')];
    }
    const listAmenity = Object.values(checkedAmenity).join(', ');
    $('.amenities h4').html(listAmenity.length ? listAmenity.length >= 29 ? listAmenity.slice(0, 29).concat('...') : listAmenity : '&nbsp;');
  });
});
