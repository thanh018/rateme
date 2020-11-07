
$(document).ready(function () {
  let $form = $('#companyForm');
  let isEditCompany = $form.data('isEdit');
  let $loading = $('.create-company .loading');
  let $successMessage = $('.create-company .success-message');
  let $warningMessage = $('.create-company .warning-message');
  let $register = $('.create-company #register');
  let $input = $('.create-company .input');

  let errors = {
    name: 'default',
    address: 'default',
    image: 'default',
  };

  let fields = {
    name: '',
    address: '',
    image: ''
  };

  let dataInit = {};

  if (isEditCompany) {
    dataInit = {
      name: $('#name').val(),
      address: $('#address').val(),
      image: $('#image').attr('src'),
    }
  }

  $input.on('change paste keyup', function() {
    const value = $.trim($(this).val());
    const id = $(this).prop('id');
    const $dangersMessage = $(`#${id}-error`);
    errors[id] = value;
    
    value ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');

    const disabled = Object.keys(errors).some(key => !errors[key]);
    $register.prop('disabled', disabled);
    $warningMessage.addClass('d-none')
  });



  $form.on('submit', function (e) {
    e.preventDefault();
    let dataForm = {};
    let isValid = true;

    Object.keys(fields).forEach(key => {
      const value = $.trim($(`#${key}`).val());
      const $dangersMessage = $(`#${key}-error`);
      dataForm[key] = value;
      errors[key] = value;

      if (key === 'image') {
        const src = $('#image').attr('src')
        dataForm[key] = src;
        errors[key] = src;
      }


      dataForm[key] ? $dangersMessage.addClass('d-none') : $dangersMessage.removeClass('d-none');

      if (!dataForm[key]) {
        isValid = false;
        $register.prop('disabled', true);
      }
    });


    if (isEditCompany && _.isEqual(dataInit, dataForm)) {
      $warningMessage.removeClass('d-none');
      $register.prop('disabled', true);
      return;
    }

    if (isValid) {
      $loading.removeClass('d-none');
      $register.prop('disabled', true);
      const idCompany = $form.data('idCompany');

      $.ajax({
        url: isEditCompany ? `/company/${idCompany}` : '/company/create',
        type: 'POST',
        data: dataForm,
        success: function (data) {
          $successMessage.removeClass('d-none');
          Object.keys(fields).forEach(key => {
            $(`#${key}`).val('');
            if (key === 'image') {
              $('#image').attr('src', '');
            }
          });
          if (data) {
          $register.prop('disabled', false);
            setTimeout(() => {
              window.location.href = 'http://localhost:5001/companies';
            }, 1500);
          }
        },
      });
    } else return false;
  });
});
