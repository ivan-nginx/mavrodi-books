/**
 * zoom.js
 * www.turnjs.com
 * turnjs.com/license.txt
 *
 * Copyright (C) 2012 Emmanuel Garcia
 **/

(function($) {

'use strict';

var has3d,

zoomOptions = {
  max: 2,
  flipbook: null,
  easeFunction: 'ease-in-out',
  duration: 500,
  when: {}
},

zoomMethods = {
  init: function(opts) {

    var that = this,
    data = this.data(),
    options = $.extend({}, zoomOptions, opts);

    if (!options.flipbook || !options.flipbook.turn('is')) {
      throw error('options.flipbook is required');
    }

    has3d = 'WebKitCSSMatrix' in window || 'MozPerspective' in document.body.style;

    if (typeof(options.max)!='function') {
      var max = options.max;
      options.max = function() { return max; };
    }

    data.zoom = {
      opts: options,
      axis: point2D(0, 0),
      scrollPos: point2D(0, 0),
      eventQueue: [],
      mouseupEvent: function() {
        return zoomMethods._eMouseUp.apply(that, arguments);
      },
      eventTouchStart: bind(zoomMethods._eTouchStart, that),
      eventTouchMove: bind(zoomMethods._eTouchMove, that),
      eventTouchEnd: bind(zoomMethods._eTouchEnd, that),
      flipbookEvents: {
        zooming: bind(zoomMethods._eZoom, that),
        pressed: bind(zoomMethods._ePressed, that),
        released: bind(zoomMethods._eReleased, that),
        start: bind(zoomMethods._eStart, that),
        turning: bind(zoomMethods._eTurning, that),
        turned: bind(zoomMethods._eTurned, that),
        destroying: bind(zoomMethods._eDestroying, that)
      }
    };

    for (var eventName in options.when) {
      if (Object.prototype.hasOwnProperty.call(options.when, eventName)) {
        this.bind('zoom.'+eventName, options.when[eventName]);
      }
    }

    for (eventName in data.zoom.flipbookEvents) {
      if (Object.prototype.hasOwnProperty.call(data.zoom.flipbookEvents, eventName)) {
        options.flipbook.bind(eventName, data.zoom.flipbookEvents[eventName]);
      }
    }

    this.css({
      position: 'relative',
      overflow : 'hidden'
    });

    if ($.isTouch) {

      options.flipbook.
        bind('touchstart', data.zoom.eventTouchStart ).
        bind('touchmove', data.zoom.eventTouchMove).
        bind('touchend', data.zoom.eventTouchEnd);

      this.bind('touchstart', zoomMethods._tap);

    } else {
      this.mousedown(zoomMethods._mousedown).
        click(zoomMethods._tap);
    }
  },

  _tap: function(event) {
    
    var that = $(this),
      data = that.data().zoom,
      flip = data.opts.flipbook;

    if (data.draggingCorner || data.dragging) {
      return;
    }

    if (isPage($(event.target), that)) {

      zoomMethods._addEvent.call(that, 'tap', event);
      
      var secuence = zoomMethods._eventSeq.call(that);

      if (secuence)
        that.trigger(secuence);

    }

  },

  _addEvent: function(eventName, event) {
    
    var data = this.data().zoom,
      time = (new Date()).getTime(),
      eventObject = {name: eventName, timestamp: time, event: event};

    data.eventQueue.push(eventObject);

    if (data.eventQueue.length>10)
      data.eventQueue.splice(0, 1);

  },

  _eventSeq: function() {

    var data = this.data().zoom,
      list = data.eventQueue,
      lastEvent = list.length-1;

    if (lastEvent>0 &&
      list[lastEvent].name=='tap' &&
      list[lastEvent-1].name=='tap' &&
      list[lastEvent].event.pageX == list[lastEvent-1].event.pageX &&
      list[lastEvent].event.pageY == list[lastEvent-1].event.pageY &&
      list[lastEvent].timestamp-list[lastEvent-1].timestamp < 200 &&
      list[lastEvent].timestamp-list[lastEvent-1].timestamp > 50)
    {
  
      return $.extend(list[lastEvent].event, {type: 'zoom.doubleTap'});

    } else if (list[lastEvent].name=='tap') {
      
      return $.extend(list[lastEvent].event, {type: 'zoom.tap'});

    }
      
  },

  _prepareZoom: function () {
    
    var flipPos, offsetLeft = 0,
      data = this.data().zoom,
      invz = 1/this.zoom('value'),
      flip = data.opts.flipbook,
      dir = flip.turn('direction'),
      flipData = flip.data(),
      flipOffset = flip.offset(),
      thisOffset = this.offset(),
      flipSize = {height: flip.height()},
      view = flip.turn('view');

      if (flip.turn('display')=='double' && flip.data().opts.autoCenter) {
        if (!view[0]) {
          flipSize.width = flip.width()/2;
          offsetLeft = (dir=='ltr') ? flipSize.width : 0;
          flipPos = point2D(
            (dir=='ltr') ? flipOffset.left-thisOffset.left+flipSize.width : flipOffset.left-thisOffset.left,
            flipOffset.top-thisOffset.top
          );

        } else if (!view[1]) {
          flipSize.width = flip.width()/2;
          offsetLeft = (dir=='ltr') ? 0 : flipSize.width;
          flipPos = point2D(
            (dir=='ltr') ? flipOffset.left-thisOffset.left : flipOffset.left-thisOffset.left+flipSize.width,
            flipOffset.top-thisOffset.top
          );
        } else {
          flipSize.width = flip.width();
          flipPos = point2D(
            flipOffset.left-thisOffset.left,
            flipOffset.top-thisOffset.top
          );
        }
      } else {
        flipSize.width = flip.width();
        flipPos = point2D(
          flipOffset.left-thisOffset.left,
          flipOffset.top-thisOffset.top
        );
      }

    if (!data.zoomer) {
      data.zoomer = $('<div>',
        {'class': 'zoomer',
          css: {
            overflow:'hidden',
            position: 'absolute',
            zIndex: '1000000'
          }
        }).
      mousedown(function() {
        return false;
      }).appendTo(this);
    }


    data.zoomer.css({
      top: flipPos.y,
      left: flipPos.x,
      width: flipSize.width,
      height: flipSize.height
    });
    
    var zoomerView = view.join(',');

    if (zoomerView!=data.zoomerView) {

      data.zoomerView = zoomerView;
      data.zoomer.find('*').remove();

      for (var p = 0; p<view.length; p++)="" {="" if="" (!view[p])="" continue;="" var="" pos="flipData.pageObjs[view[p]].offset()," pageelement="$(flipData.pageObjs[view[p]]);" pageelement.="" clone().="" transform('').="" css({="" width:="" pageelement.width()*invz,="" height:="" pageelement.height()*invz,="" position:="" 'absolute',="" display:="" '',="" top:="" (pos.top="" -="" flipoffset.top)*invz,="" left:="" (pos.left="" flipoffset.left="" offsetleft)*invz="" }).="" appendto(data.zoomer);="" }="" return="" {pos:="" flippos,="" size:="" flipsize};="" },="" value:="" function()="" data="this.data().zoom;" data.opts.flipbook.turn('zoom');="" zoomin:="" function(event)="" pos,="" that="this," flip="data.opts.flipbook," zoom="data.opts.max()," flipoffset="flip.offset()," thisoffset="this.offset();" (data.zoomin)="" this;="" flip.turn('stop');="" ev="$.Event('zoom.change');" this.trigger(ev,="" [zoom]);="" (ev.isdefaultprevented())="" bound="zoomMethods._prepareZoom.call(this)," flippos="bound.pos," center="point2D(bound.size.width/2," bound.size.height="" 2),="" prefix="$.cssPrefix()," transitionend="$.cssTransitionEnd()," autocenter="flip.data().opts.autoCenter;" data.scale="zoom;" flip.data().nocenter="true;" (typeof(event)!="undefined" )="" ('x'="" in="" event="" &&="" 'y'="" event)="" event.y-flippos.y);="" else="" ?="" point2d(="" event.originalevent.touches[0].pagex-flippos.x-thisoffset.left,="" event.originalevent.touches[0].pagey-flippos.y-thisoffset.top="" :="" event.pagex-flippos.x-thisoffset.left,="" event.pagey-flippos.y-thisoffset.top="" );="" center.y);="" (pos.x<0="" ||="" pos.y<0="" pos.x="">bound.width || pos.y>bound.height) {
      pos.x = center.x;
      pos.y = center.y;
    }


    var compose = point2D(
        (pos.x-center.x)*zoom + center.x,
        (pos.y-center.y)*zoom + center.y
      ),
      move = point2D(
        (bound.size.width*zoom>this.width()) ? pos.x-compose.x : 0,
        (bound.size.height*zoom>this.height()) ? pos.y-compose.y : 0
      ),
      maxMove = point2D(
        Math.abs(bound.size.width*zoom-this.width()),
        Math.abs(bound.size.height*zoom-this.height())
      ),
      minMove = point2D(
        Math.min(0, bound.size.width*zoom-this.width()),
        Math.min(0, bound.size.height*zoom-this.height())
      ),
      realPos = point2D(
        center.x*zoom - center.x - flipPos.x - move.x,
        center.y*zoom - center.y - flipPos.y - move.y
      );

    if (realPos.y>maxMove.y)
      move.y = realPos.y - maxMove.y +  move.y;
    else if (realPos.y<minmove.y) move.y="realPos.y" -="" minmove.y="" +="" move.y;="" if="" (realpos.x="">maxMove.x)
      move.x = realPos.x - maxMove.x +  move.x;
    else if (realPos.x<minmove.x) move.x="realPos.x" -="" minmove.x="" +="" move.x;="" realpos="point2D(" center.x*zoom="" center.x="" flippos.x="" move.x,="" center.y*zoom="" center.y="" flippos.y="" move.y="" );="" var="" css="{};" css[prefix+'transition']="prefix" 'transform="" '="" data.opts.easefunction="" data.opts.duration="" 'ms';="" transitionendcallback="function()" {="" that.trigger('zoom.zoomin');="" data.zoomin="true;" data.flipposition="point2D(flip.css('left')," flip.css('top'));="" flip.turn('zoom',="" zoom).css({="" position:="" 'absolute',="" margin:="" '',="" top:0,="" left:0="" });="" flipoffset="flip.offset();" data.axis="point2D(" flipoffset.left="" thisoffset.left,="" flipoffset.top="" thisoffset.top="" if="" (autocenter="" &&="" flip.turn('display')="='double')" ((flip.turn('direction')="='ltr'" !flip.turn('view')[0])="" ||="" (flip.turn('direction')="='rtl'" !flip.turn('view')[1])="" )="" data.axis.x="data.axis.x" flip.width()="" 2;="" that.zoom('scroll',="" realpos);="" that.bind($.mouseevents.down,="" zoommethods._emousedown);="" that.bind($.mouseevents.move,="" zoommethods._emousemove);="" $(document).bind($.mouseevents.up,="" data.mouseupevent);="" that.bind('mousewheel',="" zoommethods._emousewheel);="" settimeout(function()="" data.zoomer.hide();="" data.zoomer.remove();="" data.zoomer="null;" data.zoomerview="null;" },="" 50);="" };="" data.zoomer.css(css).show();="" (transitionend)="" data.zoomer.bind(transitionend,="" function()="" $(this).unbind(transitionend);="" transitionendcallback();="" else="" settimeout(transitionendcallback,="" data.opts.duration);="" data.zoomer.transform(translate(move.x,="" move.y,="" true)="" scale(zoom,="" true));="" return="" this;="" zoomout:="" function(duration)="" pos,="" move,="" that="this," data="this.data().zoom," flip="data.opts.flipbook," zoom="1," scaling="zoom/data.scale," prefix="$.cssPrefix()," transitionend="$.cssTransitionEnd()," thisoffset="this.offset();" duration="(typeof(duration)!='undefined')" ?="" :="" data.opts.duration;="" (!data.zoomin)="" return;="" ev="$.Event('zoom.change');" this.trigger(ev,="" [zoom]);="" (ev.isdefaultprevented())="" data.scale="zoom;" flip.data().nocenter="false;" that.unbind($.mouseevents.down,="" that.unbind($.mouseevents.move,="" $(document).unbind($.mouseevents.up,="" that.unbind('mousewheel',="" flip.css(css);="" flipdespos,="" tmp="$('<div">', {
        css: {
          position: 'relative',
          top: data.flipPosition.y,
          left: data.flipPosition.x,
          width: flip.width()*scaling,
          height: flip.height()*scaling,
          background: 'blue'
        }
      }).appendTo(flip.parent());

    flipDesPos = point2D(
      tmp.offset().left-thisOffset.left,
      tmp.offset().top-thisOffset.top
    );
    

    tmp.remove();

    var autoCenter = flip.data().opts.autoCenter;

    if (autoCenter && flip.turn('display')=='double') {

      if (!flip.turn('view')[0])
        flipDesPos.x = (flip.turn('direction')=='ltr') ?
          flipDesPos.x-tmp.width()/4 :
          flipDesPos.x+tmp.width()/4;
      else if (!flip.turn('view')[1])
        flipDesPos.x = (flip.turn('direction')=='ltr') ?
          flipDesPos.x+tmp.width()/4 :
          flipDesPos.x-tmp.width()/4;
    }

    var flipRealPos = $.findPos(flip[0]);
      
    move = point2D(
      -flip.width()/2 - flipRealPos.left + tmp.width()/2 + flipDesPos.x + thisOffset.left,
      -flip.height()/2 - flipRealPos.top + tmp.height()/2 + flipDesPos.y + thisOffset.top);

    var transitionEndCallback = function() {
    
      if (flip[0].style.removeProperty) {
        
        flip[0].style.removeProperty(prefix+'transition');
        flip.transform(
          (flip.turn('options').acceleration) ? translate(0, 0, true) : '').turn('zoom', 1);
        flip[0].style.removeProperty('margin');
        flip.css({
          position: 'relative',
          top: data.flipPosition.y,
          left: data.flipPosition.x
        });

      } else {
        
        flip.transform('none').
          turn('zoom', 1).
          css({
            margin: '',
            top: data.flipPosition.y,
            left: data.flipPosition.x,
            position: 'relative'
        });

      }

      if (autoCenter)
        flip.turn('center');

      that.trigger('zoom.zoomOut');

    };

    if (duration===0) {
  
      transitionEndCallback();

    } else if (transitionEnd) {

      flip.bind(transitionEnd, function() {

        $(this).unbind(transitionEnd);
        transitionEndCallback();

      });

      flip.transform(translate(move.x, move.y, true) + scale(scaling, true));

    } else {

      setTimeout(transitionEndCallback, duration);
      flip.transform(translate(move.x, move.y, true) + scale(scaling, true));

    }

    return this;
  },

  flipbookWidth: function() {
    
    var data = this.data().zoom,
      flipbook = data.opts.flipbook,
      view = flipbook.turn('view');

    return (flipbook.turn('display')=='double' && (!view[0] || !view[1])) ?
      flipbook.width()/2
      :
      flipbook.width();

  },

  scroll: function(to, unlimited, animate) {
    
    var data = this.data().zoom,
      flip = data.opts.flipbook,
      flipWidth = this.zoom('flipbookWidth'),
      prefix = $.cssPrefix();
    
    if (has3d) {

      var css = {};

      if (animate) {
        css[prefix+'transition'] = prefix + 'transform 200ms';
      } else {
        css[prefix+'transition'] = 'none';
      }

      flip.css(css);
      flip.transform(translate(-data.axis.x - to.x, -data.axis.y - to.y, true));

    } else {
      
      flip.css({top: -data.axis.y - to.y, left: -data.axis.x - to.x});

    }

    if (!unlimited) {

      var out,
        minBound = point2D(
          Math.min(0, (flipWidth-this.width())/2),
          Math.min(0, (flip.height()-this.height())/2)),
        maxBound = point2D(
          (flipWidth>this.width()) ? flipWidth-this.width() : (flipWidth-this.width())/2,
          (flip.height()>this.height()) ? flip.height()-this.height() : (flip.height()-this.height())/2
        );

      if (to.y<minbound.y) {="" to.y="minBound.y;" out="true;" }="" else="" if="" (to.y="">maxBound.y) {
        to.y = maxBound.y;
        out = true;
      }

      if (to.x<minbound.x) {="" to.x="minBound.x;" out="true;" }="" else="" if="" (to.x="">maxBound.x) {
        to.x = maxBound.x;
        out = true;
      }

      if (out) {
        this.zoom('scroll', to, true, true);
      }

    }

    data.scrollPos = point2D(to.x, to.y);

  },

  resize: function() {

    var data = this.data().zoom,
      flip = data.opts.flipbook;
    
    if (this.zoom('value')>1) {

      var  flipOffset = flip.offset(),
        thisOffset = this.offset();

      data.axis =  point2D(
        (flipOffset.left - thisOffset.left) + (data.axis.x + data.scrollPos.x),
        (flipOffset.top - thisOffset.top) + (data.axis.y + data.scrollPos.y)
      );

      if (flip.turn('display')=='double' &&
        flip.turn('direction')=='ltr' &&
        !flip.turn('view')[0])
          data.axis.x = data.axis.x + flip.width()/2;

      this.zoom('scroll', data.scrollPos);
    }

  },

  _eZoom: function() {
    
    var flipPos,
      data = this.data().zoom,
      flip = data.opts.flipbook,
      view = flip.turn('view');

    for (var p = 0; p<view.length; p++)="" {="" if="" (view[p])="" this.trigger('zoom.resize',="" [data.scale,="" view[p],="" flip.data().pageobjs[view[p]]]="" );="" }="" },="" _estart:="" function(event,="" pageobj)="" (this.zoom('value')!="1)" event.preventdefault();="" _eturning:="" page,="" view)="" var="" that="this," zoom="this.zoom('value')," data="this.data().zoom," flip="data.opts.flipbook;" data.page="flip.turn('page');" (zoom!="1)" for="" (var="" p="0;" p<view.length;="" [zoom,="" settimeout(function()="" that.zoom('resize');="" 0);="" _eturned:="" function="" (event,="" page)="" (page="">data.page)
        this.zoom('scroll',
          point2D(0, data.scrollPos.y), false, true);
        
      else if (page<data.page) this.zoom('scroll',="" point2d(flip.width(),="" data.scrollpos.y),="" false,="" true);="" }="" },="" _epressed:="" function()="" {="" var="" data="$(this).data().zoom;" data.draggingcorner="true;" _ereleased:="" settimeout(function()="" 1);="" _emousedown:="" function(event)="" data.draggingcur="($.isTouch)" ?="" point2d(="" event.originalevent.touches[0].pagex,="" event.originalevent.touches[0].pagey="" )="" :="" point2d(event.pagex,="" event.pagey);="" return="" false;="" _emousemove:="" if="" (data.draggingcur)="" data.dragging="true;" cur="($.isTouch)" event.pagey),="" motion="point2D(" cur.x-="" data.draggingcur.x,="" cur.y-data.draggingcur.y="" );="" $(this).zoom('scroll',="" data.scrollpos.x-motion.x,="" data.scrollpos.y-motion.y="" ),="" true="" _emouseup:="" (data.dragging)="" data.scrollpos);="" _emousewheel:="" function(event,="" delta,="" deltax,="" deltay)="" data.scrollpos.x="" +="" deltax*10,="" data.scrollpos.y="" -="" deltay*10="" cur,="" _etouchstart:="" page)="" flip="data.opts.flipbook," finger="point2D(" data.touch="{};" data.touch.initial="finger;" data.touch.last="finger;" data.touch.timestamp="(new" date()).gettime();="" data.touch.speed="point2D(0," 0);="" _etouchmove:="" zoom="$(this).zoom('value')," time="(new" date()).gettime(),="" (data.touch="" &&="" !flip.data().mouseaction)="" data.touch.motion="point2D(" finger.x-data.touch.last.x,="" finger.y-data.touch.last.y);="" data.touch.speed.x="(data.touch.speed.x===0)" data.touch.motion.x="" (time-data.touch.timestamp)="" (data.touch.speed.x="" (data.touch.motion.x="" (time-data.touch.timestamp)))="" 2;="" _etouchend:="" $(this).zoom('value')="=1)" y="Math.abs(data.touch.initial.y" data.touch.last.y);="" (y<50="" (data.touch.speed.x<-1="" ||="" data.touch.last.x-data.touch.initial.x<-100))="" this.trigger('zoom.swipeleft');="" else="" if(y<50="">1 || data.touch.last.x-data.touch.initial.x>100)){
        
        this.trigger('zoom.swipeRight');

      }

    }
  },

  _eDestroying: function() {

    var that = this,
      data = this.data().zoom,
      flip = data.opts.flipbook,
      events = [
        'tap',
        'doubleTap',
        'resize',
        'zoomIn',
        'zoomOut',
        'swipeLeft',
        'swipeRight'
      ];

    this.zoom('zoomOut', 0);

    $.each(events, function(index, eventName) {
      that.unbind('zoom.' + eventName);
    });
    
    for (var eventName in data.flipbookEvents) {
      if (Object.prototype.hasOwnProperty.call(data.flipbookEvents, eventName)) {
        flip.unbind(eventName, data.flipbookEvents[eventName]);
      }
    }

    flip.unbind('touchstart', data.eventTouchStart ).
      unbind('touchmove', data.eventTouchMove).
      unbind('touchend', data.eventTouchEnd);
        
    this.unbind('touchstart', zoomMethods._tap).
      unbind('click', zoomMethods._tap);

    data = null;
    this.data().zoom = null;

  }
};

