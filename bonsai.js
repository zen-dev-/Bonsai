/*! Bonsai.js v0.1.0: (c) Michael Bayer <michael.bayer@arsmedium.com>  */

(function(window,$){

	if(!$.fn) return; // yes, jQuery is needed (4dev)

	// Bonsai namespace
	window.Bonsai = window.Bonsai || {};

	//Bonsai.debug = true;

	// jquery obj storing	
	window.$dom = window.$dom || {};
	$dom.html = $dom.html || $('html');

	// Helpers
	// Bonsi.log( message )
	Bonsai.log = function(message) {
		try {
			console.log('Bonsai.log: ',message);
		} catch(e) {
			if(Bonsai.debug === true) {
				alert('Bonsai.log:\n' + (message.join ? message.join("\n") : message ) );	
			}
		}
		return this;
	}
	//window.log = Bonsai.log;
	
	/**
	 * Bonsai.responsiveGrid()
	 * 
	 * constructor of the responsiveGrid Prototype
	 */
	Bonsai.responsiveGrid = function(config) {

		config = config || [ 320, 480, 768, 992, 1382 ];

		this.scripts = [];
		this.old_media_class = '';
		this.media_class = '';
		this.device_width = '';

		if(typeof Bonsai.counterResponsiveGrids === 'undefined') {
			Bonsai.counterResponsiveGrids = 1;
		} else {
			Bonsai.counterResponsiveGrids++;
		}

		// already checked for mediaQuerySupport?
		if(typeof Bonsai.cssMediaQuerySupport !== 'boolean') {

			// yes! it's copied!
			// @see https://github.com/scottjehl/Respond/blob/master/respond.src.js
			Bonsai.cssMediaQuerySupport = (function( win ){

				if( win.matchMedia ){ return true; }

				var bool,
					doc = document,
					docElem = doc.documentElement,
					refNode = docElem.firstElementChild || docElem.firstChild,
					fakeUsed = !doc.body,
					fakeBody = doc.body || doc.createElement( "body" ),
					div = doc.createElement( "div" ),
					q = "only all";

				div.id = "bonsai-mq-test-1";
				div.style.cssText = "position:absolute;top:-99em";
				fakeBody.appendChild( div );

				div.innerHTML = '_<style media="'+q+'"> #bonsai-mq-test-1 { width: 9px; }</style>';

				if( fakeUsed ){
					docElem.insertBefore( fakeBody, refNode );
				}

				div.removeChild( div.firstChild );
				bool = div.offsetWidth == 9;
				if( fakeUsed ){
					docElem.removeChild( fakeBody );
				} else {
					fakeBody.removeChild( div );
				}

				return bool;

			})( window );
		}

		this.id = 'bonsai-detect-' + (Bonsai.counterResponsiveGrids-1);

		if(Bonsai.cssMediaQuerySupport) {

			var styleEle = document.createElement('style');
			var styleInner = [];
			this.detectionEle = document.createElement('span');
			this.detectionEle.setAttribute('id',this.id);
			this.detectionEle.setAttribute('style','position:absolute;left:-9999em;top:-9999em');

		}

		var x = 1;
		this.__config = {};
	
		for(var configKey in config) {

			var configVal = config[configKey];

			if(Bonsai.cssMediaQuerySupport) {
				styleInner.push('@media only screen and (min-width: '+configVal+'px) { #'+this.id+'{width:'+x+'px;} }');
				if(Bonsai.debug === true) styleInner.push("\n");
			}

			this.__config[x] = configVal;
			x++;
	
		}

		if(Bonsai.cssMediaQuerySupport) {
			styleEle.innerHTML = styleInner.join('');
			document.getElementsByTagName('head')[0].appendChild(styleEle);
			document.getElementsByTagName('body')[0].appendChild(this.detectionEle);
		}
		
		var that = this;
	
		$(window).resize(function() {
			that.detect();
		});
	
		this.detect();

		return this;
	
	}

	/**
	 * Bonsai.responsiveGrid.detect()
	 * 
	 * Device-Detection
	 */
	Bonsai.responsiveGrid.prototype.detect = function() {

		if(Bonsai.cssMediaQuerySupport) {
			var process_val = this.detectionEle.offsetWidth;
			var device_width = this.__config[process_val];
			this.device_width = device_width;
		} else {
			for(var conf_key in this.__config) {
				var conf_val = this.__config[conf_key];
				if(conf_val <= window.innerWidth) {
					this.device_width = conf_val;
				}
			}
		}
		
		this.media_class = String(this.id + '-' + this.device_width).replace('-0-','-'); // -0- is ugly

		if(this.media_class != this.old_media_class) {

			$dom.html
				.removeClass(this.old_media_class)
				.addClass(this.media_class);

			this.old_media_class = this.media_class;

			if(this.scripts.length > 0) {
				this.loadScripts();
			}

		}

		return this;
	
	}

	/**
	 * Bonsai.responsiveGrid.appendScriptNode()
	 * Append script-node to header - only src-attribute needed (html5)
	 */
	Bonsai.responsiveGrid.prototype.appendScriptNode = function(src) {
		if(src) {
			var se = document.createElement('script');
			se.src = src;
			document.getElementsByTagName('head')[0].appendChild(se);
		}
		return this;
	}

	/**
	 * Bonsai.responsiveGrid.loadScripts()
	 * 
	 * check for the device-condition (=== true) append the script
	 */
	Bonsai.responsiveGrid.prototype.loadScripts = function() {

		for(var scripts in this.scripts) {

			var thisScript = this.scripts[scripts];
				
			if( (thisScript.everyTime && this.scripts[scripts].everyTimeExcuted != this.device_width) || thisScript.executed === false) {

				var append = false;

				if(thisScript.condition === false) {
					append = true;
				} else if(thisScript.condition.indexOf('>') === 0) {
					
					if(thisScript.condition.indexOf('=') === 1) {
						var check_width = parseInt( thisScript.condition.replace('>=','') );
						if(check_width <= this.device_width) {
							append = true;
						}
					} else {
						var check_width = parseInt( thisScript.condition.replace('>','') );
						if(check_width < this.device_width) {
							append = true;
						}
					}

				} else if(thisScript.condition.indexOf('<') === 0) {

					if(thisScript.condition.indexOf('=') === 1) {
						var check_width = parseInt( thisScript.condition.replace('<=','') );
						if(check_width >= this.device_width) {
							append = true;
						}
					} else {
						var check_width = parseInt( thisScript.condition.replace('<','') );
						if(check_width > this.device_width) {
							append = true;
						}
					}

				} else if(!isNaN(thisScript.condition)) {

					var check_width = parseInt( thisScript.condition );
					if(check_width === this.device_width) {
						append = true;
					}

				}

				if(append) {

					if(thisScript.everyTime) {

						if($.getScript) {
							$.getScript( thisScript.src.replace('#!doEveryTime','') );
						} else {
							this.appendScriptNode( thisScript.src.replace('#!doEveryTime','') );
						}

						this.scripts[scripts].everyTimeExcuted = this.device_width;

					} else {
						this.appendScriptNode( thisScript.src );
					}

					this.scripts[scripts].executed = true;

				}

			}
			
		}

		return this;

	}

	/**
	 * Bonsai.responsiveGrid.load()
	 */
	Bonsai.responsiveGrid.prototype.load = function(src, condition) {
		if(src) {
			condition = condition || false;
			this.store(src, condition).loadScripts();
		}
		return this;
	}

	/**
	 * Bonsai.responsiveGrid.store()
	 */
	Bonsai.responsiveGrid.prototype.store = function(src, condition) {
		if(src.join) {
			for(var srcKey in src) {
				var srcValue = src[srcKey];
				if(typeof srcValue === 'string') {
					this.doStorage(srcValue, condition);
				}
			}
		} else if(typeof src === 'string') {
			this.doStorage(src, condition);
		}
		return this;
	}

	/**
	 * Bonsai.responsiveGrid.doStorage()
	 */
	Bonsai.responsiveGrid.prototype.doStorage = function(src, condition) {
		
		if(src) {
			var script_stored = false;

			if(src.indexOf('#!doEveryTime') !== -1) {
				//src = src.replace('#!doEveryTime','');
				var everyTime = true;
			} else {
				var everyTime = false;
			}

			for(var scripts in this.scripts) {
				if( this.scripts[scripts] && this.scripts[scripts].src === src) {
					script_stored = true;
				}
			}
	
			if(!script_stored) {
				this.scripts.push({
					src: src,
					condition: condition,
					executed: false,
					everyTime: everyTime,
					everyTimeExcuted: -1
				});
			}

		}

		return this;
	}

})(this, this.jQuery);