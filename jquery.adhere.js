(function($){
	
	$.fn.adhere = function(o){
				
		o = $.extend(true, {
			captionContainer:'dl',
			collapseList:true,
			smart:false, // false, smart-inner, smart-outer
			marker:{className:'',xAlign:'center',yAlign:'center',html:''},
			caption:{className:'',xAlign:'center',yAlign:'center',xDistance:5,yDistance:5},
			action:{cEvent:'mouseover',cName:''}
		}, o || {});
		
		return this.each(function(){
		
		 	var figure = $(this);
			var captionContainer = $(this).find(o.captionContainer).get(0);
			var captionedImage = $(this).find('img').get(0);
			var ratio;
			
			if(captionedImage != null){			
				// Use .load on the image for more accurate dimensions
				if($.browser.webkit){
					$(captionedImage).load(function(){
						processAdhere(o, figure, captionContainer, captionedImage, ratio);
					});
				} else processAdhere(o, figure, captionContainer, captionedImage, ratio);
			}
		});
	
	};
	
	function processAdhere(o, figure, captionContainer, captionedImage, ratio){
	
		if(fig_id = figure.attr('id')){	
		
			if(fig_id.match(/(ah-[0-9]+-[0-9]+)$/)){
			
				// figure dimensions
				var id_parts = fig_id.split(/-/);
				var fig_dim = {'w':id_parts[(id_parts.length)-2], 'h':id_parts[(id_parts.length)-1]};
				
			}

		}
		
		var imageWidth = $(captionedImage).width() || 0;
		var imageHeight = $(captionedImage).height() || 0;
		
		var evenE = $(captionContainer).children(':nth-child(2)').get(0);
		var oddE = $(captionContainer).children(':nth-child(1)').get(0);					
		var isPaired = (evenE.nodeName != oddE.nodeName) ? true : false;
		var zindex = 1;
		var autoMarker = (!isPaired && (o.marker.html != ''));
		
		// Set style for container, close the positioned elements in
		figure.css({'position':'relative'});
		
		if('ontouchstart' in window){ o.action.cEvent = 'click'; alert('touch'); }
		
		if(typeof fig_dim != 'undefined'){
		
			if((imageWidth == 0) && (fig_dim.w != null)) imageWidth = fig_dim.w;
			if((imageHeight == 0) && (fig_dim.h != null)) imageHeight = fig_dim.h;
		
			if(fig_dim.w != imageWidth){
			
				ratio = (imageWidth/fig_dim.w);
			
			}
		
		}
		
		if(o.collapseList){
		
			figure.css({'width':imageWidth+'px', 'height':imageHeight+'px'});
			
			// Make the caption list container collapse over the image
			$(captionContainer)
				.css({'position':'absolute', 'top':'0', 'left':'0'})
				.children().css(o.collapseList ? {'position':'absolute'} : '');
				
		}
		
		if(!o.collapseList || autoMarker){
		
			//var imgFloat = $(captionedImage).css('styleFloat');
			
			var wrap = $('<div id="adhere"></div>')
				.css({'width':imageWidth+'px','height':imageHeight+'px'});
			
			$(captionedImage).wrap(wrap);
			
		}
		
		// :even selector starts at 0
		$(captionContainer).children(isPaired ? ':even' : '').each(function(i, e){
		
			// grab the element ID
			var id = e.getAttribute('data-coords') || e.getAttribute('id');
			
			// split the x (dim[1]) and y (dim[2]) coords				
			var coords = (id != null) ? id.split(/-/) : [0,0];
			
			if(ratio != null){
			
				coords[1] = ratioVal(ratio, coords[1]);
				coords[2] = ratioVal(ratio, coords[2]);
			
			}
			
			// if x is greater than width, zero out			
			if(coords[1] > imageWidth) coords[1] = imageWidth;
			else if((coords[1] < 0) || (coords[1] == null)) coords[1] = 0;
			
			// if y is greater than height, zero out
			if(coords[2] > imageHeight) coords[2] = imageHeight;
			else if((coords[2] < 0) || (coords[2] == null)) coords[2] = 0;
			
			if(!o.collapseList || autoMarker){
			
				var html = (o.marker.html) ? o.marker.html : ('<span>'+ (o.captionContainer == 'ol' ? (i+1): '&bull;') +'</span>');
				
				var origEl = e;
			
				e = $(html).css({'position':'absolute'}).addClass(o.marker.className).appendTo($('#adhere'));
				
			}
			
			// All the positioning starts here
			var marker = new captionElement(e, o, zindex);
						
			// Add user marker alignments
			marker.alignMarker.addClass().x(coords[1]).y(coords[2]);
			
			// Add user event
			marker.bindEvent((isPaired || autoMarker));

			if(isPaired || autoMarker){

				// Add user caption alignments
				if(o.smart){
					o.caption.xAlign = marker.smartAlign(coords[1], imageWidth);
				}
				
				if(autoMarker && (origEl != null)){
					marker.alignCaption.pair = origEl;
				}
				
				marker.alignCaption.addClass().x().y();
				
				// Hide caption & add custom class
				$(marker.alignCaption.pair).hide();
												
			}
			
			zindex++;				
		});
	
	}
	
	function captionElement(el, o, zindex){
	
		zindex = zindex || 1;
	
		var capE = {
			
			xAligned: '',
			yAligned: '',
											
			alignMarker: { 
			
				x: function(coord){
					capE.xAligned = this.al(o.marker.xAlign, coord, $(el).outerWidth(true));
					$(el).css({'left':capE.xAligned+'px','z-index':zindex});
					return this;
				},
				y: function(coord){
					capE.yAligned = this.al(o.marker.yAlign, coord, $(el).outerHeight(true));
					$(el).css({'top':capE.yAligned+'px'});
					return this;
				},
				al: function(mAlign, coord, dimension){
				
					switch(mAlign){
					
						case 'left':
						case 'top':
							return (coord - dimension);
							
						case 'right':
						case 'bottom':
							return (coord + dimension);
							
						case 'center':
						case 'middle':
							return (coord - (dimension/2));
							
						default:
							return 0;
					
					}					
				},
				
				addClass: function(){
					var className = o.marker.className || '';
					$(el).addClass(className);
					return this;
				}				
			
			},
			
			alignCaption: {

				pair: $(el).next() || '',
				
				x: function(coord){				
					capxAligned = this.al(o.caption.xAlign, capE.xAligned, $(this.pair).outerWidth(true), $(el).outerWidth(true), o.caption.xDistance);
					$(this.pair).css({'left':capxAligned+'px'});
					return this;
				},
				
				y: function(coord, ratio){
					capyAligned = this.al(o.caption.yAlign, capE.yAligned, $(this.pair).outerHeight(true), $(el).outerHeight(true), o.caption.yDistance);
					$(this.pair).css({'top':capyAligned+'px'});
					return this;
				},
				
				al: function(cAlign, coord, cDimension, mDimension, distance){
				
					var d = distance || 0;
					
					switch(cAlign){
					
						case 'left':
						case 'top':
							return (coord - cDimension - d);
							
						case 'right':
						case 'bottom':						
							return (coord + mDimension + d);
							
						case 'center':
						case 'middle':
							return (coord - (cDimension/2) + (mDimension/2));
							
						default:
							return 0;

					}
				},
				
				addClass: function(){
					var className = o.caption.className || '';
					$(this.pair).addClass(className);
					return this;
				}
				
			},
			
			smartAlign: function(x, imgWidth){
			
				x = x || 0;
				
				var half = (imgWidth/2);
				
				if(o.smart == 'smart-inner'){

					// smart inner: all captions towards the center
					return (x > half) ? 'left' : 'right';				
					
				} else if(o.smart == 'smart-outer') {
				
					// smart outer: all captions away from center
					return (x > half) ? 'right' : 'left';
				
				} else return;
			
			},
			
			bindEvent: function(isPaired){
				
				var isPaired = isPaired || false;
				var ev = o.action.cEvent || '';
				var func = o.action.cName || '';
				
				if(typeof func == 'function') $(el).bind(ev, function(){ func.call(this, el); });
				else if(isPaired) this.defaultCall();
				
			},
			
			defaultCall: function(){
			
				$(el).hover(function(){ $(capE.alignCaption.pair).fadeIn('fast') }, function(){ $(capE.alignCaption.pair).fadeOut("fast") });
			
			}
		};
		
		return capE;
	
	}
	
	function ratioVal(ratio, dimension){
	
		return (ratio * dimension);
	
	}
	
})(jQuery);