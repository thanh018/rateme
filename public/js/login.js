
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
      const isSignup = $el.data('is-signup');
      const $formUser = $el.find('.formUser');
      const $input = $el.find('.input');
      const $loading = $el.find('.loading');
      const $successMessage = $el.find('.success-message');
      const $alertDanger = $el.find('.alert-danger');
      const $errorMessage = $el.find('.error-message');
      const $submitBtn = $el.find('.submitBtn');

      const fields = isSignup ? { fullname: '', email: '', password: '' } : { email: '', password: '' };

      const errors = isSignup ? 
        {
          email: 'default',
          password: 'default',
        }
        :
        {
          fullname: 'default',
          email: 'default',
          password: 'default',
        };

      let dataForm = {};

      const renderError = texts => {
        const templateError = msg =>  `
          <p class="alert alert-danger text-center py-2 text">
            <a href="#" class="close" data-dismiss="alert" aria-label="close">
              &times;
            </a>
            <span>${msg}</span>
          </p>
        `;
        if (!texts.length) return '';
        let htmlErrors = [];
        if (texts.length && Array.isArray(texts)) {
          texts.forEach(txt => htmlErrors.push(renderError(txt)));
          return htmlErrors.join('');
        }
        return templateError(texts);
      }

      $input.on('paste keyup', function () {
        const key = $(this).prop('name');
        errors[key] = $.trim($formUser.find(`.${key}`).val());
        dataForm[key] = $.trim($formUser.find(`.${key}`).val());
        const $dangersMessage = $formUser.find(`.${key}-error`);
        errors[key] ?
          $dangersMessage.addClass('d-none')
          :
          $dangersMessage.removeClass('d-none');
        const disabled = Object.keys(errors).some(key => !errors[key]);
        $submitBtn.prop('disabled', disabled);
      });

      $formUser.on('submit', e => {
        e.preventDefault();
        let isValid = true;
        Object.keys(fields).forEach(key => {
          errors[key] = $.trim($formUser.find(`.${key}`).val());
          dataForm[key] = $.trim($formUser.find(`.${key}`).val());
          const $dangersMessage = $formUser.find(`.${key}-error`);
          errors[key] ?
            $dangersMessage.addClass('d-none')
            :
            $dangersMessage.removeClass('d-none');
          if (!dataForm[key]) {
            isValid = false;
            $submitBtn.prop('disabled', true);
          }
        });

        if (isValid) {
          $errorMessage.find('.close').click();
          $.ajax({
            url: isSignup ? '/signup' : '/login',
            type: 'POST',
            data: dataForm,
            success: function (data, status, xhr) {
              $loading.removeClass('d-none');
              if (data && xhr.status === 200) {
                $alertDanger.addClass('d-none');
                $successMessage.removeClass('d-none');
                setTimeout(() => {
                  window.location.href = `/home`;
                }, 500)
              }
            },
            error: function (xhr, status, error) {
              const { message, success } = _.get(xhr, 'responseJSON');
              if (!success) {
                $submitBtn.prop('disabled', true);
                $errorMessage.append(renderError(message));
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
