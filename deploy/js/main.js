//QLOCK 2014/12/02

/* global $, _ */

var qlock = qlock || {};

qlock.TimerModel = function() {
	"use strict";
	var that = {},
		d = new Date(),
		hh,
		mm,
		ss;

	function update() {
		d = new Date();
		var _hh = d.getHours(),
			_mm = d.getMinutes(),
			_ss = d.getSeconds();
		if(_ss !== ss) {
			$(that).trigger("update", [{
				current:{
					hh:_hh,
					mm:_mm,
					ss:_ss
				},
				past:{
					hh:hh,
					mm:mm,
					ss:ss
				}
			}]);
		}
		hh = _hh;
		mm = _mm;
		ss = _ss;
	}

	that.start = function() {
		// start loop
		(function loop() {
			window.requestAnimationFrame(loop);
			update();
		})();
	};

	return that;
};

qlock.ClockView = function($clock, model) {

	"use strict";

	var that = {},
		$hh = $clock.find("#js-hh"),
		$mm = $clock.find("#js-mm"),
		$ss = $clock.find("#js-ss"),
		$hhInvert = $clock.find("#js-hh-invert"),
		$mmInvert = $clock.find("#js-mm-invert"),
		$ssInvert = $clock.find("#js-ss-invert");

	function construct() {
		$(model).on("update", render);
	}

	function render(e, data) {
		var c = data.current,
			p = data.past;
		renderText($hh, c.hh, p.hh);
		renderText($mm, c.mm, p.mm);
		renderText($ss, c.ss, p.ss);
		renderText($hhInvert, c.hh, p.hh);
		renderText($mmInvert, c.mm, p.mm);
		renderText($ssInvert, c.ss, p.ss);
	}

	function renderText($dom, current, past) {
		if(current !== past) {
			$dom.text(zeroFormat(current, 2));
		}
	}

	function zeroFormat(num, n) {
		var ret = "" + num;
		while(ret.length < n) {
			ret = "0" + ret;
		}
		return ret;
	}

	construct();
	return that;
};

qlock.MaskView = function($window, $container, model) {
	"use strict";
	var $maskA = $("#js-mask-clock"),
		$maskB = $("#js-mask-clock-invert"),
		count = 0;

	function construct() {
		$(model)
			.on("update", function(e, sec) {
				changeView();
			});
	}

	function changeView() {
		switch(++count) {
			case 1:
				changeZ($maskA, 5);
				changeZ($maskB);
				reset($maskA, "width", "100%");
				reset($maskA, "height", "100%");
				reset($maskB, "width", "100%");
				reset($maskB, "height", "100%");
				anim($maskB, "width", "0%");
				break;

			case 2:
				changeZ($maskA);
				changeZ($maskB, 5);
				reset($maskB, "width", "100%");
				reset($maskB, "height", "100%");
				anim($maskA, "height", "0%");
				break;

			case 3:
				changeZ($maskA);
				reset($maskA, "width", "0%");
				reset($maskA, "height", "100%");
				anim($maskA, "width", "100%");
				break;

			case 4:
				changeZ($maskB);
				changeZ($maskA, 5);
				reset($maskB, "width", "100%");
				reset($maskB, "height", "0%");
				anim($maskB, "height", "100%");
				break;

			case 5:
				reset($maskA, "width", "100%");
				reset($maskA, "height", "100%");
				anim($maskB, "width", "0%");
				break;

			case 6:
				changeZ($maskA);
				changeZ($maskB, 5);
				reset($maskB, "width", "100%");
				reset($maskB, "height", "100%");
				anim($maskA, "height", "0%");
				break;

			case 7:
				changeZ($maskB, 5);
				changeZ($maskA);
				reset($maskA, "width", "0%");
				reset($maskA, "height", "100%");
				anim($maskA, "width", "100%");
				break;

			case 8:
				changeZ($maskB);
				changeZ($maskA, 5);
				reset($maskB, "width", "100%");
				reset($maskB, "height", "0%");
				anim($maskB, "height", "100%");
				count = 0;
				break;
			default:
		}

	}

	function anim($mask, key, value) {
		var obj = {},
			time = 500;
		obj[key] = value;
		if(key === "height") {
			time = time / $window.width() * $window.height();
		}
		$mask
			.stop()
			.animate(obj, time, "easeOutExpo");
	}

	function changeZ($current, index) {
		index = index || 10;
		$(".z" + index).removeClass("z" + index);
		$current.addClass("z" + index);
	}

	function reset($mask, key, value) {
		var obj = {};
		obj[key] = value;
		$mask.stop();
		$mask.css(obj);
	}

	construct();

};

// fit window on resize
qlock.ContainerView = function($window, $container) {

	"use strict";

	var $resizeContainer;

	function construct() {
		$resizeContainer = $container.find(".js-full-resize");
		$window
			.resize(_.throttle(resize, 100))
			.trigger("resize");
	}

	function resize() {
		var w = $window.width(),
			h = $window.height();
		$resizeContainer
			.css({
				width:w + "px",
				height:h + "px"
			});
	}

	$(construct);
};


(function() {
	"use strict";
	var $window = $(window),
		$container = $(".container"),
		timerModel = qlock.TimerModel();
	qlock.ContainerView($window, $container);
	qlock.MaskView($window, $container, timerModel);
	qlock.ClockView($(".clock"), timerModel);
	timerModel.start();
})();
