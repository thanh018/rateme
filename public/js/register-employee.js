$(document).ready(function () {
  const $employeePage = $('.register-employee-page');
  const $formEmployee = $('.form-employee');
  const $select = $formEmployee.find('.select');
  const $registerBtn = $formEmployee.find('.registerBtn');
  const $successMessage = $employeePage.find('.success-message');
  const $dangersMessage = $employeePage.find('#role-error');
  const $loading = $employeePage.find('.loading');

  $select.on('change paste keyup', function() {
    const value = $(this).val();
    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');
    $registerBtn.prop('disabled', value.length < 1);
  });


  $formEmployee.on('submit', e => {
    e.preventDefault();
    const value = $select.val();
    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');
    $registerBtn.prop('disabled', value.length < 1);

    const url = window.location.href;
    const id = url.substring(url.lastIndexOf('/') + 1);
    
    if (value) {
      $loading.removeClass('d-none');
      $.ajax({
        url: '/company/register-employee/' + id,
        type: 'POST',
        data: {
          role: value,
        },
        success: data => {
        console.log("data", data)
          if (data) {
            $successMessage.removeClass('d-none');
            setTimeout(() => {
              $loading.addClass('d-none');
              window.location.href = `http://localhost:5001/company-profile/${id}`;
            }, 1000);
          }
        },
      });
    } else {
      return false;
    }
  })
});