$(document).ready(function () {
  
  let $form = $('#companyForm');
  let $errorsMessage = $('#errorsMessage');

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
      if (!values[key]) {
        isValid = false;
        errors.push(key);
      }
    });

    if (errors) {
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


    if (isValid) {
      $.ajax({
        url: '/company/create',
        type: 'POST',
        data: values,
        success: function () {
          Object.keys(fields).forEach(key => {
            $(`#${key}`).val('');
          });
          $errorsMessage.html('');
        },
      });
    } else return false;
  });
});
