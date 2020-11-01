$(document).ready(function () {
  const $reviewPage = $('.review-page');
  const $formReview = $('#form-review');
  const $input = $formReview.find('.input');
  const $showTitle = $reviewPage.find('#show-title');
  const $itemStar = $reviewPage.find('.item_star');
  const $rate = $('#rate');
  const $successMessage = $reviewPage.find('.success-message');
  const $loading = $reviewPage.find('.loading');
  const STAR_ON = '/images/star_on.png';
  const STAR_OFF = '/images/star_off.png';

  let clickedValue = 0;

  let fields = {
    sender: '',
    clickedValue: '',
    review: '',
  };

  let errors = {
    sender: 'default',
    clickedValue: 'default',
    review: 'default',
  };

  let dataForm = {};

  $itemStar.on('click', (e) => {
    const current = e.currentTarget;
    const title = current.title;
    clickedValue = parseInt(current.alt);
    $showTitle.html(title);
    $('#clickedValue-error').addClass('d-none');

    for (let i = 1; i <= clickedValue; i++) {
      $(`#${i}_star`).attr('src', STAR_ON);
    }

    for (let i = 5; i > clickedValue; i--) {
      $(`#${i}_star`).attr('src', STAR_OFF);
    }

    errors['clickedValue'] = clickedValue;
    const disabled = Object.keys(errors).some(key => !errors[key]);
    $rate.prop('disabled', disabled);
  });

  $input.on('change paste keyup', function() {
    const key = $(this).prop('id');
    errors[key] = $.trim($(`#${key}`).val());
    const $dangersMessage = $(`#${key}-error`);

    errors[key] ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');

    const disabled = Object.keys(errors).some(key => !errors[key]);
    $rate.prop('disabled', disabled);
  });

  

  $formReview.on('submit', e => {
    e.preventDefault();
    let isValid = true;
    Object.keys(fields).forEach(key => {
      dataForm[key] = $.trim($(`#${key}`).val());
      if (key === 'clickedValue') {
        dataForm[key] = clickedValue;
      }
      errors[key] = dataForm[key];
      const $dangersMessage = $(`#${key}-error`);
      dataForm[key] ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');
      if (!dataForm[key]) {
        isValid = false;
        $rate.prop('disabled', true);
      }
    });

    const id = $('#id').val();

    if (isValid && id) {
      $loading.removeClass('d-none');
      const { sender, review } = dataForm;
      $.ajax({
        url: '/review/' + id,
        type: 'POST',
        data: {
          sender,
          clickedValue,
          review,
        },
        success: data => {
          if (data) {
            $successMessage.removeClass('d-none');
            Object.keys(fields).forEach(key => {
              $(`#${key}`).val('');
              if (key === 'clickedValue') {
                clickedValue = 0;
                $itemStar.attr('src', STAR_OFF);
              }
            });
            setTimeout(() => {
              window.location.href = `http://localhost:3000/company-profile/${id}`;
            }, 1000);
          }
        },
      });
    } else {
      return false;
    }
  })
});