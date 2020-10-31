$(document).ready(function () {
  
  let $form = $('#companyForm');
  let $errorsMessage = $('#errorsMessage');
  let $loading = $('.create-company .loading');
  let $alertSuccess = $('.create-company .alert-success');

  $form.on('submit', function (e) {
    e.preventDefault();
    let fields = {
      name: '',
      address: '',
      city: '',
      country: '',
      sector: '',
      website: '',
      image: ''
    };
    let values = {};
    let errors = [];
    let isValid = true;

    Object.keys(fields).forEach(key => {
      values[key] = $.trim($(`#${key}`).val());
      if (key === 'image') {
        values['image'] = $('#image').attr('src');
      }
      if (!values[key]) {
        isValid = false;
        errors.push(key);
      }
    });

    if (errors.length > 0) {
      const errorsContent = `
        <div class="alert alert-danger">
          <a href="#" class="close" data-dismiss="alert" aria-label="close">
            &times;
          </a>
          ${errors.map(field => 
            `<div class="mb-2 mt-2"><span class="text-capitalize">${field}</span> field is empty</div>`).join('')
          }
        </div>
      `;
      $errorsMessage.html(errorsContent);
    } else $errorsMessage.html('');

    if (!isValid) {
    }

    if (isValid) {
      $loading.removeClass('d-none');
      $.ajax({
        url: '/company/create',
        type: 'POST',
        data: values,
        success: function (data) {
          $alertSuccess.removeClass('d-none');
          Object.keys(fields).forEach(key => {
            $(`#${key}`).val('');
            if (key === 'image') {
              $('#image').attr('src', '');
            }
          });
          
          $errorsMessage.html('');
          if (data) {
            setTimeout(() => {
              window.location.href = 'http://localhost:3000/companies';
            }, 1500);
          }
        },
      });
    } else return false;
  });
});
