$(document).ready(function () {
  
  const $form = $('#userProfileForm');
  const $loading = $('.user-profile-page .loading');
  const $successMessage = $('.user-profile-page .success-message');
  const $warningMessage = $('.user-profile-page .warning-message');
  const $updateProfileBtn = $('.user-profile-page #updateProfile');
  const $input = $('.user-profile-page .upload-input');
  const $dangersMessage = $('#avatar-error');

  const originalImage = $input.attr('src');
  $input.on('change paste keyup', function() {
    const value = $(this).val();
    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');
    $updateProfileBtn.prop('disabled', !value);
    $warningMessage.addClass('d-none');
  });

  $form.on('submit', function (e) {
    e.preventDefault();
    const value = $input.attr('src')

    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');
    $updateProfileBtn.prop('disabled', !value);

    if (_.isEqual(originalImage, value)) {
      $updateProfileBtn.prop('disabled', true);
      $warningMessage.removeClass('d-none');
      return;
    }

    if (value) {
      $loading.removeClass('d-none');
      $.ajax({
        url: '/user/profile',
        type: 'POST',
        data: { avatar: value },
        success: function (data) {
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
