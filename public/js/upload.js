$(document).ready(function () {

  const $uploadBtn = $('.upload-btn');
  const $image = $('#image');
  $uploadBtn.on('click', function () {
    $image .click();

    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });

  $('.upload-input').on('change', function () {
    if ($image.val()) {
      let formData = new FormData();

      formData.append('upload', $image[0].files[0]);
      console.log("formData", formData)

      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
          // $image.val('');
        },

        xhr: function () {
          var xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              var uploadPercent = e.loaded / e.total;
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























