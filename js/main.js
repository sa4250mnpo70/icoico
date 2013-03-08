// many thanks to Ilmari Heikkinen

// for more information see http://en.wikipedia.org/wiki/ICO_(file_format)
// an .ico file consists of header data, followed by ICONDIRENTRY data for
// each icon image, then the data for each image

var imagePath = "images/";
var imageFiles = ["icon16.png", "icon22.png", "icon32.png", "icon48.png", "icon128.png"]

initDataStream();
loadImages();
// createIcon() is called when all images have loaded

var ds;
var headerLength;
function initDataStream(){
	ds = new DataStream();
	ds.endianness = DataStream.LITTLE_ENDIAN;
	ds.writeUint16(0); // reserved, must be 0
	ds.writeUint16(1); // 1 means .ico (2 means .cur)
	ds.writeUint16(imageFiles.length); // number of images

	// header length is 6 + 16 * image_count bytes
	headerLength = 6 + 16 * imageFiles.length; // *** is this right?
}

function loadImages(){
	for (var i = 0; i != imageFiles.length; ++i){
		loadImage(i);
	}
}

var numLoaded = 0;
var allImageData = "";
function loadImage(i){
	var image = new Image();
	image.src = imagePath + imageFiles[i];
	console.log(image.src);
	image.onload = function() {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		var imageData = atob(canvas.toDataURL('image/png').replace(/^[^,]+,/, ''));

		// write ICONDIRENTRY data
		ds.writeUint8(this.width); // width
		ds.writeUint8(this.height); // height
		ds.writeUint8(0); // not palette image: 0 if truecolor
		ds.writeUint8(0); // reserved
		ds.writeUint16(1); // color planes
		ds.writeUint16(32); // bits per pixel
		ds.writeUint32(imageData.length); // *** is this right?
		ds.writeUint32(headerLength + allImageData.length); // *** is this right?

		// image data will be written to stream in createIcon(), after all ICONDIRENTRY data
		allImageData += imageData; // *** is this right?

		numLoaded += 1;
		if (numLoaded === imageFiles.length) // doesn't account for errors, but...
			createIcon();
	}
}

function createIcon(){
	ds.writeString(allImageData);
	var ico = new Blob([ ds.buffer ]);
	var url = window.URL.createObjectURL(ico);
	var image = new Image();
	document.body.appendChild(image);
	image.src = url; // not surprisingly, this doesn't work :)
  // data:image/vnd.microsoft.icon;base64,
	var link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = url;
	document.querySelector("head").appendChild(link);
}


/*
var image1 = document.createElement('canvas');
image1.width = 32;
image1.height = 32;
var ctx1 = image1.getContext('2d');
var img32 = new Image();
img32.src = 'images/icon32.png';
img32.onload = function() {
image1.drawImage(img32, 0, 0, 32, 32);
var imageData1 = atob(image1.toDataURL('image/png').replace(/^[^,]+,/, ''));

var image2 = document.createElement('canvas');
image2.width = 16;
image2.height = 16;
var ctx2 = image2.getContext('2d');
var img16 = new Image();
img16.src = 'images/icon16.png';
img16.onload = function() {
	ctx2.drawImage(img16, 0, 0, 16, 16);
	var imageData2 = atob(image2.toDataURL('image/png').replace(/^[^,]+,/, ''));
	console.log(imageData2);
}
// https://github.com/kig/DataStream.js

var ds = new DataStream();
ds.endianness = DataStream.LITTLE_ENDIAN;

ds.writeUint16(0); // reserved
ds.writeUint16(1); // .ICO
ds.writeUint16(2); // two images

// header length is 6 + 16 * image_count bytes
var headerLength = 6 + 16 * 2;

// first image
ds.writeUint8(image1.width); // width
ds.writeUint8(image1.height); // height
ds.writeUint8(0); // not palette image: 0 if ?truecolor
ds.writeUint8(0); // reserved
ds.writeUint16(1); // color planes
ds.writeUint16(32); // bits per pixel (32 = 24 color + 8 alpha)
ds.writeUint32(imageData1.length);
ds.writeUint32(headerLength);

// second image
ds.writeUint8(image2.width); // width
ds.writeUint8(image2.height); // height
ds.writeUint8(0); // not palette image
ds.writeUint8(0); // reserved
ds.writeUint16(1); // color planes
ds.writeUint16(32); // bits per pixel
ds.writeUint32(imageData2.length);
ds.writeUint32(headerLength + imageData1.length);

ds.writeString(imageData1);
ds.writeString(imageData2);


var ico = new Blob([ ds.buffer ]);
var url = window.URL.createObjectURL(ico);

*/
