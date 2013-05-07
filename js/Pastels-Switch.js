/* Pastels Switch */

"use strict";

(function(window) {
    
    var Switch = function(object, opt) {
        if(!(this instanceof Switch)) {
            return new Switch(object, opt);
        }
        var self = this, data = object.data('switch');
        
        this.options = {}.extend(Switch.prototype.defaults, opt);
        
        if(data) {
            if(data.indexOf('localValue') !== -1) {
                this.options.localValue = true;
            }
        }
        
        if(!object) {
            this.object = $.create('div.switch');
        } else {
            this.slider = $.create('div.slider');
            this.container = $.create('div.switch-container');
            
            if (object.is('input')) {
                this.object = $.create('div.switch');
                this.input = object;
                this.object.attr({ id: 'switch-' + this.input.attr('name') });
                this.input.wrap(this.container.prepend(this.slider));
                this.container.wrap(this.object);
            } else {
                this.object = object;
                this.input = $.create('input.switch-input').attr('type', 'checkbox');
                this.input.attr({ name: this.object.attr('id').lbreak('switch-') });
                this.container.append(this.slider).append(this.input);
                this.object.append(this.container);
            }
        }
        this.prepare();
        
        return this;
    };
    
    Switch.prototype = {}.extend(Pastels.prototype, {
        status: false,
        defaults: {
            duration: 300,
            localValue: false
        },
        
        prepare: function() {
            var self = this;
            
            if(this.options.localValue) {
                var l = localStorage.getObject('switch-'+this.object.attr('id'));
                if(l === 'on')
                    this.setOn();
                else if(l === 'off')
                    this.setOff();
            }
            
            if (this.object.is('.checked') || this.input.is(':checked')) {
                this.setOn();
            } else {
                this.setOff();
            }
            
            self.object.mouseup(function() {
                if(self.status) {
                    self.setOff();
                } else {
                    self.setOn();
                }
            });
        },
        
        setOn: function() {
            this.slider.animate({ marginLeft: 0 }, this.options.duration);
            
            this.status = true;
            this.object.addClass('checked');
            this.input.prop('checked', true);
            this.object.emit('switchOn');
            if(this.options.localValue)
                localStorage.setObject('switch-'+this.object.attr('id'), 'on');
        },
        
        setOff: function() {
            var width = this.slider.width();
            this.slider.animate({ marginLeft: -(width-10) }, this.options.duration);
            
            this.status = false;
            this.object.removeClass('checked');
            this.input.prop('checked', false);
            this.object.emit('switchOff');
            if(this.options.localValue)
                localStorage.setObject('switch-'+this.object.attr('id'), 'off');
        }
    });
    window.Switch = Switch;
    
})(window);