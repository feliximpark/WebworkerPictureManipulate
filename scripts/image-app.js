(function(){
  // http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
  var original;
  // hier erstelle ich einen neuen Worker namens myWorker
  var myWorker = new Worker("scripts/worker.js");
  var imageLoader = document.querySelector('#imageLoader');
  imageLoader.addEventListener('change', handleImage, false);
  var canvas = document.querySelector('#image');
  var ctx = canvas.getContext('2d');

  function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);
        original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }

  // greys out the buttons while manipulation is happening
  // un-greys out the buttons when the manipulation is done
  function toggleButtonsAbledness() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].hasAttribute('disabled')) {
        buttons[i].removeAttribute('disabled')
      } else {
        buttons[i].setAttribute('disabled', null);
      }
    };
  }

  function manipulateImage(type) {
    var a, b, g, i, imageData, j, length, pixel, r, ref;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    toggleButtonsAbledness();

    // ich übergebe dem Worker imageDate und den Type der angestrebten Verwandlung

    myWorker.postMessage({"imageData": imageData, "type": type});

    //jetzt kommt die Funktion die abgefeuert wird, wenn der Worker mir etwas
    // zurückschickt
    myWorker.onmessage = function(e) {
      toggleButtonsAbledness(); //hier blendet er den Button wieder auf
      var image = e.data; //hier stecken die veränderten Bildinfos drin
      if (image) return ctx.putImageData(e.data, 0, 0); // malt die Infos
      console.log ("No manipulated image return"); // wenn image !== true
    }

// hier zur Sicherheit und aus good habit ein Fehler-Funktion
    // myWorker.onerror = function(error){
    //   function WorkerException(message){
    //     this.name = "WorkerException";
    //     this.message = message;
    //   };
    //   throw new WorkerException("Worker error.");
    // };

    // Hint! This is where you should post messages to the web worker and
    // receive messages from the web worker.

    // length = imageData.data.length / 4;
    // for (i = j = 0, ref = length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    //   r = imageData.data[i * 4 + 0];
    //   g = imageData.data[i * 4 + 1];
    //   b = imageData.data[i * 4 + 2];
    //   a = imageData.data[i * 4 + 3];
    //   pixel = manipulate(type, r, g, b, a);
    //   imageData.data[i * 4 + 0] = pixel[0];
    //   imageData.data[i * 4 + 1] = pixel[1];
    //   imageData.data[i * 4 + 2] = pixel[2];
    //   imageData.data[i * 4 + 3] = pixel[3];
    // }


  };

  function revertImage() {
    return ctx.putImageData(original, 0, 0);
  }

  document.querySelector('#invert').onclick = function() {
    manipulateImage("invert");
  };
  document.querySelector('#chroma').onclick = function() {
    manipulateImage("chroma");
  };
  document.querySelector('#greyscale').onclick = function() {
    manipulateImage("greyscale");
  };
  document.querySelector('#vibrant').onclick = function() {
    manipulateImage("vibrant");
  };
  document.querySelector('#revert').onclick = function() {
    revertImage();
  };
})();