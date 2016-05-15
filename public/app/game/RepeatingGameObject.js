(function (cxcar) {
    /**
        A class that display a repeating texture that can optionall be offset in either
        the x or y axis
        @author <a href="mailto:matthewcasperson@gmail.com">Matthew Casperson</a>
        @class
    */
    cxcar.RepeatingGameObject = function RepeatingGameObject(image, x, y, z, width, height, scrollFactor) {
        this.image = image;
        this.x = x;
        this.y = 0;
        this.z = z;
        /** The width that the final image will take up
            @type Number
        */
        this.width = width;
        /** The height that the final image will take up
            @type Number
        */
        this.height = height;
        /** How much of the scrollX and scrollY to apply when drawing
            @type Number
        */
        this.scrollFactor = scrollFactor || 1;


        this.update = function (dt) {

        };
        /**
            Draws this element to the back buffer
            @param dt Time in seconds since the last frame
            @param context The context to draw to
            @param xScroll The global scrolling value of the x axis  
            @param yScroll The global scrolling value of the y axis  
        */

        this.draw = function (dt, ctx, xScroll, yScroll) {
            var areaDrawn = [0, 0];

            for (var y = 0; y < this.height; y += areaDrawn[1]) {
                for (var x = 0; x < this.width; x += areaDrawn[0]) {
                    // the top left corner to start drawing the next tile from
                    var newPosition = [this.x + x, this.y + y],
                    // the amount of space left in which to draw
                        newFillArea = [this.width - x, this.height - y],
                    // the first time around you have to start drawing from the middle of the image
                    // subsequent tiles alwyas get drawn from the top or left
                        newScrollPosition = [0, 0];
                    if (x == 0) newScrollPosition[0] = xScroll * this.scrollFactor;
                    if (y == 0) newScrollPosition[1] = yScroll * this.scrollFactor;
                    areaDrawn = this.drawRepeat(ctx, newPosition, newFillArea, newScrollPosition);
                }
            }
        };

        this.drawRepeat = function (ctx, newPosition, newFillArea, newScrollPosition) {
            // find where in our repeating texture to start drawing (the top left corner)
            var xOffset = Math.abs(newScrollPosition[0]) % this.image.width;
            var yOffset = Math.abs(newScrollPosition[1]) % this.image.height;
            var left = newScrollPosition[0] < 0 ? this.image.width - xOffset : xOffset;
            var top = newScrollPosition[1] < 0 ? this.image.height - yOffset : yOffset;
            var width = newFillArea[0] < this.image.width - left ? newFillArea[0] : this.image.width - left;
            var height = newFillArea[1] < this.image.height - top ? newFillArea[1] : this.image.height - top;

            // draw the image
            ctx.drawImage(this.image, left, top, width, height, newPosition[0], newPosition[1], width, height);

            return [width, height];
        };


    }
    cxcar.RepeatingGameObject.prototype = new cxcar.VisualGameObject();
}(window.cxcar));