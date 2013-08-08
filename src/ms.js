/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent && typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    /**
     * Optimized for Internet Explorer 10 method to create a new Pointer Event of type `inType`,
     * based on the information in `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */    
    msMakeEvent: function(eventType, inEvent) {

      // create new MSPointerEvent 
      // http://msdn.microsoft.com/en-us/library/ie/hh772103%28v=vs.85%29.aspx
      var e  = document.createEvent('MSPointerEvent');      
      
      // IE provides special method to initialize Pointer Event instance
      // http://msdn.microsoft.com/en-us/library/ie/hh772109%28v=vs.85%29.aspx  
      e.initPointerEvent(eventType, true, true, inEvent.view, inEvent.detail, inEvent.screenX, inEvent.screenY,
          inEvent.clientX, inEvent.clientY, inEvent.ctrlKey, inEvent.altKey, inEvent.shiftKey, inEvent.metaKey,
          inEvent.button, inEvent.relatedTarget, inEvent.offsetX, inEvent.offsetY, inEvent.width, inEvent.height,
          inEvent.pressure, inEvent.rotation, inEvent.tiltX, inEvent.tiltY, inEvent.pointerId, inEvent.pointerType,
          inEvent.hwTimestamp, inEvent.isPrimary);
      
      if (HAS_BITMAP_TYPE) {
        // override pointerType property to be specifiation compliant
        Object.defineProperty(e, "pointerType", {get: function(){ return  POINTER_TYPES[evt.pointerType]}, enumerable: true});
      }

      return e;
    },
    cleanup: function(id) {
      pointermap.delete(id);
    },
    MSPointerDown: function(inEvent) {
      pointermap.set(inEvent.pointerId, inEvent);
      var e = this.msMakeEvent('pointerdown', inEvent);
      inEvent.target.dispatchEvent(e);      
    },
    MSPointerMove: function(inEvent) {
      var e = this.msMakeEvent('pointermove', inEvent);
      inEvent.target.dispatchEvent(e);;
    },
    MSPointerUp: function(inEvent) {
      var e = this.msMakeEvent('pointerup', inEvent);
      inEvent.target.dispatchEvent(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      // TODO not exact replacement, see dispatcher.leaveOut method
      var e = this.msMakeEvent('pointerleave', inEvent);
      inEvent.target.dispatchEvent(e);
    },
    MSPointerOver: function(inEvent) {
      // TODO not exact replacement, see dispatcher.enterOver method
      var e = this.msMakeEvent('pointerenter', inEvent);
      inEvent.target.dispatchEvent(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.msMakeEvent('pointercancel', inEvent);
      inEvent.target.dispatchEvent(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = this.msMakeEvent('lostpointercapture', inEvent);
      inEvent.target.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = this.msMakeEvent('gotpointercapture', inEvent);
      inEvent.target.dispatchEvent(e);
    }
  };

  scope.msEvents = msEvents;
})(window.PointerEventsPolyfill);