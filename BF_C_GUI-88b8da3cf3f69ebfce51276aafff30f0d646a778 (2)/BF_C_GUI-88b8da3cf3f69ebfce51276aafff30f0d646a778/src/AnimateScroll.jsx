let _extends = Object.assign ||
    function (target) {
        for (let i = 1; i < arguments.length; i++) {
            let source = arguments[i];
            for (let key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key]; }
            }
        } return target;
    }

let events = ['mousedown', 'mousewheel', 'touchmove', 'keydown'];

let Events = {
    registered: {},
    scrollEvent: {
        register: function register(evtName, callback) {
            Events.registered[evtName] = callback;
        },
        remove: function remove(evtName) {
            Events.registered[evtName] = null;
        }
    }
};

let subscribe = function subscribe(cancelEvent) {
    return typeof document !== 'undefined' && events.forEach(function (event) {
        return (0, addPassiveEventListener)(document, event, cancelEvent);
    });
};

let functionWrapper = function functionWrapper(value) {
    return typeof value === 'function' ? value : function () {
        return value;
    };
};

let smoothAnimation = {
    defaultEasing: function defaultEasing(x) {
        if (x < 0.5) {
            return Math.pow(x * 2, 2) / 2;
        }
        return 1 - Math.pow((1 - x) * 2, 2) / 2;
    },
    /*
     * https://gist.github.com/gre/1650294
     */
    // no easing, no acceleration
    linear: function linear(x) {
        return x;
    },
    // accelerating from zero velocity
    easeInQuad: function easeInQuad(x) {
        return x * x;
    },
    // decelerating to zero velocity
    easeOutQuad: function easeOutQuad(x) {
        return x * (2 - x);
    },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function easeInOutQuad(x) {
        return x < .5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    },
    // accelerating from zero velocity
    easeInCubic: function easeInCubic(x) {
        return x * x * x;
    },
    // decelerating to zero velocity π
    easeOutCubic: function easeOutCubic(x) {
        return --x * x * x + 1;
    },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function easeInOutCubic(x) {
        return x < .5 ? 4 * x * x * x : (x - 1) * (2 * x - 2) * (2 * x - 2) + 1;
    },
    // accelerating from zero velocity
    easeInQuart: function easeInQuart(x) {
        return x * x * x * x;
    },
    // decelerating to zero velocity
    easeOutQuart: function easeOutQuart(x) {
        return 1 - --x * x * x * x;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function easeInOutQuart(x) {
        return x < .5 ? 8 * x * x * x * x : 1 - 8 * --x * x * x * x;
    },
    // accelerating from zero velocity
    easeInQuint: function easeInQuint(x) {
        return x * x * x * x * x;
    },
    // decelerating to zero velocity
    easeOutQuint: function easeOutQuint(x) {
        return 1 + --x * x * x * x * x;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function easeInOutQuint(x) {
        return x < .5 ? 16 * x * x * x * x * x : 1 + 16 * --x * x * x * x * x;
    }
};

let getAnimationType = function getAnimationType(options) {
    return smoothAnimation[options.smooth] || smoothAnimation.defaultEasing;
};

let currentWindowProperties = function currentWindowProperties() {
    if (typeof window !== 'undefined') {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    }
};

let requestAnimationFrameHelper = function () {
    return currentWindowProperties() || function (callback, element, delay) {
        window.setTimeout(callback, delay || 1000 / 60, new Date().getTime());
    };
}();

let addPassiveEventListener = function addPassiveEventListener(target, eventName, listener) {
    let supportsPassiveOption = function () {
        let supportsPassiveOption = false;
        try {
            let opts = Object.defineProperty({}, 'passive', {
                get: function get() {
                    supportsPassiveOption = true;
                }
            });
            window.addEventListener('test', null, opts);
        } catch (e) {}
        return supportsPassiveOption;
    }();
    target.addEventListener(eventName, listener, supportsPassiveOption ? { passive: true } : false);
};

let removePassiveEventListener = function removePassiveEventListener(target, eventName, listener) {
    target.removeEventListener(eventName, listener);
};

let currentPositionY = function currentPositionY(options) {
    let containerElement = options.data.containerElement;
    if (containerElement && containerElement !== document && containerElement !== document.body) {
        return containerElement.scrollTop;
    } else {
        let supportPageOffset = window.pageXOffset !== undefined;
        let isCSS1Compat = (document.compatMode || "") === "CSS1Compat";
        return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
    }
};

let currentPositionX = function currentPositionX(options) {
    let containerElement = options.data.containerElement;
    if (containerElement && containerElement !== document && containerElement !== document.body) {
        return containerElement.scrollLeft;
    } else {
        let supportPageOffset = window.pageXOffset !== undefined;
        let isCSS1Compat = (document.compatMode || "") === "CSS1Compat";
        return supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    }
};

let targetPosition = function targetPosition(options) {
    let targetElement = options.data.targetElement;
    if (targetElement && targetElement !== document && targetElement !== document.body) {
        if (options.data.scrollAxis == 'Y') {
            return targetElement.getBoundingClientRect().top - targetElement.parentElement.getBoundingClientRect().top;
        } else {
            return targetElement.getBoundingClientRect().left - targetElement.parentElement.getBoundingClientRect().left;
        }
    } else {
        return 0;
    }
};

let makeData = function makeData() {
    return {
        currentPositionY: 0,
        startPositionY: 0,
        targetPositionY: 0,
        currentPositionX: 0,
        startPositionX: 0,
        targetPositionX: 0,
        scrollAxis: 'Y',
        progress: 0,
        duration: 0,
        cancel: false,

        target: null,
        containerElement: null,
        to: null,
        start: null,
        deltaTop: null,
        percent: null,
        delayTimeout: null
    };
};

let animationScroll = function animationScroll(easing, options, timestamp) {
    var data = options.data;

    // Cancel on specific events
    if (!options.ignoreCancelEvents && data.cancel) {
        if (Events.registered['end']) {
            Events.registered['end'](data.to, data.target, data.currentPositionY, data.currentPositionX);
        }
        return;
    };

    if (data.scrollAxis == 'Y') {
        data.deltaTop = Math.round(data.targetPositionY - data.startPositionY);
    } else {
        data.deltaLeft = Math.round(data.targetPositionX - data.startPositionX);
    }

    if (data.start === null) {
        data.start = timestamp;
    }

    data.progress = timestamp - data.start;
    data.percent = data.progress >= data.duration ? 1 : easing(data.progress / data.duration);

    if (data.scrollAxis == 'Y') {
        data.currentPositionY = data.startPositionY + Math.ceil(data.deltaTop * data.percent);

        if (data.containerElement && data.containerElement !== document && data.containerElement !== document.body) {
            data.containerElement.scrollTop = data.currentPositionY;
        } else {
            window.scrollTo(0, data.currentPositionY);
        }

    } else {
        data.currentPositionX = data.startPositionX + Math.ceil(data.deltaLeft * data.percent);

        if (data.containerElement && data.containerElement !== document && data.containerElement !== document.body) {
            data.containerElement.scrollLeft = data.currentPositionX;
        } else {
            window.scrollTo(0, data.currentPositionX);
        }

    }

    if (data.percent < 1) {
        let easedAnimate = animationScroll.bind(null, easing, options);
        requestAnimationFrameHelper.call(window, easedAnimate);
        return;
    }

    if (Events.registered['end']) {
        Events.registered['end'](data.to, data.target, data.currentPositionY, data.currentPositionX);
    }
};

let animateScroll = function animateTopScroll(dest, options, to, target) {
    window.clearTimeout(options.data.delayTimeout);

    subscribe(function () {
        options.data.cancel = true;
    });
    options.data.start = null;
    options.data.cancel = false;
    if (options.data.scrollAxis == 'Y') {
        options.data.startPositionY = currentPositionY(options);
        options.data.targetPositionY = options.absolute ? dest : dest + options.data.startPositionY;
        if (options.data.startPositionY === options.data.targetPositionY) {
            if (Events.registered['end']) {
                Events.registered['end'](options.data.to, options.data.target, options.data.currentPositionY);
            }
            return;
        }
        options.data.deltaTop = Math.round(options.data.targetPositionY - options.data.startPositionY);
        options.data.duration = functionWrapper(options.duration)(options.data.deltaTop);

    } else {
        options.data.startPositionX = currentPositionX(options);
        options.data.targetPositionX = options.absolute ? dest : dest + options.data.startPositionX;

        if (options.data.startPositionX === options.data.targetPositionX) {
            if (Events.registered['end']) {
                Events.registered['end'](options.data.to, options.data.target, options.data.currentPositionX);
            }
            return;
        }
        options.data.deltaLeft = Math.round(options.data.targetPositionX - options.data.startPositionX);
        options.data.duration = functionWrapper(options.duration)(options.data.deltaLeft);
    }

    options.data.duration = isNaN(parseFloat(options.data.duration)) ? 1000 : parseFloat(options.data.duration);
    options.data.to = to;
    options.data.target = target;

    let easing = getAnimationType(options);
    let easedAnimate = animationScroll.bind(null, easing, options);

    if (options && options.delay > 0) {
        options.data.delayTimeout = window.setTimeout(function () {
            requestAnimationFrameHelper.call(window, easedAnimate);
        }, options.delay);
        return;
    }

    requestAnimationFrameHelper.call(window, easedAnimate);
};

let setContainer = function setContainer(options) {
    options.data.containerElement = !options ? null : options.containerId ? document.getElementById(options.containerId) : options.container && options.container.nodeType ? options.container : document;
};

let setScrollAxis = function setScrollAxis(options) {
    options.data.scrollAxis = !options ? null : options.scrollAxis ? options.scrollAxis : 'Y';
};

let setTarget = function setTarget(options) {
    options.data.targetElement = !options ? null : options.targetId ? document.getElementById(options.targetId) : options.target && options.target.nodeType ? options.target : document;
};

let proceedOptions = function proceedOptions(options) {
    options = _extends({}, options);
    options.data = options.data || makeData();
    options.absolute = true;
    return options;
};

function scrollTo(to, options) {
    options = proceedOptions(options);
    setContainer(options);
    setScrollAxis(options);
    animateScroll(to, options);
}

function scrollMore(to, options) {
    options = proceedOptions(options);
    setContainer(options);
    setScrollAxis(options);
    if (options.data.scrollAxis == 'Y') {
        animateScroll(currentPositionY(options) + to, options);
    } else {
        animateScroll(currentPositionX(options) + to, options);
    }
}

function scrollToObject(options) {
    options = proceedOptions(options);
    setContainer(options);
    setScrollAxis(options);
    setTarget(options);
    let to = targetPosition(options);
    animateScroll(to, options);
}

module.exports = {
    scrollTo: scrollTo,
    scrollMore: scrollMore,
    scrollToObject: scrollToObject
};