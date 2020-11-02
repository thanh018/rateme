
; (function ($, window, undefined) {
  'use strict';

  var pluginName = 'login';

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function () {
      const $el = this.element;
      const $formLogin = $el.find('.formLogin');
      const $input = $el.find('.input');
      const $loading = $el.find('.loading');
      const $successMessage = $el.find('.success-message');
      const $alertDanger = $el.find('.alert-danger');
      const $errorMessage = $el.find('.error-message');
      const $loginBtn = $el.find('#login');

      const fields = {
        email: '',
        password: '',
      };

      const errors = {
        email: 'default',
        password: 'default',
      };

      let dataForm = {};

      const renderError = text => `
        <p class="alert alert-danger text-center radius-0 no-border py-2 text">
          <a href="#" class="close" data-dismiss="alert" aria-label="close">
            &times;
          </a>
          <span>${text}</span>
        </p>
      `;

      $input.on('change paste keyup', function () {
        const key = $(this).prop('id');
        errors[key] = $.trim($(`#${key}`).val());
        dataForm[key] = $.trim($(`#${key}`).val());
        const $dangersMessage = $(`#${key}-error`);
        errors[key] ?
          $dangersMessage.addClass('d-none')
          :
          $dangersMessage.removeClass('d-none');
        const disabled = Object.keys(errors).some(key => !errors[key]);
        $loginBtn.prop('disabled', disabled);
        $errorMessage.find('.close').click();
      });

      $formLogin.on('submit', e => {
        e.preventDefault();
        let isValid = true;
        Object.keys(fields).forEach(key => {
          errors[key] = $.trim($(`#${key}`).val());
          dataForm[key] = $.trim($(`#${key}`).val());
          const $dangersMessage = $(`#${key}-error`);
          errors[key] ?
            $dangersMessage.addClass('d-none')
            :
            $dangersMessage.removeClass('d-none');
          if (!dataForm[key]) {
            isValid = false;
            $loginBtn.prop('disabled', true);
          }
        });

        if (isValid) {
          const { email, password } = dataForm;
          $.ajax({
            url: '/login',
            type: 'POST',
            data: { email, password },
            success: function (data, status, xhr) {
              console.log("data", data)
              $loading.removeClass('d-none');
              if (data && xhr.status === 200) {
                $alertDanger.addClass('d-none');
                $successMessage.removeClass('d-none');
                setTimeout(() => {
                  window.location.href = `http://localhost:3000/home`;
                }, 500)
              }
            },
            error: function (xhr, status, error) {
              const errorText = xhr.responseJSON.error;
              console.log(xhr.status, xhr.statusText);
              if (xhr.responseJSON.error) {
                $loginBtn.prop('disabled', true);
                $errorMessage.append(renderError(errorText));
                ;
              }
            }
          })
        }
      });
    },

    destroy: function () {
      $.removeData(this.element[0], pluginName);
    }
  };

  $.fn[pluginName] = function (options, params) {
    return this.each(function () {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };

  $.fn[pluginName].defaults = {};

  $(function () {
    $('[data-' + pluginName + ']')[pluginName]({
    });
  });

}(jQuery, window));
