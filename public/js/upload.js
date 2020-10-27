$(document).ready(function () {

  const $uploadBtn = $('.upload-btn');
  const $image = $('#image');
  $uploadBtn.on('click', function () {
    $image .click();

    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });

  $image.on('change', function () {
    if ($image.val()) {
      let formData = new FormData();
      let files = $('#image')[0].files;
      if (files.length) {
        formData.append('image', files[0]);
      }

      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          const { name } = data;
          if (name) {
            $image.attr('src', name);
          } 
        },

        xhr: function () {
          var xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              var uploadPercent = Math.floor(e.loaded / e.total);
              uploadPercent = (uploadPercent * 100);

              $('.progress-bar').text(uploadPercent + '%');
              $('.progress-bar').width(uploadPercent + '%');

              if (uploadPercent === 100) {
                $('.progress-bar').text('Done');
                $('#completed').text('File Uploaded');
              }
            }
          }, false);

          return xhr;
        }
      })
    }
  })
})























