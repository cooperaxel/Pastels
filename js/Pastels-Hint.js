/* Pastels Hint */

"use strict";

(function(window) {
    
    var Hint = function(handler, opt) {
        if(!(this instanceof Hint)) {
            return new Hint(handler, opt);
        }
        var self = this, s, e;
        
        this.options = {}.extend(Hint.prototype.defaults, opt);
        
        var dir = handler.data('hintDirection');
        if (dir)
            this.options.direction = dir;
        
        var trigger = handler.data('hintTrigger');
        if (trigger)
            this.options.trigger = trigger;
        
        this.object = $.create('div.hint');
        this.handler = handler;
        this.object.html(handler.attr(this.options.catch));
                
        switch(this.options.trigger) {
            case 'click': {
                s = 'mousedown';
                e = 'mouseup';
                break;
            }
            case 'hover': {
                s = 'mouseover';
                e = 'mouseout';
                break;
            }
            case 'focus': {
                s = 'focus';
                e = 'blur';
                break;
            }
            default: {
                s = 'mouseover';
                e = 'mouseout';
            }
        }
        this.handler.on(s, $.invoke(this.show, this)).on(e, $.invoke(this.close, this));
        
        return this;
    };
    
    $.prototype.Hint = function(opt) {
        $.each(this, function() {
            this.hint = new Hint($(this), opt);
        });
        return this;
    };
    
    Hint.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            catch:'data-hint',
            direction:'right',
            trigger:'hover',
            delay: 200,
            delayOnClose: 1000,
            margin: 15,
            duration: 400
        },
        setPosition: function() {
            var posX = 0, posY = 0, 
                offset = this.handler.offset(),
                origin = this.handler.origin();
            
            origin.x = origin.x - offset.parent.parentNode.scrollLeft;
            origin.y = origin.y - offset.parent.parentNode.scrollTop;
            
            if(this.options.direction == 'left') {
                posX = parseInt(origin.x - this.object.clientWidth() - this.options.margin);
                posY = parseInt(origin.y + (this.handler.clientHeight() - this.object.clientHeight())/2);
            } else if(this.options.direction == 'bottom') {
                posX = parseInt(origin.x + (this.handler.clientWidth() - this.object.clientWidth())/2);
                posY = parseInt(origin.y + this.handler.clientHeight() + this.options.margin);
            } else if(this.options.direction == 'top') {
                posX = parseInt(origin.x + (this.handler.clientWidth() - this.object.clientWidth())/2);
                posY = parseInt(origin.y - this.object.clientHeight() - this.options.margin);
            } else if(this.options.direction == 'overlay') {
                posX = parseInt(origin.x + (this.handler.clientWidth() - this.object.clientWidth())/2);
                posY = parseInt(origin.y + (this.handler.clientHeight() - this.object.clientHeight())/2);
            } else {
                posX = parseInt(origin.x + this.handler.clientWidth() + this.options.margin);
                posY = parseInt(origin.y + (this.handler.clientHeight() - this.object.clientHeight())/2);   
            }
            
            var m = 5;
            
            if(posX < m) posX = m;
            if(posY < m) posY = m;
            if(posX + this.object.clientWidth() > document.width - m) posX = document.width - m;
            if(posY + this.object.clientHeight() > document.height - m) posY = document.height - m;
            
            this.object.css({ position:'absolute', top: posY+'px', left: posX+'px' });
        },
        
        show: function() {
            this.object.css('opacity', 0);
            this.insertToDOM();
            this.setPosition();
            
            clearTimeout(this.timeout);
            this.timeout = setTimeout($.invoke(this.object.fadeIn, this.object, [this.options.duration]), this.options.delay);
        },
        
        close: function() {
            var self = this;
            clearTimeout(self.timeout);
            self.timeout = setTimeout(function() {
                self.object.fadeOut(self.options.duration, $.invoke(self.removeFromDOM, self));
            }, self.options.delayOnClose);
        }
    });
    window.Hint = Hint;
    
})(window);