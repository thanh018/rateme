
; (function ($, window, undefined) {
  'use strict';

  var pluginName = 'forgot';

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function () {
      const $el = this.element;
      const $forgotForm = $el.find('.forgot-form');
      const $emailInput = $el.find('.email-input');
      const $sendBtn = $el.find('.sendBtn');

      $forgotForm.on('submit', e => {
        e.preventDefault();
        const email = $emailInput.val();
        console.log({ email });

        if (email) {
          $.ajax({
            url: '/forgot',
            type: 'POST',
            data: { email: email },
            success: function (data, status, xhr) {
              console.log("data", data)
              // if (data && xhr.status === 200) {
              //   setTimeout(() => {
              //     window.location.href = `/home`;
              //   }, 500)
              // }
            },
            error: function (xhr, status, error) {}
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
