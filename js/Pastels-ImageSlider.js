/* Pastels Image Slider */

"use strict";

(function(window) {
    
    var ImageSlider = function(object, opt) {
        if (!(this instanceof ImageSlider)) {
            return new ImageSlider(object, opt);
        }
        var self = this;
        
        self.options = {}.extend(ImageSlider.prototype.defaults, opt);
        
        if (! object) {
            object = $.create('div.image-slider');
        } else {
            self.options.extend($.parseData(object.data('imager')));
        }
        
        self.images = object.children('img');
        self.object = object.addClass('image-slider');
        self.index = 0;
        self.prepare();
        
        return self;
    };
    
    ImageSlider.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            timeout: 4000,
            effect: 'scrollLeft',
            rows: 5,
            columns: 10,
            clickToNext: true,
            rewindOnScroll: true,
            
            tilesInterval: 100,
            tilesDuration: 500,
            scrollDuration: 800
        },
        prepare: function() {
            var self = this,
                width;
            
            setTimeout(function() {
                self.adjustSize();
                width = self.object.width();
                
                if (self.options.effect === 'tileLeft') {
                    var wpt, slice;
                    
                    self.slices = self.object.children('div.slice');
                    
                    if (self.slices.length === 0) {
                        wpt = parseInt(width / self.options.columns) + 1;
                        
                        for (var i = 0; i < self.options.columns; i++) {
                            slice = $.create('div.slice').css({ width: wpt, left: (wpt * i), opacity: 1, backgroundImage: 'url('+ self.currentImage().prop('src')+')', backgroundPosition: -(wpt * i)+'px 0' });
                            self.slices.include(slice);
                            self.object.append(slice);
                        }
                    }
                } else if (self.options.effect === 'scrollLeft') {
                    self.images.css({ opacity: 0 });
                    self.currentImage().css({ opacity: 1 });
                }
                self.start();
            }, 75);
            
            if (self.options.clickToNext) {
                self.object.mouseup(function() {
                    self.next();
                });
                self.object.on('touchstart', function(e1) {
                    var touch = e1.touches[0];
                    self.object.on('touchend', function(e2) {
                        if (e1.pageX - e2.pageX >= 0) {
                            self.next();
                        } else {
                            self.prev();
                        }
                    });
                });
            }
            if (self.options.rewindOnScroll) {
                self.object.scroll(function() {
                    
                });
            }
        },
        start: function() {
            var self = this;
            
            if (self.timeout) {
                self.stop();
            }
            
            self.timeout = setTimeout(function() {
                self.next();
            }, self.options.timeout);
        },
        stop: function() {
            var self = this;
            self.timeout = clearTimeout(self.timeout);
        },
        next: function() {
            var self = this,
                current = self.currentImage(),
                next = self.nextImage();
            
            if (self.options.effect === 'tileLeft') {
                var interval, j = 0;
                
                self.images.css({ opacity: 0 });
                next.css({ opacity: 1 });
                
                interval = setInterval(function() {
                    if (j >= self.slices.length) {
                        interval = clearInterval(interval);
                    } else if (j + 1 === self.slices.length) {
                        self.slices.eq(j).fadeOut(self.options.tilesDuration, function() {
                            self.increaseIndex();
                            self.slices.clearAnimation().css({ backgroundImage: 'url('+ self.currentImage().prop('src')+')', opacity: 1 });
                            self.start();
                        });
                    } else {
                        self.slices.eq(j).fadeOut(self.options.tilesDuration);
                    }
                    j++;
                }, self.options.tilesInterval);
            } else if (self.options.effect === 'scrollLeft') {
                current.removeClass('active');
                next.css({ translateX: 0, marginLeft: current.width(), opacity: 1 }).addClass('active');
                next.animate({ translateX: -current.width() }, self.options.scrollDuration, function() {
                    next.clearAnimation().css({ marginLeft: 0 });
                    current.css({ opacity: 0, marginLeft: 0, translateX: 0 });
                    self.increaseIndex();
                    self.start();
                });
            }
        },
        prev: function() {
            var self = this,
                current = self.currentImage(),
                prev = self.prevImage();
            
            if (self.options.effect === 'tileLeft') {
                var interval, j = 0;
                
                self.images.css({ opacity: 0 });
                prev.css({ opacity: 1 });
                
                interval = setInterval(function() {
                    if (j >= self.slices.length) {
                        interval = clearInterval(interval);
                    } else if (j + 1 === self.slices.length) {
                        self.slices.eq(j).fadeOut(self.options.tilesDuration, function() {
                            self.increaseIndex();
                            self.slices.clearAnimation().css({ backgroundImage: 'url('+ self.currentImage().prop('src')+')', opacity: 1 });
                            self.start();
                        });
                    } else {
                        self.slices.eq(j).fadeOut(self.options.tilesDuration);
                    }
                    j++;
                }, self.options.tilesInterval);
            } else if (self.options.effect === 'scrollLeft') {
                current.removeClass('active');
                prev.css({ translateX: 0, marginLeft: -(current.width()), opacity: 1 }).addClass('active');
                prev.animate({ translateX: current.width() }, self.options.scrollDuration, function() {
                    prev.clearAnimation().css({ marginLeft: 0 });
                    current.css({ opacity: 0, marginLeft: 0, translateX: 0 });
                    self.decreaseIndex();
                    self.start();
                });
            }
        },
        adjustSize: function() {
            var self = this,
                width, height;
            
            self.images.each(function(n) {
                if (this.width() < width || width == null) {
                    width = this.width();
                }
                if (this.height() < height || height == null) {
                    height = this.height();
                }
            });
            self.object.css({ width: width, height: height });
            return self;
        },
        currentImage: function() {
            return this.images.eq(this.index);
        },
        nextImage: function() {
            return this.images.eq(this.index + 1);
        },
        prevImage: function() {
            return this.images.eq(this.index - 1);
        },
        increaseIndex: function() {
            return this.index = (this.index + 1) % this.images.length;
        },
        decreaseIndex: function() {
            return this.index = (this.index - 1) % this.images.length;
        }
    });
    
    window.ImageSlider = ImageSlider;
    Pastels.push('ImageSlider');
})(window);