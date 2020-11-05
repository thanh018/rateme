$(document).ready(function () {
  
  const $form = $('#userProfileForm');
  const $loading = $('.user-profile-page .loading');
  const $successMessage = $('.user-profile-page .success-message');
  const $updateProfileBtn = $('.user-profile-page #updateProfile');
  const $input = $('.user-profile-page .upload-input');
  const $dangersMessage = $('#avatar-error');

  $input.on('change paste keyup', function() {
    const value = $(this).val();
    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');
    $updateProfileBtn.prop('disabled', !value);
  });



  $form.on('submit', function (e) {
    e.preventDefault();
    const value = $input.attr('src')

    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');

    $updateProfileBtn.prop('disabled', !value);

    if (value) {
      $loading.removeClass('d-none');
      $.ajax({
        url: '/user/profile',
        type: 'POST',
        data: { avatar: value },
        success: function (data) {
          console.log("data", data)
          $input.attr('src', '');

          $successMessage.removeClass('d-none');
          if (data) {
            setTimeout(() => {
              window.location.href = 'http://localhost:5001/home';
            }, 1500);
          }
        },
      });
    } else return false;
  });
});
