/* Pastels Notification */

"use strict";

(function(window) {
    
    var Stack = [null, null, null, null];
	
	Stack.extend({
		collection: [0, 0, 0, 0],
		save: function(o) {
			var i = this.collection.indexOf(0);
			if(i === -1) {
				var m = Math.max.apply(Math, this.collection), i = this.collection.indexOf(m);
				this[i].close();
			}
			this.increment();
			this[i] = o;
			this.collection[i] = 1;
			return i;
		},
		delete: function(i) {
			this[i] = null;
			this.collection[i] = 0;
		},
		reload: function() {
			var i = this.collection.indexOf(Math.max.apply(Math, this.collection));
			if(i !== -1) {
				this.collection[i] = 0;
				this[i].close();
			}
		},
		increment: function() {
			for(var i = 0; i < this.collection.length; i++) {
				if(this.collection[i] !== 0)
					this.collection[i]++;
			}
		},
		last: function() {
			var i = this.collection.indexOf(Math.max.apply(Math, this.collection));
			return (i !== -1 ? this[i] : false);
		},
		lastAdded: function() {
			var i = this.collection.indexOf(Math.min.apply(Math, this.collection));
			return (i !== -1 ? this[i] : false);
		},
		len: function() {
			var c = 0;
			for(var i = 0; i < this.length; i++) {
				if(this[i] !== null)
					c++;
			}
			return c;
		}
	});
		
	var Notification = function(header, content, opt) {
		if(!(this instanceof Notification)) {
			return new Notification(header,content, opt);;
		}
		var self = this;

		this.options = {}.extend(Notification.prototype.defaults, opt);
		if(this.options.isAlert)
			this.options.autoexpire = false;
			
		this.object = $.create('.notification');
		this.prepare(header, content);
		this.insertToDOM();
		this.setPosition();
		this.show();
		
		return this;
	};
	
	Notification.prototype = {}.extend(Pastels.prototype, {
		timeout: undefined,
		expired: false,
		defaults: {
			duration: 800,
			timer: 7000,
			margin: 40,
            position: 'top-right',
			autoexpire: true,
			isAlert: false
		},
		
		prepare: function(h, c) {
			this.object.css({ opacity:0 });
			this.object.append($.create('header').append($.create('h1').html(h))).append($.create('section').append($.create('p').html(c)));
			
			if(this.options.isAlert) {
				var foo = $.create('footer');
				foo.html('<button type="submit">Details</button><button type="cancel">Cancel</button>');
				this.object.append(foo);
			} else {
				this.object.mousedown($.invoke(this.close, this))
					.mouseover($.invoke(this.object.fadeTo, this.object, [0.6]))
					.mouseout($.invoke(this.object.fadeIn, this.object));
			}
		},
		
		setPosition: function() {
			var posX = 0, posY = 0;
			if(Stack.len() === Stack.length)
				Stack.last().close();
		
			this.index = Stack.save(this);
            
            if (this.options.position === 'top-right') {
                posX = this.options.margin;
                posY = (this.object.clientHeight() + this.options.margin) * this.index + this.options.margin + 10;
                
                if(posY + this.object.clientHeight() + this.options.margin*3 > $().clientHeight()) {
                    posX = posX + this.object.clientWidth() + this.options.margin;
                    posY = this.options.margin + 10;
                }
            } else if (this.options.position === 'bottom-right') {
                posX = this.options.margin;
                posY = $().clientHeight() - (this.object.clientHeight() + this.options.margin) * (this.index+1);
                
            } else if (this.options.position === 'top-left') {
                posX = $().clientWidth() - this.object.clientWidth() - this.options.margin;
                posY = (this.object.clientHeight() + this.options.margin) * this.index + this.options.margin + 10;
                
            } else if (this.options.position === 'bottom-left') {
                posX = $().clientWidth() - this.object.clientWidth() - this.options.margin;
                posY = $().clientHeight() - (this.object.clientHeight() + this.options.margin) * (this.index+1);
            }
			
			this.object.css({ position:'fixed', top: posY, right: posX, opacity:0, skewY:15, translateY: -this.object.clientHeight() });
		},
		
		show: function() {
			var self = this;

			self.object.animate({ opacity:1, skewY:0, translateY:0 }, self.options.duration, function() {
				this.emit('disappear');
			});
			
			if(self.options.autoexpire)
				self.timer();
		},
		close: function() {
			var self = this;
			
			if(this.timeout)
				clearTimeout(this.timeout);
				
			this.expired = true;
			this.object.off('mouseup mouseover mouseout');			
			Stack.delete(self.index);
			
			this.object.animate({ opacity:0, skewX:-40, translateX: (self.object.clientWidth() + this.options.margin*2) }, this.options.duration, function() {
				this.emit('disappear');
				self.removeFromDOM();
				self.destroy();
			});
		},
		timer: function() {
			var self = this;
			
			this.timeout = setTimeout(function() {
				if(! self.expired)
					self.close();
			}, this.options.timer);
		}
	});
	window.Notification = Notification;

})(window);