// Sigma.js
// © 2010 Steven Soroka
// Sigma is freely distributable under the terms of the MIT license.
// Portions of Sigma were inspired by underscore.js
//
// @ssoroka

// don't leak to the global scope.
(function() {
  // ------------------------------ Setup --------------------------------
  
  // Establish the root object, "window" in the browser, or "global" on the server.
  var root = this;

  // Save the previous value of the "Σ" variable.
  var oldSigma = root.Σ;

  // Anchor point
  Σ = {};

  // Export the Underscore object for CommonJS.
  if (typeof exports !== 'undefined') {
    exports.Σ = Σ;
    exports.Sigma = Σ;
  }

  // export to global scope
  root.Σ = Σ;
  // root.Ʃ = Σ; // since there's two identical characters (greek's sigma and latin's esh) with different unicode values, support both.
  root.Sigma = Σ;

  Σ.VERSION = '0.0.1';

  // set up a OO-style object wrappers
  // what does "this" refer to here?
  Σ.string_wrapper = function(obj) { this._wrapped = obj; };
  Σ.array_wrapper = function(obj) { this._wrapped = obj; };;
  Σ.date_wrapper = function(obj) { this._wrapped = obj; };;

  Σ.string = function(obj) { return new Σ.string_wrapper(obj); };
  Σ.array = function(obj) { return new Σ.array_wrapper(obj); };
  Σ.date = function(obj) { return new Σ.date_wrapper(obj); };

  // ------------------------ Utility Functions --------------------------
  Σ.async_script_load = function(script_url, a_const, callback){
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = script_url;
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
    if (a_const) {
      Σ.wait_for_const_load(a_const, callback);
    }
  }

  Σ.wait_for_const_load = function(a_const, callback, tries) {
    var max_wait_time = 20000, // ms
        try_every = 100;       // ms
    if (window[a_const]) {
      callback();
    } else {
      if (tries) {
        if (tries < max_wait_time / try_every) {
          setTimeout(function() {
            Σ.wait_for_const_load(a_const, callback, tries || 1);
          }, try_every);
        } else {
          Σ.log("Couldn't load " + a_const + " after waiting " + max_wait_time * 100 + "ms.  Giving up.")
        }
      }
    }
  }

  // benchmark a method. pass a function to call.
  // optionally pass # of times to call the function.  defaults to 1000!
  Σ.benchmark = function(callback, times) {
    var start = Date.now();
    for (i=0; i < (times || 1000); i++) {
      callback();
    }
    var end = Date.now();
    return end - start;
  }

  // a fun (blocking) method for help with benchmarking and what-not (not production).
  // Sleep() is a dangerous method as it literally ties up the processor doing nothing, unlike setTimeout.
  // It's the evil you know. :) I don't suggest sleeping for more than a half a second or so.
  Σ.sleep = function(milliseconds) {
    var start = Date.now();
    for (i=0; i < 1; i) {
      if (Date.now() - start > milliseconds) break;
    }
  }

  Σ.log = function(msg) {
    if (window.console && console.log) {
      console.log(msg)
    }
  }

  // this should move to uri parsing...
  // function host() {
  //   return _(window.location.href.match(/^https?\:\/\/([\w\.]+)(?:\:\d+)?\//)).last();
  // }
  
  // wishlist: require? (non async version?) ??

  // ------------------------ String  Functions --------------------------
  
  // 'ClassName' => 'class_name'
  Σ.string_wrapper.prototype.underscore = function() {
    var str = this._wrapped;
    if (str) {
      var result = '';
      if (Σ.string(str).include('::')) {
        result = Σ.array(str.split('::')).map(function(i) { 
          return Σ.string(i).underscore();
        }).join('/');
      } else {
        Σ.array(str.split('')).each(function(i) {
          if (Σ.string(i).is_lowercase()) {
            result += i
          } else {
            if (result.length > 0) {
              result += '_' + i.toLowerCase();
            } else {
              result += i.toLowerCase();
            }
          }
        });
      }
      return result;
    }
  }

  Σ.string_wrapper.prototype.is_lowercase = function() {
    var str = this._wrapped;
    return str == str.toLowerCase();
  }
  
  Σ.string_wrapper.prototype.include = function(target) {
    return !!this._wrapped.match(target);
  }
  
  // string wishlist: capitalize   chomp   chop   concat   count   crypt   downcase   each_char   each_line   empty?   gsub   hash   include?   index   insert   length   ljust/rpad
  //  match   replace   reverse   rindex   rjust    scan   scanf   size   slice   split   squeeze   strip  sub   to_f   to_i   to_s   tr   upcase  
  
  // ------------------------ Array   Functions --------------------------
  // array to_sentence. to_sentence(['one', 'two', 'three']) reutrns 'one, two, and three'
  Σ.array_wrapper.prototype.to_sentence = function() {
    var arr = this._wrapped;
    var result = '';
    for (var i=0; i < (arr.length - 1); i++) {
      if (result.length > 0)
        result = result + ', ';
      result = result + arr[i];
    }
    if (arr.length > 2) {
      result = result + ', and ';
    } else if (arr.length == 2) {
      result = result + ' and ';
    }
    if (arr.length > 0)
      result = result + arr[arr.length - 1];
    return result;
  }
  
  // The cornerstone, an each implementation.
  // Handles objects implementing forEach, arrays, and raw objects.
  // Delegates to JavaScript 1.6's native forEach if available.
  Σ.array_wrapper.prototype.each = function(iterator, context) {
    var obj = this._wrapped;
    var native_each = Array.prototype.forEach;
    if (native_each && obj.forEach === native_each) {
      obj.forEach(iterator, context);
    } else if (obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) iterator.call(obj[i], i, obj);
    }
    return obj;
  }

  Σ.array_wrapper.prototype.map = function(iterator, context) {
    var obj = this._wrapped;
    var native_map = Array.prototype.map;
    // try {
      if (native_map && obj.map === native_map)
        return obj.map(iterator, context);
      var results = [];
      Σ.array(obj).each(function(i) {
        results.push(iterator.call(value));
      });
    return results;
  }

  // Σ.array_wrapper.prototype.sum = function() {
  //   for (var i = 0,sum = 0; i < this.length; sum += this[i++]);
  //   return sum;
  // }
  
  // array wishlist:  at   compact   delete   delete_at   delete_if   empty   first   flatten   include?   index   insert   last   nitems   pop   push   reject      replace   reverse   select   shift   size   slice      sort   to_s   uniq      unshift   zip
  
  // ------------------------ Date    Functions --------------------------
  // // wrap me up ....
  // function month_name(num) {
  //   switch(num){
  //     case 0: return 'Jan';
  //     case 1: return 'Feb';
  //     case 2: return 'Mar';
  //     case 3: return 'Apr';
  //     case 4: return 'May';
  //     case 5: return 'Jun';
  //     case 6: return 'Jul';
  //     case 7: return 'Aug';
  //     case 8: return 'Sep';
  //     case 9: return 'Oct';
  //     case 10:return 'Nov';
  //     case 11:return 'Dec';
  //   }
  // }
  // 
  // Date.prototype.setISO8601 = function (string) {
  //     var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
  //         "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
  //         "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
  //     var d = string.match(new RegExp(regexp));
  // 
  //     var offset = 0;
  //     var date = new Date(d[1], 0, 1);
  // 
  //     if (d[3]) { date.setMonth(d[3] - 1); }
  //     if (d[5]) { date.setDate(d[5]); }
  //     if (d[7]) { date.setHours(d[7]); }
  //     if (d[8]) { date.setMinutes(d[8]); }
  //     if (d[10]) { date.setSeconds(d[10]); }
  //     if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
  //     if (d[14]) {
  //         offset = (Number(d[16]) * 60) + Number(d[17]);
  //         offset *= ((d[15] == '-') ? 1 : -1);
  //     }
  // 
  //     offset -= date.getTimezoneOffset();
  //     time = (Number(date) + (offset * 60 * 1000));
  //     this.setTime(Number(time));
  // }
  // // Σ.date(Datestr).yesterday()
  // function parse_date(date_str) {
  //   var date = new Date();
  //   date.setISO8601(date_str);
  //   return date;
  // }
  // 
  // function prepend_zeros(min) {
  //   var m = ('' + min)
  //   if (m.length < 2) {
  //     m = '0' + m
  //   }
  //   return m;
  // }
  // 
  // function short_date(date) {
  //   return month_name(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getHours() + ':' + prepend_zeros(date.getMinutes());
  // }
  // 

  // ------------------------ URI     Functions --------------------------
  // ------------------------ Input   Functions --------------------------
  // key code values! helps with custom input.  too mac specific?
  Σ.key_codes = {
    ctrl: 17,
    option: 18,
    command: 224,
    shift: 16,
    caps: 20,
    backspace: 8,
    tab: 9,
    esc: 27,
    del: 46,
    home: 36,
    end: 35,
    pgUp: 33,
    pgDown: 34,
    enter: 13,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    nul: 0,
    f13: 44,
    f14: 145,
    f15: 19
  }
  
})();
