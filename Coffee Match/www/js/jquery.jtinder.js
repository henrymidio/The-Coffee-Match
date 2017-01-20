/*
 * jTinder v.1.0.0
 * https://github.com/do-web/jTinder
 * Requires jQuery 1.7+, jQuery transform2d
 *
 * Copyright (c) 2014, Dominik Weber
 * Licensed under GPL Version 2.
 * https://github.com/do-web/jTinder/blob/master/LICENSE
 */
;(function ($, window, document, undefined) {
	var pluginName = "jTinder",
		defaults = {
			onDislike: function(){ 
				//Faz o PUT (DIS)LIKE
				var user_id       = localStorage.getItem("user_id");
				var shown_user_id = panes.eq(current_pane).attr("id");
				
				localStorage.setItem("shown_user_id", shown_user_id);
				var dados = {
					user_id: user_id,
					shown_user_id: shown_user_id,
					liked: 0
				}
				
				$.ajax({
								url: 'http://thecoffeematch.com/webservice/put-like.php',
								type: 'post',
								data: dados,
								success: function (data) {
									var shown_user_id = panes.eq(current_pane).attr("id");
									localStorage.setItem("shown_user_id", shown_user_id);									
								}
								
							});
				
				//INVERTE NEXT COM CURRENT
				panes.eq(current_pane - 1).toggleClass("next current");
				if(current_pane <= 0){
					$$(".invite").toggleClass("visivel none");	
				}
				
			},
			onLike: function(){ 
				/*
				myApp.prompt('My coffee message is:', "The Coffee Match", function (value) {
					
					localStorage.setItem("message", value);
				});
				*/
				//Faz o PUT LIKE
				var user_id    = localStorage.getItem("user_id");
				var shown_user_id = panes.eq(current_pane).attr("id");
				var message = localStorage.getItem("message");
				if(!message){
					message = "Hey! It seems we have similar interests. Let's have a coffee at Starbucks?!";
				}
								
				localStorage.setItem("shown_user_id", shown_user_id);
				var dados = {
					user_id: user_id,
					shown_user_id: shown_user_id,
					message: message,
					liked: 1
				}
				$.ajax({
								url: 'http://thecoffeematch.com/webservice/put-like.php',
								type: 'post',
								data: dados,
								dataType: 'json',
								success: function (data) {
									
									if(data.message === "match")	{		
										localStorage.setItem("match", data.combinacao);
										mainView.router.loadPage('match.html');
									} else {	
										var shown_user_id = panes.eq(current_pane).attr("id");
										localStorage.setItem("shown_user_id", shown_user_id);		
									}
									
								}
								
							});
				
				//INVERTE NEXT COM CURRENT
				panes.eq(current_pane - 1).toggleClass("next current");
				localStorage.setItem("contador", localStorage.getItem("contador") - 1);
				if(current_pane <= 0){
					$$(".invite").toggleClass("visivel none");	
				}
				
			},
			animationRevertSpeed: 200,
			animationSpeed: 400,
			threshold: 1,
			likeSelector: '.like',
			dislikeSelector: '.dislike'
		};

	var container = null;
	var panes = null;
	var $that = null;
	var xStart = 0;
	var yStart = 0;
	var touchStart = false;
	var posX = 0, posY = 0, lastPosX = 0, lastPosY = 0, pane_width = 0, pane_count = 0, current_pane = 0;

	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init(element);
	}

	Plugin.prototype = {


		init: function (element) {

			container = $(">ul", element);
			panes = $(">ul>li", element);
			pane_width = container.width();
			pane_count = panes.length;
			current_pane = panes.length - 1;
			$that = this;

			$(element).bind('touchstart mousedown', this.handler);
			$(element).bind('touchmove mousemove', this.handler);
			$(element).bind('touchend mouseup', this.handler);
		},

		showPane: function (index) {
			panes.eq(current_pane).hide();
			current_pane = index;
		},

		next: function () {
			return this.showPane(current_pane - 1);
		},

		dislike: function() {	
			panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', 1);
			panes.eq(current_pane).animate({"transform": "translate(-" + (pane_width) + "px," + (pane_width*-1.5) + "px) rotate(-60deg)"}, $that.settings.animationSpeed, function () {	
				if($that.settings.onDislike) {
					$that.settings.onDislike(panes.eq(current_pane));
				}
				$that.next();
			});
		},

		like: function() {
			var contador = localStorage.getItem("contador");
				if(contador <= 0){
					alert("Número de usuários limitados!")
					return false;
				}
			panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', 1);
			panes.eq(current_pane).animate({"transform": "translate(" + (pane_width) + "px," + (pane_width*-1.5) + "px) rotate(60deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onLike) {
					$that.settings.onLike(panes.eq(current_pane));
				}
				$that.next();
			});
		},

		handler: function (ev) {
			ev.preventDefault();

			switch (ev.type) {
				case 'touchstart':
					if(touchStart === false) {
						touchStart = true;
						xStart = ev.originalEvent.touches[0].pageX;
						yStart = ev.originalEvent.touches[0].pageY;
					}
				case 'mousedown':
					if(touchStart === false) {
						touchStart = true;
						xStart = ev.pageX;
						yStart = ev.pageY;
					}
				case 'mousemove':
				case 'touchmove':
					if(touchStart === true) {
						var pageX = typeof ev.pageX == 'undefined' ? ev.originalEvent.touches[0].pageX : ev.pageX;
						var pageY = typeof ev.pageY == 'undefined' ? ev.originalEvent.touches[0].pageY : ev.pageY;
						var deltaX = parseInt(pageX) - parseInt(xStart);
						var deltaY = parseInt(pageY) - parseInt(yStart);
						var percent = ((100 / pane_width) * deltaX) / pane_count;
						posX = deltaX + lastPosX;
						posY = deltaY + lastPosY;

						panes.eq(current_pane).css("transform", "translate(" + posX + "px," + posY + "px) rotate(" + (percent / 2) + "deg)");

						var opa = (Math.abs(deltaX) / $that.settings.threshold) / 100 + 0.2;
						if(opa > 1.0) {
							opa = 1.0;
						}
						if (posX >= 0) {
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', opa);
							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', 0);
						} else if (posX < 0) {
							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', opa);
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', 0);
						}
					}
					break;
				case 'mouseup':
				case 'touchend':
					touchStart = false;
					var pageX = (typeof ev.pageX == 'undefined') ? ev.originalEvent.changedTouches[0].pageX : ev.pageX;
					var pageY = (typeof ev.pageY == 'undefined') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY;
					var deltaX = parseInt(pageX) - parseInt(xStart);
					var deltaY = parseInt(pageY) - parseInt(yStart);

					posX = deltaX + lastPosX;
					posY = deltaY + lastPosY;
					var opa = Math.abs((Math.abs(deltaX) / $that.settings.threshold) / 100 + 0.2);

					if (opa >= 1) {
						if (posX > 0) {
							panes.eq(current_pane).animate({"transform": "translate(" + (pane_width) + "px," + (posY + pane_width) + "px) rotate(60deg)"}, $that.settings.animationSpeed, function () {
								var contador = localStorage.getItem("contador");
							if(contador <= 0){
								alert("Número de usuários limitados!")
								lastPosX = 0;
								lastPosY = 0;
								panes.eq(current_pane).animate({"transform": "translate(0px,0px) rotate(0deg)"}, $that.settings.animationRevertSpeed);
								panes.eq(current_pane).find($that.settings.likeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
								panes.eq(current_pane).find($that.settings.dislikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
								return false;
							}
								if($that.settings.onLike) {
									$that.settings.onLike(panes.eq(current_pane));
								}
								$that.next();
							});
						} else {
							panes.eq(current_pane).animate({"transform": "translate(-" + (pane_width) + "px," + (posY + pane_width) + "px) rotate(-60deg)"}, $that.settings.animationSpeed, function () {
								if($that.settings.onDislike) {
									$that.settings.onDislike(panes.eq(current_pane));
								}
								$that.next();
							});
						}
					} else {
						lastPosX = 0;
						lastPosY = 0;
						panes.eq(current_pane).animate({"transform": "translate(0px,0px) rotate(0deg)"}, $that.settings.animationRevertSpeed);
						panes.eq(current_pane).find($that.settings.likeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						panes.eq(current_pane).find($that.settings.dislikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
					}
					break;
			}
		}
	};

	$.fn[ pluginName ] = function (options) {
		this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
			else if ($.isFunction(Plugin.prototype[options])) {
				$.data(this, 'plugin_' + pluginName)[options]();
		    }
		});

		return this;
	};

})(jQuery, window, document);