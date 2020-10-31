$(document).ready(function () {

  const $uploadBtn = $('.upload-btn');
  const $image = $('#image');
  const $logo = $('.logo-image');
  const $modalUpload = $('.modalUpload');
  const $progressBar = $('.progress-bar');
  const $completd = $('#completed');
  $uploadBtn.on('click', function () {
    $image .click();
    $progressBar.text('0%');
    $progressBar.width('0%');
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
            $logo.attr('src', `/uploads/${name}`);
            $image.attr('src', name);
          } 
        },

        xhr: function () {
          var xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              var uploadPercent = Math.floor(e.loaded / e.total);
              uploadPercent = (uploadPercent * 100);

              $progressBar.text(uploadPercent + '%');
              $progressBar.width(uploadPercent + '%');
              if (uploadPercent === 100) {
                $progressBar.text('Done');
                $completd.removeClass('d-none');  
              }

              setTimeout(() => {
                $modalUpload.modal('hide');
              }, 1000)

              
            }
          }, false);

          return xhr;
        }
      })
    }
  })
})























