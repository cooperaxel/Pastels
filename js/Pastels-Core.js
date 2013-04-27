/* Pastels - JavaScript User Interface Library */

"use strict";

(function(window) {
	var Pastels = function() {
		this.observers = {};
	};
	
	Pastels.prototype = {
		
		setOptions: function(o) {
			this.options = this.options.extend(o);
			this.insertToDOM();
			if(this.prepare)
				this.prepare();
			if(this.setPosition)
				this.setPosition();
			this.removeFromDOM();
		},
		inDOM: function() {
			return this.object.item(0).parentNode ? true : false;
		},
		insertToDOM: function(p) {
			if(! this.inDOM()) {
				if(!p) p = $();
				p.append(this.object);
			}
		},
		removeFromDOM: function() {
			if(this.inDOM()) {
				this.object.remove();
			}
		},
		destroy: function() {
			this.object.emit('destroy');
			delete this;
		}
	};
    
    Pastels.version = '0.1.2';
    Pastels.codename = 'Cyaneous';
	
	window.Pastels = Pastels;
})(window);

(function(window) {
	
	$.prototype.dragNdrop = function() {
		var self = this;
		
		self.mousedown(function(e) {
			var $this = $(this), pos = { x: e.clientX, y: e.clientY };
			
			$this.css({ position:'absolute' });
			if($this.parent().css('position') == 'static') {
				$this.parent().css({ position: 'relative' });
			}
			pos.x = pos.x - $this.origin().x - $this.parent().origin().x;
			pos.y = pos.y - $this.origin().y - $this.parent().origin().y;				
			
			$.document.on('mousemove', function(e) {
				var x = e.clientX - pos.x, y = e.clientY - pos.y;
				
				$this.css({ left: x, top: y });
				
				if(x < 0) 
					$this.css({ left: 0 });
				else if(x+$this.clientWidth() >= $().clientWidth()) 
					$this.css({ left: $().clientWidth()-$this.clientWidth() });
				
				if(y < 0) 
					$this.css({ top: 0 });
				else if(y+$this.clientHeight() >= $().clientHeight())
					$this.css({ top: $().clientHeight()-$this.clientHeight()-1 });
				
			}).on('mouseup', function() {
				$.document.off('mousemove mouseup');
			});
		});
		return this;
	};
	
	$.loadLocalValues = function() {
		if($.localValues) {
			$('*[name][data-local-value]').each(function() {
				this.value = localStorage.getObject(this.tagName+'-'+this.name);
			}).on('change', function() {
				localStorage.setObject(this.tagName+'-'+this.name, this.value);
			});
		}
	};
})(window);

$(function() {
    $().removeClass('preload');
});