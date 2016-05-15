window.cxcar = window.cxcar || {};
(function (cxcar) {

    cxcar.GameObject = function GameObject(x, y, z) {
        /**
            The position on the X axis
            @type Number
        */
        this.x = x;
        /**
            The position on the Y axis
            @type Number
        */
        this.y = y;
        /** Display depth order. A smaller zOrder means the element is rendered first, and therefor
            in the background.
            @type Number
        */
        this.zOrder = z;
    }
}(window.cxcar));