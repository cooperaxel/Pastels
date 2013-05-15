/* Pastels Alert */

"use strict";

(function(window) {
    
    var Alert = function(header, content, opt) {
        if(!(this instanceof Alert)) {
            return new Alert(header, content, opt);
        }
        var self = this;
        
        this.options = {}.extend(Alert.prototype.defaults, opt);
        
        this.object = $.create('div.alert');
        this.fog = $.create('div.alert-fog').css('opacity', 0);
        this.border = $.create('div.alert-border').css('opacity', 0);
        this.body = $.create('div.alert-body');
        
        this.prepare(header, content);
        
        return this;
    };
    
    $.prototype.Alert = function() {
        $.each(this, function() {
            this.alert = new Alert('Alert header', 'Alert content<br/><br/><br/>');
            this.on('mouseup', $.invoke(this.alert.show, this.alert));
        });
        return this;
    };
    
    Alert.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            fogOpacity: 0.85,
            duration: 500,
            hideOnClick: true,
        },
        prepare: function(header, content, footer) {
            var self = this;
            if(!footer) footer = '<button type="submit">Submit</button><button type="cancel">Cancel</button>';
            this.body.append($.create('header').html(header)).append($.create('section').html(content)).append($.create('footer').html(footer));
            this.object.append(this.border.append(this.body)).append(this.fog);
            
            this.body.mousedown(function(e) {
                e.stopPropagation();
            });
            
            self.body.find('button[type=cancel]').mouseup(function() {
                self.object.emit('cancel');
                self.close();
            });
            self.body.find('button[type=submit]').mouseup(function() {
                self.object.emit('accept');
                self.close();
            });
        },
        
        show: function() {
            var self = this;

            this.insertToDOM();
            this.border.css({ scale:0.3 });
            this.fog.animate({ opacity: this.options.fogOpacity }, this.options.duration);
            
            setTimeout(function() {
                self.border.animate({ opacity:1, scale:1 }, self.options.duration/2, function() {
                    self.border.removeAttr('style');
                    self.object.emit('appear');
                });
            }, this.options.duration/2);
            
            if(this.options.hideOnClick) {
                this.fog.mousedown(function() {
                    self.close();
                    self.fog.off('mousedown');
                });
            }
        },
        
        close: function() {
            var self = this;
            
            this.fog.animate({ opacity:0 }, self.options.duration);
            self.border.animate({ opacity:0, translateY:-200 }, self.options.duration, function() {
                self.object.emit('disappear');
                self.removeFromDOM();
            });
        }
    });
    
    window.Alert = Alert;
    Pastels.push('Alert');
})(window);