function isPage(element, last) {

  if (element[0]==last[0])
    return false;

  if (element.attr('page'))
    return true;
  
  return (element.parent()[0]) ?
    isPage(element.parent(), last)
    :
  false;

}

function error(message) {

  function TurnJsError(message) {
    this.name = "TurnJsError";
    this.message = message;
  }

  TurnJsError.prototype = new Error();
  TurnJsError.prototype.constructor = TurnJsError;
  return new TurnJsError(message);

}

function translate(x, y, use3d) {
  
  return (has3d && use3d) ? ' translate3d(' + x + 'px,' + y + 'px, 0px) '
  : ' translate(' + x + 'px, ' + y + 'px) ';

}

function scale(v, use3d) {
  
  return (has3d && use3d) ? ' scale3d(' + v + ', ' + v + ', 1) '
  : ' scale(' + v + ') ';

}

function point2D(x, y) {
  
  return {x: x, y: y};

}

function bind(func, context) {

  return function() {
    return func.apply(context, arguments);
  };

}

$.extend($.fn, {
  zoom: function() {
    
    var args = arguments;

    if (!args[0] || typeof(args[0])=='object')
      return zoomMethods.init.apply($(this[0]), args);
    else if (zoomMethods[args[0]])
      return zoomMethods[args[0]].apply($(this[0]), Array.prototype.slice.call(args, 1));
    else
      throw error(args[0] + ' is not a method');

  }
});

})(jQuery);
</data.page)></view.length;></minbound.x)></minbound.y)></minmove.x)></minmove.y)></view.length;></div>