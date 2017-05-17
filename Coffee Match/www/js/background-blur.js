;(function ($) {
  'use strict';

  // IE version detection
  var ie = (function() {
    var undef,
      v = 3,
      div = document.createElement('div'),
      all = div.getElementsByTagName('i');

    while (
      div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
      ){}

    return v > 4 ? v : undef;

  }());

  // Random ID generator
  var randomID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  //micro lib that creates SVG elements and adds attributes to it
  var SVG = {

    //namespaces
    svgns: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',

    //creating of SVG element
    createElement: function(name, attrs) {
      var element = document.createElementNS(SVG.svgns, name);

      if (attrs) {
        SVG.setAttr(element, attrs);
      }
      return element;
    },

    //setting attributes
    setAttr: function(element, attrs) {
      for (var i in attrs) {
        if (i === 'href') { //path of an image should be stored as xlink:href attribute
          element.setAttributeNS(SVG.xlink, i, attrs[i]);
        } else { //other common attribute
          element.setAttribute(i, attrs[i]);
        }
      }
      return element;
    }
  };

  // backgroundBlur PUBLIC CLASS DEFINITION
  // ================================

  var Blur = function (element, options) {
    this.internalID   = randomID();
    this.$element     = $(element);
    this.$width       = this.$element.width();
    this.$height      = this.$element.height();
    this.element      = element;
    this.options      = $.extend({}, Blur.DEFAULTS, options);
    this.$overlayEl   = this.createOverlay();
    this.$blurredImage = {};
    this.useVelocity = this.detectVelocity(); // If Velocity.js is present, use it for performant animation
    this.attachListeners();
    this.generateBlurredImage(this.options.imageURL);
  };

  Blur.VERSION  = '0.1.1';

  Blur.DEFAULTS = {
    imageURL      : '', // URL to the image
    blurAmount    : 10, // Amount of blurrines
    imageClass    : '', // CSS class that will be applied to the image and to the SVG element,
    overlayClass  : '', // CSS class of the element that will overlay the blur image
    duration      : false, // If the image needs to be faded in, how long should that take
    opacity       : 1 // Specify the final opacity
  };

  Blur.prototype.detectVelocity= function() {
    return !!window.jQuery.Velocity;
  };

  Blur.prototype.attachListeners = function() {
    this.$element.on('ui.blur.loaded', $.proxy(this.fadeIn, this));
    this.$element.on('ui.blur.unload', $.proxy(this.fadeOut, this));
  };

  Blur.prototype.fadeIn = function () {
    if (this.options.duration && this.options.duration > 0) {
      if (this.useVelocity) {
        this.$blurredImage
          .velocity({
            opacity: this.options.opacity
          }, {
            duration: this.options.duration
          });
      } else {
        this.$blurredImage
          .animate({
            opacity: this.options.opacity
          }, {
            duration: this.options.duration
          });
      }

    }
  };

  Blur.prototype.fadeOut = function () {
    if (this.options.duration && this.options.duration > 0) {
      if (this.useVelocity) {
        this.$blurredImage
          .velocity({
            opacity: 0
          }, {
            duration: this.options.duration
          });
      } else {
        this.$blurredImage
          .animate({
            opacity: 0
          }, {
            duration: this.options.duration
          });
      }

    } else {
      this.$blurredImage.css({'opacity' : 0 });
    }
  };

  Blur.prototype.generateBlurredImage = function (url) {
    var $previousImage = this.$blurredImage;
    this.internalID = randomID();

    if( $previousImage.length > 0) {
      if (this.options.duration && this.options.duration > 0) {
        if (this.useVelocity) {
          $previousImage.first().velocity({ opacity: 0 },{
            duration : this.options.duration,
            complete : function() {
              $previousImage.remove();
            }
          });
        } else {
          $previousImage.first().animate({ opacity: 0 },{
            duration : this.options.duration,
            complete : function() {
              $previousImage.remove();
            }
          });
        }
      } else {
        $previousImage.remove();
      }

    }
    if (!ie) {
      this.$blurredImage = this.createSVG(url, this.$width, this.$height);
    } else {
      this.$blurredImage = this.createIMG(url, this.$width, this.$height);
    }
  };

  Blur.prototype.createOverlay = function () {
    if (this.options.overlayClass && this.options.overlayClass !== ''){
      return $('<div></div>').prependTo(this.$element).addClass(this.options.overlayClass);
    }

    return false;
  };

  Blur.prototype.createSVG = function(url, width, height){
    var that = this;
    var svg = SVG.createElement('svg', { //our SVG element
      xmlns: SVG.svgns,
      version: '1.1',
      width: width,
      height: height,
      id: 'blurred' + this.internalID,
      'class': this.options.imageClass,
      viewBox: '0 0 ' + width + ' '+ height,
      preserveAspectRatio: 'none'
    });

    var filterId = 'blur' + this.internalID; //id of the filter that is called by image element
    var filter = SVG.createElement('filter', { //filter
      id: filterId
    });

    var gaussianBlur = SVG.createElement('feGaussianBlur', { // gaussian blur element
      'in': 'SourceGraphic', //"in" is keyword. Opera generates an error if we don't put quotes
      stdDeviation: this.options.blurAmount // intensity of blur
    });

    var image = SVG.createElement('image', { //The image that uses the filter of blur
      x: 0,
      y: 0,
      width: width,
      height: height,
      'externalResourcesRequired' : 'true',
      href: url,
      style: 'filter:url(#' + filterId + ')', //filter link
      preserveAspectRatio: 'none'
    });

    image.addEventListener('load', function() {
      that.$element.trigger('ui.blur.loaded');
    }, true);

    image.addEventListener('SVGLoad', function() {
      that.$element.trigger('ui.blur.loaded');
    }, true);

    filter.appendChild(gaussianBlur); //adding the element of blur into the element of filter
    svg.appendChild(filter); //adding the filter into the SVG
    svg.appendChild(image); //adding an element of an image into the SVG
    var $svg = $(svg);

    // Ensure that the image is shown after duration + 100 msec in case the SVG load event didn't fire or took too long
    if (that.options.duration && that.options.duration > 0) {
      $svg.css({ opacity : 0});
      window.setTimeout(function(){
        if ($svg.css('opacity') === '0') {
          $svg.css({ opacity : 1});
        }
      }, this.options.duration + 100);
    }
    this.element.insertBefore(svg, this.element.firstChild);
    return $svg;
  };

  Blur.prototype.createIMG = function(url, width, height){
    var that = this;
    var $originalImage = this.prependImage(url);
    var newBlurAmount = ((this.options.blurAmount * 2) > 100) ? 100 : (this.options.blurAmount * 2);
    // apply special CSS attributes to the image to blur it
    $originalImage.css({
      //filter property; here the intensity of blur multipied by two is around equal to the intensity in common browsers.
      filter: 'progid:DXImageTransform.Microsoft.Blur(pixelradius=' + newBlurAmount + ') ',
      //aligning of the blurred image by vertical and horizontal
      top: -this.options.blurAmount * 2.5,
      left: -this.options.blurAmount * 2.5,
      width: width + (this.options.blurAmount * 2.5),
      height: height + (this.options.blurAmount * 2.5) })
      .attr('id', 'blurred' + this.internalID);

    $originalImage.load(function(){
      that.$element.trigger('ui.blur.loaded');
    });

    // Ensure that the image is shown after duration + 100 msec in case the image load event didn't fire or took too long
    if (this.options.duration && this.options.duration > 0) {
      window.setTimeout(function(){
        if ($originalImage.css('opacity') === '0') {
          $originalImage.css({ opacity : 1});
        }
      }, this.options.duration + 100);
    }
    return $originalImage;
  };

  Blur.prototype.prependImage = function(url) {
    var $image;
    var $imageEl = $('<img src="'+url+'" />');
    if (this.$overlayEl) {
      $image = $imageEl.insertBefore(this.$overlayEl).attr('id', this.internalID).addClass(this.options.imageClass);
    } else {
      $image = $imageEl.prependTo(this.$element).attr('id', this.internalID).addClass(this.options.imageClass);
    }

    return $image;
  };
  // backgroundBlur PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('plugin.backgroundBlur');
      var options = $.extend({}, Blur.DEFAULTS, $this.data(), typeof option === 'object' && option);

      if (!data) {
        $this.data('plugin.backgroundBlur', (data = new Blur(this, options)));
      }
      if (option === 'fadeIn') {
        data.fadeIn();
      } else if (option === 'fadeOut') {
        data.fadeOut();
      } else if (typeof option === 'string') {
        data.generateBlurredImage(option);
      }
    });
  }

  var old = $.fn.backgroundBlur;

  $.fn.backgroundBlur             = Plugin;
  $.fn.backgroundBlur.Constructor = Blur;

  // NO CONFLICT
  // ====================

  $.fn.backgroundBlur.noConflict = function () {
    $.fn.backgroundBlur = old;
    return this;
  };

})(jQuery);