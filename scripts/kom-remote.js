!function e(t,o,n){function i(s,a){if(!o[s]){if(!t[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(r)return r(s,!0);var f=new Error("Cannot find module '"+s+"'");throw f.code="MODULE_NOT_FOUND",f}var d=o[s]={exports:{}};t[s][0].call(d.exports,function(e){var o=t[s][1][e];return i(o?o:e)},d,d.exports,e,t,o,n)}return o[s].exports}for(var r="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(e,t,o){(function(e){"use strict";!function(t,n){var i="object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;if("function"==typeof define&&define.amd)define(["jquery"],function(e){return i[t]=n(i,o,e)});else if("undefined"!=typeof o){var r;try{r="undefined"!=typeof window?window.$:"undefined"!=typeof e?e.$:null}catch(s){}o=n(i,r)}else i[t]=n(i,i.jQuery||i.Zepto||i.ender||i.$)}("Joystick",function(e,t,o){function n(e){return Math.pow(e,2)*(e?0>e?-1:1:0)}function i(e,o){this.$element=e,this.settings=t.extend({},s,o),this._defaults=s,this.init()}var r="joystick",s={radiusMax:80},a=t(document);return i.prototype.init=function(){return this.$element.off("mousedown."+r).on("mousedown."+r,t.proxy(i.prototype.onmousedown,this)),this},i.prototype.move=function(e,t){var o=Math.sqrt(e*e+t*t);if(o>this.settings.radiusMax){var i=e/o,s=t/o;e=Math.round(i*this.settings.radiusMax),t=Math.round(s*this.settings.radiusMax)}return this.$element.css("transform","translate("+e+"px,"+t+"px)"),this.$element.trigger({type:r+":move",x:e,y:t,ratioX:Math.round(n(e)/n(this.settings.radiusMax)*100)/100,ratioY:Math.round(n(t)/n(this.settings.radiusMax)*100)/100}),this},i.prototype.onmousedown=function(e){this.position={x:e.clientX,y:e.clientY},this.$element.css("transition","0s"),a.off("mousemove."+r).on("mousemove."+r,t.proxy(i.prototype.onmousemove,this)),a.off("mouseup."+r).on("mouseup."+r,t.proxy(i.prototype.onmouseup,this))},i.prototype.onmousemove=function(e){var t=e.clientX-this.position.x,o=e.clientY-this.position.y;this.move(t,o)},i.prototype.onmouseup=function(){a.off("mousemove."+r),a.off("mouseup."+r),this.$element.css("transition",""),this.move(0,0)},t.fn[r]=function(e){return this.each(function(){var o=t(this);t.data(o,"plugin_"+r)||t.data(o,"plugin_"+r,new i(o,e))})},i})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(e,t,o){(function(e){"use strict";!function(t,n){var i="object"==typeof self&&self.self==self&&self||"object"==typeof e&&e.global==e&&e;if("function"==typeof define&&define.amd)define(["jquery"],function(e){return i[t]=n(i,o,e)});else if("undefined"!=typeof o){var r;try{r="undefined"!=typeof window?window.$:"undefined"!=typeof e?e.$:null}catch(s){}o=n(i,r)}else i[t]=n(i,i.jQuery||i.Zepto||i.ender||i.$)}("Pad",function(e,t,o){function n(e,o){this.$element=e,this.settings=t.extend({},r,o),this._defaults=r,this.init()}var i="pad",r={},s=t(document);return n.prototype.init=function(){return this.$element.off("mousedown."+i,".pad-arrow").on("mousedown."+i,".pad-arrow",t.proxy(n.prototype.onmousedown,this)),this},n.prototype.onmousedown=function(e){s.off("mouseup."+i).on("mouseup."+i,t.proxy(n.prototype.onmouseup,this));var o=t(e.target).data("direction");return this.$element.trigger({type:i+":pressed",direction:o}),this},n.prototype.onmouseup=function(){s.off("mouseup."+i),this.$element.trigger({type:i+":pressed",direction:"none"})},t.fn[i]=function(e){return this.each(function(){var o=t(this);t.data(o,"plugin_"+i)||t.data(o,"plugin_"+i,new n(o,e))})},n})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],3:[function(e,t,o){(function(t){"use strict";function o(e){function o(){i&&t.clearTimeout(i)}function n(s,a,u,f){o();var d=!1,c=r.linear+u,p=r.radial+f;Math.abs(s-r.linear)<=Math.abs(u)&&(c=s),Math.abs(a-r.radial)<=Math.abs(f)&&(p=a),Math.abs(s-r.linear)<=Math.abs(u)&&Math.abs(a-r.radial)<=Math.abs(f)&&(d=!0),r.linear=c,r.radial=p,e.call("com.azkar.differentialDriveRequest",[c,p]),d||(i=t.setTimeout(function(){n(s,a,u,f)},50))}var i=null,r={linear:0,radial:0};return function(e,t){var o=(e-r.linear)/20,i=(t-r.radial)/10;n(e,t,o,i)}}function n(){}var i="undefined"!=typeof window?window.$:"undefined"!=typeof t?t.$:null;e("./jquery.joystick.js"),e("./jquery.pad.js"),n.prototype=HTMLElement.prototype,n.prototype.destroy=function(){this.$shadow.find(".joystick-stick").off("joystick:move.komremote"),this.$shadow.find(".pad").off("pad:pressed.komremote")},n.prototype.start=function(e){var t=o(e);this.$shadow.find(".joystick-stick").on("joystick:move.komremote",function(e){console.log("joystick [x: "+e.ratioX+", y: "+e.ratioY+"]"),t(-e.ratioY/2,-e.ratioX/2)}),this.$shadow.find(".pad").on("pad:pressed.komremote",function(e){switch(console.log("pad [direction: "+e.direction+"]"),e.direction){case"top":t(-.2,0);break;case"right":t(0,-.2);break;case"bottom":t(.2,0);break;case"left":t(0,.2);break;default:t(0,0)}})},n.prototype.attachedCallback=function(){var e=this;i(function(){var t=e.$shadow=i(e.shadowRoot),o=t.find(".joystick").find(".joystick-stick").joystick().end(),n=t.find(".pad").pad(),r=t.find("input[name=switch-remote]");r.on("change",function(e){o.hide(),n.hide(),"joystick"===e.target.value?o.show():n.show()})})};var r=document.currentScript.ownerDocument;n.prototype.createdCallback=function(){var e=r.querySelector("#kom-remote"),t=document.importNode(e.content,!0);this.createShadowRoot().appendChild(t)};var n=document.registerElement("kom-remote",{prototype:new n})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./jquery.joystick.js":1,"./jquery.pad.js":2}]},{},[3]);