/**
 * turn.js 4th release HTML4 version
 * turnjs.com
 * turnjs.com/license.txt
 *
 * Copyright (C) 2012 Emmanuel Garcia
 * All rights reserved
 **/

(function($) {

'use strict';

var has3d,

  vendor = '',
  
  version = '4.1.0',

  isTouch = false,

  mouseEvents =
    {
      down: 'mousedown',
      move: 'mousemove',
      up: 'mouseup',
      over: 'mouseover',
      out: 'mouseout'
    },

  corners = {
    backward: ['l'],
    forward: ['r'],
    all: ['l', 'r']
  },

  // Display values

  displays = ['single', 'double'],

  // Direction values

  directions = ['ltr', 'rtl'],

  // Default options

  turnOptions = {

    // Enables hardware acceleration

    acceleration: true,

    // Display

    display: 'double',

    // Duration of transition in milliseconds

    duration: 600,

    // First page

    page: 1,
    
    // Enables gradients

    gradients: true,

    // Events

    when: null
  },

  flipOptions = {

    // Enables hardware acceleration

    acceleration: true,
    
    // Corners
    // backward: Activates both tl and bl corners
    // forward: Activates both tr and br corners
    // all: Activates all the corners

    corners: 'forward',
    
    // Size of the active zone of each corner

    cornerSize: 100,


    // Duration of transition in milliseconds

    duration: 600,
    
    // Enables gradients

    gradients: true

  },

  // Number of pages in the DOM, minimum value: 6

  pagesInDOM = 6,
  

turnMethods = {

  // Singleton constructor
  // $('#selector').turn([options]);

  init: function(opts) {

    if (this.length>1)
      throw turnError('This selector has more than 1 element');
    
    // Define constants
    
    vendor = getPrefix();

    var i, pageNum = 0, data = this.data(), ch = this.children();

    // Set initial configuration

    opts = $.extend({
      width: this.width(),
      height: this.height(),
      direction: this.attr('dir') || this.css('direction') || 'ltr'
    }, turnOptions, opts);

    data.opts = opts;
    data.pageObjs = {};
    data.pages = {};
    data.pageWrap = {};
    data.pagePlace = {};
    data.pageMv = [];
    data.zoom = 1;
    data.totalPages = opts.pages || 0;
    data.docEvents = {
      mouseStart: function(e) {
        for (var page in data.pages)
          if (has(page, data.pages) &&
            flipMethods._eventStart.call(data.pages[page], e)===false)
              return false;
      },

      mouseMove: function(e) {
        for (var page in data.pages)
          if (has(page, data.pages))
            flipMethods._eventMove.call(data.pages[page], e);
      },

      mouseEnd: function(e) {
        for (var page in data.pages)
          if (has(page, data.pages))
            flipMethods._eventEnd.call(data.pages[page], e);
      }
    };

    // Add event listeners

    if (opts.when)
      for (i in opts.when)
        if (has(i, opts.when))
          this.bind(i, opts.when[i]);

    // Set the css

    this.css({position: 'relative', width: opts.width, height: opts.height});

    // Set the initial display

    this.turn('display', opts.display);

    // Set the direction

    if (opts.direction!=='')
      this.turn('direction', opts.direction);


    // Add pages from the DOM

    for (i = 0; i<ch.length; i++)="" {="" if="" ($(ch[i]).attr('ignore')!="1" )="" this.turn('addpage',="" ch[i],="" ++pagenum);="" }="" event="" listeners="" $(this).bind(mouseevents.down,="" data.docevents.mousestart).="" bind('start',="" turnmethods._start).="" bind('end',="" turnmethods._end).="" bind('pressed',="" turnmethods._pressed).="" bind('released',="" turnmethods._released).="" bind('flip',="" turnmethods._flip);="" $(document).bind(mouseevents.move,="" data.docevents.mousemove).="" bind(mouseevents.up,="" data.docevents.mouseend);="" set="" the="" initial="" page="" this.turn('page',="" opts.page);="" data.done="true;" return="" this;="" },="" adds="" a="" from="" external="" data="" addpage:="" function(element,="" page)="" var="" currentpage,="" classname,="" incpages="false," lastpage="data.totalPages+1;" (data.destroying)="" false;="" read="" number="" classname="" of="" `element`="" -="" format:="" p[0-9]+="" ((currentpage="/\bp([0-9]+)\b/.exec($(element).attr('class'))))" 10);="" (page)="" (page="=lastPage)" else="">lastPage)
        throw turnError('Page "'+page+'" cannot be inserted');

    } else {
      
      page = lastPage;
      incPages = true;

    }

    if (page>=1 && page<=lastpage) {="" if="" (data.display="='double')" classname="(page%2)" ?="" '="" odd'="" :="" even';="" else="" ;="" stop="" animations="" (data.done)="" this.turn('stop');="" move="" pages="" it's="" necessary="" (page="" in="" data.pageobjs)="" turnmethods._movepages.call(this,="" page,="" 1);="" increase="" the="" number="" of="" (incpages)="" data.totalpages="lastPage;" add="" element="" data.pageobjs[page]="$(element)." css({'float':="" 'left'}).="" addclass('page="" p'="" +="" page="" classname);="" turnmethods._addpage.call(this,="" page);="" update="" view="" this.turn('update');="" remove="" out="" range="" turnmethods._removefromdom.call(this);="" }="" return="" this;="" },="" adds="" a="" _addpage:="" function(page)="" var="" data="this.data()," (element)="" (turnmethods._necesspage.call(this,="" page))="" (!data.pagewrap[page])="" prop="turnMethods._pageSize.call(this," true);="" element.css({width:="" prop.width,="" height:="" prop.height});="" place="" data.pageplace[page]="page;" wrapper="" data.pagewrap[page]="$('<div/">',
            {'class': 'turn-page-wrapper',
              page: page,
              css: {position: 'absolute',
              overflow: 'hidden'}}).
            css(prop);

          // Append to this
          this.append(data.pageWrap[page]);

          // Move element to wrapper
          data.pageWrap[page].prepend(data.pageObjs[page]);

        }

        // If the page is in the current view, create the flip effect
        if (!page || turnMethods._setPageLoc.call(this, page)==1)
          turnMethods._makeFlip.call(this, page);
        
      } else {

        // Place
        data.pagePlace[page] = 0;

        // Remove element from the DOM
        if (data.pageObjs[page])
          data.pageObjs[page].remove();

      }

  },

  // Checks if a page is in memory
  
  hasPage: function(page) {

    return has(page, this.data().pageObjs);
  
  },

  // Centers the flipbook

  center: function(page) {
    
    var data = this.data(),
      size = $(this).turn('size'),
      left = size.width/(data.zoom*2) -size.width/2;

    if (data.display=='double') {
      var view = this.turn('view', page || data.tpage || data.page);

      if (data.direction=='ltr') {
        if (!view[0])
          left -= size.width/4;
        else if (!view[1])
          left += size.width/4;
      } else {
        if (!view[0])
          left += size.width/4;
        else if (!view[1])
          left -= size.width/4;
      }
    }

    $(this).css({marginLeft: left});

    return this;

  },

  // Destroys the flipbook

  destroy: function () {

    var page,
      data = this.data();

    data.destroying = true;

    $(this).unbind(mouseEvents.down)
      .unbind('end')
      .unbind('first')
      .unbind('flip')
      .unbind('last')
      .unbind('pressed')
      .unbind('released')
      .unbind('start')
      .unbind('turning')
      .unbind('turned')
      .unbind('zooming');

    $(document).unbind(mouseEvents.move, data.docEvents.mouseMove).
      unbind(mouseEvents.up, data.docEvents.mouseEnd);
    
    while (data.totalPages!==0) {
      this.turn('removePage', data.totalPages);
    }

    if (data.fparent)
      data.fparent.remove();

    if (data.shadow)
      data.shadow.remove();

    this.removeData();
    data = null;

    return this;

  },

  // Checks if this element is a flipbook

  is: function() {

    return typeof(this.data().pages)=='object';

  },

  // Sets and gets the zoom value

  zoom: function(newZoom) {
    
    var data = this.data();

    if (typeof(newZoom)=='number') {

      if (newZoom<0.001 ||="" newzoom="">100)
        throw turnError(newZoom+ ' is not a value for zoom');
    
      var event = $.Event('zooming');
      this.trigger(event, [newZoom, data.zoom]);

      if (event.isDefaultPrevented())
        return this;
      
      var size = $(this).turn('size'),
        iz = 1/data.zoom,
        newWidth = Math.round(size.width * iz * newZoom),
        newHeight = Math.round(size.height * iz * newZoom);
    
      data.zoom = newZoom;

      $(this).turn('stop').
        turn('size', newWidth, newHeight).
        css({marginTop: size.height * iz / 2 - newHeight / 2});

      if (data.opts.autoCenter)
        this.turn('center');
      else
        $(this).css({marginLeft: size.width * iz / 2 - newWidth / 2});
      
      turnMethods._updateShadow.call(this);
  
      return this;

    } else
      return data.zoom;

  },

  // Gets the size of a page

  _pageSize: function(page, position) {

    var data = this.data(),
      prop = {};

    if (data.display=='single') {

      prop.width = this.width();
      prop.height = this.height();

      if (position) {
        prop.top = 0;
        prop.left = 0;
        prop.right = 'auto';
      }

    } else {

      var pageWidth = this.width()/2,
        pageHeight = this.height();

      if (data.pageObjs[page].hasClass('own-size')) {
        prop.width = data.pageObjs[page].width();
        prop.height = data.pageObjs[page].height();
      } else {
        prop.width = pageWidth;
        prop.height = pageHeight;
      }

      if (position) {
        var odd = page%2;
        prop.top = (pageHeight-prop.height)/2;

        if (data.direction=='ltr') {
          
          prop[(odd) ? 'right' : 'left'] = pageWidth-prop.width;
          prop[(odd) ? 'left' : 'right'] = 'auto';

        } else {
          
          prop[(odd) ? 'left' : 'right'] = pageWidth-prop.width;
          prop[(odd) ? 'right' : 'left'] = 'auto';

        }

      }
    }

    return prop;

  },

  // Prepares the flip effect for a page

  _makeFlip: function(page) {

    var data = this.data();

    if (!data.pages[page] && data.pagePlace[page]==page) {
      var corner,
        single = data.display=='single',
        odd = page%2;

      data.pages[page] = data.pageObjs[page].
        css(turnMethods._pageSize.call(this, page)).
        flip({page: page,
          next: (odd || single) ? page+1 : page-1,
          turn: this,
          duration: data.opts.duration,
          acceleration : data.opts.acceleration,
          gradients: data.opts.gradients
          }).
          flip('disable', data.disabled);
    }

    return data.pages[page];
  },

  // Makes pages within a range

  _makeRange: function() {

    var page, range,
      data = this.data();

    if (data.totalPages<1) 1="" return;="" range="this.turn('range');" for="" (page="range[0];" page<="range[1];" page++)="" turnmethods._addpage.call(this,="" page);="" },="" returns="" a="" of="" pages="" that="" should="" be="" in="" the="" dom="" example:="" -="" page="" current="" view,="" return="" true="" *="" is="" range,="" otherwise,="" false="" 2-3="" 4-5="" 6-7="" 8-9="" 10-11="" 12-13="" **="" --="" range:="" function(page)="" {="" var="" remainingpages,="" left,="" right,="" data="this.data();" ||="" data.tpage="" data.page="" 1;="" view="turnMethods._view.call(this," if="" (page<1="">data.totalPages)
        throw turnError('"'+page+'" is not a page for range');
    
      view[1] = view[1] || view[0];
      
      if (view[0]>=1 && view[1]<=data.totalpages) {="" remainingpages="Math.floor((pagesInDOM-2)/2);" if="" (data.totalpages-view[1]=""> view[0]) {
          left = Math.min(view[0]-1, remainingPages);
          right = 2*remainingPages-left;
        } else {
          right = Math.min(data.totalPages-view[1], remainingPages);
          left = 2*remainingPages-right;
        }

      } else {
        left = pagesInDOM-1;
        right = pagesInDOM-1;
      }

      return [Math.max(1, view[0]-left),
          Math.min(data.totalPages, view[1]+right)];

  },

  // Detects if a page is within the range of `pagesInDOM` from the current view

  _necessPage: function(page) {
    
    if (page===0)
      return true;

    var data = this.data(),
      range = this.turn('range');

    return data.pageObjs[page].hasClass('fixed') ||
      (page>=range[0] && page<=range[1]); },="" releases="" memory="" by="" removing="" pages="" from="" the="" dom="" _removefromdom:="" function()="" {="" var="" page,="" data="this.data();" for="" (page="" in="" data.pagewrap)="" if="" (has(page,="" &&="" !turnmethods._necesspage.call(this,="" page))="" turnmethods._removepagefromdom.call(this,="" page);="" removes="" a="" page="" and="" its="" internal="" references="" _removepagefromdom:="" function(page)="" (data.pages[page])="" dd="data.pages[page].data();" flipmethods._movefoldingpage.call(data.pages[page],="" false);="" (dd.f="" dd.f.fwrapper)="" dd.f.fwrapper.remove();="" data.pages[page].removedata();="" data.pages[page].remove();="" delete="" data.pages[page];="" }="" (data.pageobjs[page])="" data.pageobjs[page].remove();="" (data.pagewrap[page])="" data.pagewrap[page].remove();="" data.pagewrap[page];="" data.pageplace[page];="" removepage:="" (page<1="" ||="">data.totalPages)
      throw turnError('The page '+ page + ' doesn\'t exist');
      
    if (data.pageObjs[page]) {

      // Stop animations
      this.turn('stop');

      // Remove `page`
      turnMethods._removePageFromDOM.call(this, page);
      delete data.pageObjs[page];

    }

    // Move the pages behind `page`
    turnMethods._movePages.call(this, page, -1);

    // Resize the size of this flipbook
    data.totalPages = data.totalPages-1;

    // Check the current view

    if (data.page>data.totalPages)
      this.turn('page', data.totalPages);
    else
      turnMethods._makeRange.call(this);

    return this;
  
  },

  // Moves pages

  _movePages: function(from, change) {

    var page,
      that = this,
      data = this.data(),
      single = data.display=='single',
      move = function(page) {

        var next = page + change,
          odd = next%2,
          className = (odd) ? ' odd ' : ' even ';

        if (data.pageObjs[page])
          data.pageObjs[next] = data.pageObjs[page]
            .removeClass('p' + page + ' odd even')
            .addClass('p' + next + className);

        if (data.pagePlace[page] && data.pageWrap[page]) {
          data.pagePlace[next] = next;
        
        if (data.pageObjs[next].hasClass('fixed'))
          data.pageWrap[next] = data.pageWrap[page]
            .attr('page', next);
        else
          data.pageWrap[next] = data.pageWrap[page].
            css(turnMethods._pageSize.call(that, next, true)).
            attr('page', next);
    
          if (data.pages[page])
            data.pages[next] = data.pages[page]
              .flip('options', {
                page: next,
                next: (single || odd) ? next+1 : next-1,
                corners: (single) ? 'all' :
                  ((odd) ? 'forward' : 'backward')
              });

          if (change) {
            delete data.pages[page];
            delete data.pagePlace[page];
            delete data.pageObjs[page];
            delete data.pageWrap[page];
            delete data.pageObjs[page];
          }
      }
    };

    if (change>0)
      for (page=data.totalPages; page>=from; page--)
        move(page);
    else
      for (page=from; page<=data.totalpages; page++)="" move(page);="" },="" sets="" or="" gets="" the="" display="" mode="" display:="" function(display)="" {="" var="" data="this.data()," currentdisplay="data.display;" if="" (display)="" ($.inarray(display,="" displays)="=-1)" throw="" turnerror('"'+display="" +="" '"="" is="" not="" a="" value="" for="" display');="" (display="='single')" (!data.pageobjs[0])="" this.turn('stop').="" css({'overflow':="" 'hidden'});="" data.pageobjs[0]="$('<div">',
              {'class': 'page p-temporal'}).
            css({width: this.width(), height: this.height()}).
            appendTo(this);

        }
      } else {
        if (data.pageObjs[0]) {
          this.turn('stop').css({'overflow': ''});
          data.pageObjs[0].remove();
          delete data.pageObjs[0];
        }
      }

      data.display = display;

      if (currentDisplay) {
        var size = this.turn('size');
        turnMethods._movePages.call(this, 1, 0);
        this.turn('size', size.width, size.height).
          turn('update');
      }

      return this;

    } else
      return currentDisplay;
  
  },

  // Gets and sets the direction of the flipbook

  direction: function(dir) {

    var data = this.data();

    if (typeof(dir)=='undefined') {

      return data.direction;

    } else {

      dir = dir.toLowerCase();

      if ($.inArray(dir, directions)==-1)
        throw turnError('"' + dir + '" is not a value for direction');

      if (dir=='rtl') {
        $(this).attr('dir', 'ltr').
          css({direction: 'ltr'});
      }

      data.direction = dir;

      if (data.done)
        this.turn('size', $(this).width(), $(this).height());

      return this;
    }

  },

  // Detects if the pages are being animated

  animating: function() {

    return this.data().pageMv.length>0;

  },

  // Disables and enables the effect

  disable: function(bool) {

    var page,
      data = this.data(),
      view = this.turn('view');

      data.disabled = bool===undefined || bool===true;

    for (page in data.pages)
      if (has(page, data.pages))
        data.pages[page].flip('disable', (bool) ? $.inArray(page, view) : false);

    return this;

  },

  // Disables and enables the effect

  disabled: function(disable) {

    if (disable===undefined) {
      return this.data().disabled===true;
    } else {
      return this.turn('disable', disable);
    }

  },

  // Gets and sets the size

  size: function(width, height) {

    if (width && height) {

      var page, prop,
        data = this.data(),
        pageWidth = (data.display=='double') ? width/2 : width;

      this.css({width: width, height: height});

      if (data.pageObjs[0])
        data.pageObjs[0].css({width: pageWidth, height: height});
      
      for (page in data.pageWrap) {
        if (!has(page, data.pageWrap)) continue;

        prop = turnMethods._pageSize.call(this, page, true);

        data.pageObjs[page].css({width: prop.width, height: prop.height});
        data.pageWrap[page].css(prop);

        if (data.pages[page])
          data.pages[page].css({width: prop.width, height: prop.height});
      }

      this.turn('resize');

      return this;

    } else {
      
      return {width: this.width(), height: this.height()};

    }
  },

  // Resizes each page

  resize: function() {

    var page, data = this.data();

    if (data.pages[0]) {
      data.pageWrap[0].css({left: -this.width()});
      data.pages[0].flip('resize', true);
    }

    for (page = 1; page <= data.totalpages;="" page++)="" if="" (data.pages[page])="" data.pages[page].flip('resize',="" true);="" },="" removes="" an="" animation="" from="" the="" cache="" _removemv:="" function(page)="" {="" var="" i,="" data="this.data();" for="" (i="0;" i<data.pagemv.length;="" i++)="" (data.pagemv[i]="=page)" data.pagemv.splice(i,="" 1);="" return="" true;="" }="" false;="" adds="" to="" _addmv:="" turnmethods._removemv.call(this,="" page);="" data.pagemv.push(page);="" gets="" indexes="" a="" view="" _view:="" page="page" ||="" data.page;="" (data.display="='double')" (page%2)="" ?="" [page-1,="" page]="" :="" [page,="" page+1];="" else="" [page];="" view:="" [(view[0]="">0) ? view[0] : 0,
        (view[1]<=data.totalpages) ?="" view[1]="" :="" 0];="" else="" return="" [(view[0]="">0 && view[0]<=data.totalpages) ?="" view[0]="" :="" 0];="" },="" stops="" animations="" stop:="" function(ignore,="" animate)="" {="" if="" (this.turn('animating'))="" var="" i,="" opts,="" page,="" data="this.data()," pages="data.pageMv;" data.pagemv="[];" (data.tpage)="" data.page="data.tpage;" delete="" data['tpage'];="" }="" for="" (i="0;" i<pages.length;="" i++)="" page="data.pages[pages[i]];" opts="page.data().f.opts;" page.flip('hidefoldedpage',="" false);="" flipmethods._movefoldingpage.call(page,="" data.pageplace[opts.next]="opts.next;" (opts.force)="" opts.next="(opts.page%2===0)" opts.page-1="" opts.page+1;="" opts['force'];="" this.turn('update');="" return="" this;="" gets="" and="" sets="" the="" number="" of="" pages:="" function(pages)="" (pages)="" (pages<data.totalpages)="" (var="" page<="data.totalPages;" page++)="" this.turn('removepage',="" page);="" (this.turn('page')="">pages)
          this.turn('page', pages);
      }

      data.totalPages = pages;

      return this;
    } else
      return data.totalPages;

  },

  // Checks missing pages

  _missing : function(page) {
    
    var p,
      data = this.data(),
      range = this.turn('range', page),
      missing = [];

    for (p = range[0]; p<=range[1]; p++)="" {="" if="" (!data.pageobjs[p])="" missing.push(p);="" }="" (missing.length="">0)
      this.trigger('missing', [missing]);
    
  },

  // Sets a page without effect

  _fitPage: function(page) {

    var data = this.data(),
      newView = this.turn('view', page);
    
    turnMethods._missing.call(this, page);

    if (!data.pageObjs[page])
      return;

    data.page = page;

    this.turn('stop');
    turnMethods._removeFromDOM.call(this);
    turnMethods._makeRange.call(this);
    turnMethods._updateShadow.call(this);
    this.trigger('turned', [page, newView]);

    if (data.opts.autoCenter)
      this.turn('center');

  },
  
  // Turns to a page

  _turnPage: function(page, fromMouseAction) {

    var current, next,
      data = this.data(),
      place = data.pagePlace[page],
      view = this.turn('view'),
      newView = this.turn('view', page);
  
    if (data.page!=page) {

      var event = $.Event('turning');
      this.trigger(event, [page, newView]);

      if (event.isDefaultPrevented())
        return;

      if ($.inArray(1, newView)!=-1)
        this.trigger('first');
      if ($.inArray(data.totalPages, newView)!=-1)
        this.trigger('last');

    }



    if (fromMouseAction) {

      this.turn('stop', place);

    } else {

      turnMethods._missing.call(this, page);
      
      if (!data.pageObjs[page])
        return;

      this.turn('stop');
      data.page = page;
    }
    

    turnMethods._makeRange.call(this);

    if (data.display=='single') {
      current = view[0];
      next = newView[0];
    } else if (view[1] && page>view[1]) {
      current = view[1];
      next = newView[0];
    } else if (view[0] && page<view[0]) {="" current="view[0];" next="newView[1];" }="" if="" (data.pages[current])="" var="" opts="data.pages[current].data().f.opts;" data.tpage="next;" (opts.next!="next)" opts.next="next;" data.pageplace[next]="opts.page;" opts.force="true;" (data.display="='single')" (data.direction="='ltr')" data.pages[current].flip('turnpage',="" (newview[0]=""> view[0]) ? 'r' : 'l');
        } else {
          data.pages[current].flip('turnPage',
            (newView[0] > view[0]) ? 'l' : 'r');
        }

      } else {
        
        data.pages[current].flip('turnPage');

      }
    }

  },

  // Gets and sets a page

  page: function(page) {

    page = parseInt(page, 10);

    var data = this.data();

    if (page>0 && page<=data.totalpages) {="" if="" (!data.done="" ||="" $.inarray(page,="" this.turn('view'))!="-1)" turnmethods._fitpage.call(this,="" page);="" else="" turnmethods._turnpage.call(this,="" return="" this;="" }="" data.page;="" },="" turns="" to="" the="" next="" view="" next:="" function()="" this.turn('page',="" turnmethods._view.call(this,="" this.data().page).pop()="" +="" 1);="" previous="" previous:="" this.data().page).shift()="" -="" peel:="" function(corner,="" animate)="" adds="" a="" motion="" internal="" list="" this="" event="" is="" called="" in="" context="" of="" flip="" _addmotionpage:="" var="" opts="$(this).data().f.opts," turn="opts.turn," dd="turn.data();" turnmethods._addmv.call(turn,="" opts.page);="" dd.pageplace[opts.next]="opts.page;" turn.turn('update');="" _start:="" function(e,="" opts,="" corner)="" data="opts.turn.data();" (e.isdefaultprevented())="" turnmethods._updateshadow.call(opts.turn);="" return;="" (data.display="='single'" &&="" ((corner="='l'" data.direction="='ltr')" (corner="='r'" opts.next="(opts.next<opts.page)" ?="" :="" opts.page-1;="" opts.force="true;">opts.page) ? opts.next : opts.page+1;

      }

    }

    turnMethods._addMotionPage.call(e.target);
    turnMethods._updateShadow.call(opts.turn);
  },

  // This event is called in context of flip

  _end: function(e, opts, turned) {

    var that = $(e.target),
      data = that.data().f,
      turn = opts.turn,
      dd = turn.data();

    if (turned || dd.tpage) {

      if (dd.tpage==opts.next || dd.tpage==opts.page) {
        delete dd['tpage'];
        turnMethods._fitPage.call(turn, dd.tpage || opts.next, true);
      }

    } else {

      turnMethods._removeMv.call(turn, opts.page);
      turnMethods._updateShadow.call(turn);
      turn.turn('update');

    }
    
  },
  
  // This event is called in context of flip

  _pressed: function(e) {

    e.stopPropagation();

    var page,
      data = $(e.target).data().f,
      pages = data.opts.turn.data().pages;

    for (page in pages)
      if (page!=data.opts.page)
        pages[page].flip('disable', true);

    return data.time = new Date().getTime();

  },

  // This event is called in context of flip

  _released: function(e, point) {

    e.stopPropagation();

    var outArea,
      page = $(e.target),
      data = page.data().f,
      turn = data.opts.turn,
      turnData = turn.data();
    
    if (turnData.display=='single') {
      outArea = (point.corner=='r') ?
        point.x<page.width() 2:="" point.x="">page.width()/2;
    } else {
      outArea = point.x<0 ||="" point.x="">page.width();
    }

    if ((new Date()).getTime()-data.time<200 ||="" outarea)="" {="" e.preventdefault();="" turnmethods._turnpage.call(="" turn,="" data.opts.next,="" flipmethods._corneractivated.call(page,="" point,="" 1)="==" false="" );="" }="" turndata.mouseaction="false;" },="" this="" event="" is="" called="" in="" context="" of="" flip="" _flip:="" function(e)="" e.stoppropagation();="" var="" opts="$(e.target).data().f.opts;" opts.turn.trigger('turn',="" [opts.next]);="" if="" (opts.turn.data().opts.autocenter)="" opts.turn.turn('center',="" opts.next);="" calculate="" the="" z-index="" value="" for="" pages="" during="" animation="" calculatez:="" function(mv)="" i,="" page,="" nextpage,="" placepage,="" dpage,="" that="this," data="this.data()," view="this.turn('view')," currentpage="view[0]" view[1],="" r="{pageZ:" {},="" partz:="" pagev:="" {}},="" addview="function(page)" page);="" (view[0])="" r.pagev[view[0]]="true;" (view[1])="" r.pagev[view[1]]="true;" };="" (i="0;" i<mv.length;="" i++)="" page="mv[i];" nextpage="data.pages[page].data().f.opts.next;" placepage="data.pagePlace[page];" addview(page);="" addview(nextpage);="" dpage="(data.pagePlace[nextPage]==nextPage)" ?="" :="" page;="" r.pagez[dpage]="data.totalPages" -="" math.abs(currentpage-dpage);="" r.partz[placepage]="data.totalPages*2" +="" return="" r;="" updates="" and="" display="" property="" every="" update:="" function()="" (data.pagemv.length="" &&="" data.pagemv[0]!="=0)" update="" motion="" p,="" fixed,="" pos="this.turn('calculateZ'," data.pagemv),="" data.tpage);="" (page="" data.pagewrap)="" (!has(page,="" data.pagewrap))="" continue;="" fixed="data.pageObjs[page].hasClass('fixed');" data.pagewrap[page].css({="" display:="" (pos.pagev[page]="" fixed)="" ''="" 'none',="" 'z-index':="" pos.pagez[page]="" ((fixed)="" -1="" 0)="" });="" ((p="data.pages[page]))" p.flip('z',="" pos.partz[page]="" null);="" (pos.pagev[page])="" p.flip('resize');="" (data.tpage)="" p.flip('disable',="" true);="" data.disabled="" page!="apage" else="" static="" pagelocation="turnMethods._setPageLoc.call(this," (data.pages[page])="" data.pages[page].flip('disable',="" pagelocation!="1).flip('z'," position="" size="" flipbook's="" shadow="" _updateshadow:="" view,="" view2,="" shadow,="" width="this.width()," height="this.height()," pagewidth="(data.display=='single')" 2;="" (!data.shadow)="" data.shadow="$('<div">',
      {
        'class': 'shadow',
        'css': divAtt(0, 0, 0).css
      }).
      appendTo(this);
    }

    for (var i = 0; i<data.pagemv.length; 0="" 1="" 2="" i++)="" {="" if="" (!view[0]="" ||="" !view[1])="" break;="" view="this.turn('view'," data.pages[data.pagemv[i]].data().f.opts.next);="" view2="this.turn('view'," data.pagemv[i]);="" view[0]="view[0]" &&="" view2[0];="" view[1]="view[1]" view2[1];="" }="" (!view[0])="" shadow="(data.direction=='ltr')" ?="" :="" 2;="" else="" (!view[1])="" 1;="" switch="" (shadow)="" case="" 1:="" data.shadow.css({="" width:="" pagewidth,="" height:="" height,="" top:="" 0,="" left:="" pagewidth="" });="" 2:="" 3:="" width,="" },="" sets="" the="" z-index="" and="" display="" property="" of="" a="" page="" it="" depends="" on="" current="" _setpageloc:="" function(page)="" var="" data="this.data()," (page="=view[0]" data.pagewrap[page].css({zindex:="" data.totalpages,="" display:="" ''});="" return="" ((data.display="='single'" (data.display="='double'" data.totalpages-1,="" (data.pageobjs[page].hasclass('fixed'))="" ''="" 'none'}="" );="" 0;="" gets="" options="" options:="" function(options)="" (options="==undefined)" this.data().opts;="" set="" new="" values="" $.extend(data.opts,="" options);="" pages="" (options.pages)="" this.turn('pages',="" options.pages);="" (options.page)="" this.turn('page',="" options.page);="" (options.display)="" this.turn('display',="" options.display);="" direction="" (options.direction)="" this.turn('direction',="" options.direction);="" size="" (options.width="" options.height)="" this.turn('size',="" options.width,="" options.height);="" add="" event="" listeners="" (options.when)="" for="" (var="" eventname="" in="" options.when)="" (has(eventname,="" options.when))="" this.unbind(eventname).="" bind(eventname,="" options.when[eventname]);="" this;="" version="" version:="" function()="" version;="" methods="" properties="" flip="" effect="" flipmethods="{" constructor="" init:="" function(opts)="" this.data({f:="" {effect:="" (opts.corners="='r'" opts.corners="='l')" 'hard'="" 'sheet'}}="" this.flip('options',="" opts);="" flipmethods._addpagewrapper.call(this);="" setdata:="" function(d)="" data.f="$.extend(data.f," d);="" (opts)="" flipmethods.setdata.call(this,="" {opts:="" $.extend({},="" data.opts="" flipoptions,="" opts)});="" data.opts;="" z:="" function(z)="" (data.fwrapper)="" data.opts['z-index']="z;" data.fwrapper.css(="" {'z-index':="" z="" parseint(data.parent.css('z-index'),="" 10)="" 0}="" _callowed:="" turndata="data.opts.turn.data()," odd="page%2;" (turndata.display="='single')" (turndata.direction="='ltr')" corners['forward']="" corners['backward'];="" corners['backward']="" corners['forward'];="" corners['all'];="" corners[(odd)="" 'forward'="" 'backward']="" 'backward'="" 'forward'];="" _corneractivated:="" function(e)="" pos="data.parent.offset()," width="this.width()," height="this.height()," c="{x:" math.max(0,="" e.pagex-pos.left),="" y:="" e.pagey-pos.top)},="" csz="data.opts.cornerSize;" (c.x<="0" c.y<="0" c.x="">=width || c.y>=height)
      return false;

    var allowedCorners = flipMethods._cAllowed.call(this);

    if (c.x>width-csz)
      c.corner = 'r';
    else if (c.x<csz) c.corner="l" ;="" else="" return="" false;="" ($.inarray(c.corner,="" allowedcorners)="=-1)" ?="" false="" :="" c;="" },="" _c:="" function(corner,="" opts)="" {="" opts="opts" ||="" 0;="" switch="" (corner)="" case="" 'l':="" point2d(opts,="" 0);="" 'r':="" point2d(this.width()-opts,="" }="" _c2:="" function(corner)="" point2d(this.width()*2,="" point2d(-this.width(),="" _foldingpage:="" var="" data="this.data().f," if="" (data.folding)="" data.folding;="" if(opts.turn)="" (data.display="=" 'single')="" (data.pageobjs[opts.next])="" data.pageobjs[0]="" null;="" data.pageobjs[opts.next];="" _backgradient:="" function()="" turn="data.opts.turn," gradient="data.opts.gradients" &&="" (!turn="" turn.data().display="='single'" (data.opts.page!="2" data.opts.page!="turn.data().totalPages-1));" gradient;="" resize:="" function(full)="" width="this.width()," height="this.height();" (full)="" data.wrapper.css({width:="" width,="" height:="" height});="" data.fpage.css({width:="" prepares="" the="" page="" by="" adding="" a="" general="" wrapper="" and="" another="" objects="" _addpagewrapper:="" att,="" parent="this.parent();" data.parent="parent;" (!data.wrapper)="" cssproperties="{};" data.wrapper="$('<div/">', divAtt(0, 0, 2)).
        css(cssProperties).
        appendTo(parent).
        prepend(this);

      data.fpage = $('<div>', divAtt(0, 0, 1)).
        css(cssProperties).
        appendTo(parent);

    }

    // Set size
    flipMethods.resize.call(this, true);

  },

  // Takes a 2P point from the screen and applies the transformation

  _fold: function(point) {

    var data = this.data().f,
      o = flipMethods._c.call(this, point.corner),
      relX = (o.x) ? o.x - point.x :  point.x,
      width = this.width(),
      height = this.height();

      relX = Math.min(width*2, Math.max(0, relX));


      switch(point.corner) {
        case 'r' :
          data.wrapper.css({
            width: Math.max(0, width-relX)
          });
          this.css({
            position: 'relative',
            left: -relX
          });

          data.fpage.css({
            left: -relX + width,
            width: Math.max(0, relX-width)
          });
        break;
        case 'l' :

          data.wrapper.css({
            width: width
          });
          this.css({
            position: 'relative',
            left: relX
          });

          data.fpage.css({
            left: width,
            width: Math.max(0, relX-width)
          });

          if (data.folding)
            data.folding.css({
              position: 'relative',
              left: -width*2 + relX
            });
        
        break;
      }

      data.parent.css({'overflow': 'visible'});

    data.point = point;
  
  },

  _moveFoldingPage: function(bool) {

    var data = this.data().f;
      
    if (bool) {
      
      var folding = flipMethods._foldingPage.call(this),
        turn = data.opts.turn;
      
      if (folding) {

        if (data.folding) {
          if (data.folding===folding)
            return;
          flipMethods._moveFoldingPage.call(this, false);
        }
      
        flipMethods.setData.call(this,
          {backParent: folding.parent(),
          folding: folding});

        data.fpage.prepend(folding);

      }

      turn.turn('update');

    } else {
      if (data.backParent) {
        data.backParent.prepend(data.folding);
        delete data.backParent;
        delete data.folding;
      }
    }
  },

  _showFoldedPage: function(c, animate) {

    var folding = flipMethods._foldingPage.call(this),
      dd = this.data(),
      data = dd.f,
      visible = data.visible;

    if (!visible || !data.point || data.point.corner!=c.corner) {
      
      var mAction = data.opts.turn.data().mouseAction;

      var event = $.Event('start');
      this.trigger(event, [data.opts, c.corner]);
      visible = false;

      if (event.isDefaultPrevented())
        return false;

    }

    if (folding) {

      if (animate) {
        
        var that = this,
          point = (data.point && data.point.corner==c.corner) ?
          data.point : flipMethods._c.call(this, c.corner, 1);
      
        this.animatef({from: [point.x, point.y],
          to: [c.x, c.y],
          duration: 500,
          frame: function(v) {
            c.x = Math.round(v[0]);
            c.y = Math.round(v[1]);
            flipMethods._fold.call(that, c);
          }});

      } else  {

        flipMethods._fold.call(this, c);
        if (dd.effect && !dd.effect.turning)
          this.animatef(false);

      }

      if (!visible) {

        data.visible = true;
        flipMethods._moveFoldingPage.call(this, true);
        data.fpage.show();
      }

      return true;
    }

    return false;
  },

  hide: function() {

    var data = this.data().f,
      folding = flipMethods._foldingPage.call(this);

    this.css({
      position: '',
      left: 'auto'
    });

    data.wrapper.css({
      width: this.width()
    });

    data.fpage.css({
      width: this.width()
    });

    if (data.folding)
      data.folding.css({
        position: '',
        left: 'auto'
      });

    data.fpage.hide();

    data.visible = false;

    return this;
  },

  hideFoldedPage: function(animate) {

    var data = this.data().f;

    if (!data.point) return;

    var that = this,
      p1 = data.point,
      hide = function() {
        data.point = null;
        that.flip('hide');
        that.trigger('end', [data.opts, false]);
      };

    if (animate) {
      var p4 = flipMethods._c.call(this, p1.corner),
        top = (p1.corner.substr(0,1)=='t'),
        delta = (top) ? Math.min(0, p1.y-p4.y)/2 : Math.max(0, p1.y-p4.y)/2,
        p2 = point2D(p1.x, p1.y+delta),
        p3 = point2D(p4.x, p4.y-delta);
    
      this.animatef({
        from: 0,
        to: 1,
        frame: function(v) {
          var np = bezier(p1, p2, p3, p4, v);
          p1.x = np.x;
          p1.y = np.y;
          flipMethods._fold.call(that, p1);
        },
        complete: hide,
        duration: 800,
        hiding: true
        });

    } else {
      this.animatef(false);
      hide();
    }
  },

  turnPage: function(corner) {

    var that = this,
      data = this.data().f;

    corner = {corner: (data.corner) ?
      data.corner.corner :
      corner || flipMethods._cAllowed.call(this)[0]};

    var p1 = data.point ||
      flipMethods._c.call(this,
        corner.corner,
        (data.opts.turn) ? data.opts.turn.data().opts.elevation : 0),
      p4 = flipMethods._c2.call(this, corner.corner);

      this.trigger('flip').
        animatef({
          from: 0,
          to: 1,
          frame: function(v) {
            var np = bezier(p1, p1, p4, p4, v);
            corner.x = np.x;
            corner.y = np.y;

            flipMethods._showFoldedPage.call(that, corner);
          },
          
          complete: function() {
            that.trigger('end', [data.opts, true]);
          },
          duration: data.opts.duration,
          turning: true
        });

      data.corner = null;
  },

  moving: function() {

    return 'effect' in this.data();
  
  },

  isTurning: function() {

    return this.flip('moving') && this.data().effect.turning;
  
  },

  _eventStart: function(e) {

    var data = this.data().f;

    if (!data.disabled && !this.flip('isTurning')) {

      data.corner = flipMethods._cornerActivated.call(this, e);
    
      if (data.corner && flipMethods._foldingPage.call(this, data.corner)) {
      
        if (flipMethods._showFoldedPage.call(this, data.corner))
          this.trigger('pressed', [data.point]);

        return false;

      } else
        data.corner = null;

    }

  },

  _eventMove: function(e) {

    var data = this.data().f;

    if (!data.disabled) {

      e = (isTouch) ? e.originalEvent.touches : [e];
    
      if (data.corner) {

        var pos = data.parent.offset();
        data.corner.x = e[0].pageX-pos.left;
        data.corner.y = e[0].pageY-pos.top;
        flipMethods._showFoldedPage.call(this, data.corner);

      } else if (!this.data().effect && this.is(':visible')) {
    

        var corner = flipMethods._cornerActivated.call(this, e[0]);

        if (corner) {
          var origin = flipMethods._c.call(this, corner.corner, data.opts.cornerSize/2);
          corner.x = origin.x;
          corner.y = origin.y;
          flipMethods._showFoldedPage.call(this, corner, true);
        } else
          flipMethods.hideFoldedPage.call(this, true);
               

      }
    }
  },

  _eventEnd: function() {

    var data = this.data().f;

    if (!data.disabled && data.point) {
      var event = $.Event('released');
      this.trigger(event, [data.point]);
      if (!event.isDefaultPrevented())
        flipMethods.hideFoldedPage.call(this, true);
    }

    data.corner = null;

  },

  disable: function(disable) {

    flipMethods.setData.call(this, {'disabled': disable});
    return this;

  }
};



// Processes classes

function decorator(that, methods, args) {

  if (!args[0] || typeof(args[0])=='object')
    return methods.init.apply(that, args);

  else if (methods[args[0]])
    return methods[args[0]].apply(that, Array.prototype.slice.call(args, 1));

  else
    throw turnError(args[0] + ' is an invalid value');
}


// Attributes for a layer

function divAtt(top, left, zIndex, overf) {
    
  return {'css': {
        position: 'absolute',
        top: top,
        left: left,
        'overflow': overf || 'hidden',
        'z-index': zIndex || 'auto'
        }
    };
      
}

// Gets a 2D point from a bezier curve of four points

function bezier(p1, p2, p3, p4, t) {

  var a = 1 - t,
    b = a * a * a,
    c = t * t * t;
    
  return point2D(Math.round(b*p1.x + 3*t*a*a*p2.x + 3*t*t*a*p3.x + c*p4.x),
    Math.round(b*p1.y + 3*t*a*a*p2.y + 3*t*t*a*p3.y + c*p4.y));

}

// Gets a 2D point

function point2D(x, y) {
  
  return {x: x, y: y};

}

// Checks if a property belongs to an object

function has(property, object) {
  
  return Object.prototype.hasOwnProperty.call(object, property);

}

// Gets the CSS3 vendor prefix

function getPrefix() {

  var vendorPrefixes = ['Moz','Webkit','Khtml','O','ms'],
  len = vendorPrefixes.length,
  vendor = '';

  while (len--)
    if ((vendorPrefixes[len] + 'Transform') in document.body.style)
      vendor='-'+vendorPrefixes[len].toLowerCase()+'-';

  return vendor;

}

// JS Errors

function turnError(message) {

  function TurnJsError(message) {
    this.name = "TurnJsError";
    this.message = message;
  }

  TurnJsError.prototype = new Error();
  TurnJsError.prototype.constructor = TurnJsError;

  return new TurnJsError(message);
}

// Find the offset of an element discarding its transformation

function findPos(obj) {
  var offset = {top: 0, left: 0};

  do{
    offset.left += obj.offsetLeft;
    offset.top += obj.offsetTop;
  } while ((obj = obj.offsetParent));

  return offset;
}


// Request an animation

window.requestAnim = function(callback) {
  window.setTimeout(callback, 1000 / 60);
}


function emptyFunction() {
  return '';
}


// Extend $.fn

$.extend($.fn, {

  flip: function(req, opts) {
    return decorator(this, flipMethods, arguments);
  },

  turn: function(req) {
    return decorator(this, turnMethods, arguments);
  },

  transform: function(transform, origin) {

    var properties = {};
    
    if (origin)
      properties[vendor+'transform-origin'] = origin;
    
    properties[vendor+'transform'] = transform;
  
    return this.css(properties);

  },

  animatef: function(point) {

    var data = this.data();

    if (data.effect)
      data.effect.stop();

    if (point) {

      if (!point.to.length) point.to = [point.to];
      if (!point.from.length) point.from = [point.from];

      var diff = [],
        len = point.to.length,
        animating = true,
        that = this,
        time = (new Date()).getTime(),
        frame = function() {

          if (!data.effect || !animating)
            return;

          var v = [],
            timeDiff = Math.min(point.duration, (new Date()).getTime() - time);

          for (var i = 0; i < len; i++)
            v.push(data.effect.easing(1, timeDiff, point.from[i], diff[i], point.duration));

          point.frame((len==1) ? v[0] : v);

          if (timeDiff==point.duration) {
            delete data['effect'];
            that.data(data);
            if (point.complete)
              point.complete();
          } else {
            window.requestAnim(frame);
          }
        };

      for (var i = 0; i < len; i++)
        diff.push(point.to[i] - point.from[i]);

      data.effect = $.extend({
        stop: function() {
          animating = false;
        },
        easing: function (x, t, b, c, data) {
          return c * Math.sqrt(1 - (t=t/data-1)*t) + b;
        }
      }, point);

      this.data(data);

      frame();

    } else {
      
      delete data['effect'];

    }
  }
});

// Export some globals

$.isTouch = isTouch;
$.mouseEvents = mouseEvents;
$.cssPrefix = emptyFunction;
$.cssTransitionEnd = emptyFunction;
$.findPos = findPos;

})(jQuery);</div></csz)></data.pagemv.length;></200></0></page.width()></=data.totalpages)></view[0])></=range[1];></=data.totalpages)></=data.totalpages)></=></=data.totalpages;></=range[1]);></=data.totalpages)></1)></0.001></=lastpage)></ch.length;>