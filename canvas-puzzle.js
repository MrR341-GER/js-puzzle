class Puzzle {
    constructor(row, col, strokeWidth, imagePath) {
        this.row = row;
        this.col = col;
        this.greater = null;
        this.strokeWidth = strokeWidth;
        this.image = new Image();
        this.image.src = imagePath;
        this.offsetX = 0;
        this.offsetY = 0;
        this.ratio = null
        this.movingPuzzle = null;
        this.tileSize = null;
        this.svg = null;
        this.image.onload = () => {
            this.svg = this.createSVG();
            document.getElementById("puzzle".toLowerCase()).appendChild(this.svg);
            document.onmouseup = () => {
                if (this.movingPuzzle) {
                    this.movingPuzzle.style.filter = "brightness(0.8)";
                    this.movingPuzzle = null;
                }
            };
        }
    }

    handleResize(neededViewBox) {

        if (neededViewBox["width"] > neededViewBox["height"] || (window.innerHeight / (window.innerWidth / neededViewBox["width"])) > neededViewBox["height"]) {
            var height = window.innerHeight / (window.innerWidth / neededViewBox["width"]);
            var width = neededViewBox["width"];
        } else if (neededViewBox["width"] <= neededViewBox["height"] || (window.innerWidth / (window.innerHeight / neededViewBox["height"])) > neededViewBox["width"]) {
            var height = neededViewBox["height"];
            var width = window.innerWidth / (window.innerHeight / neededViewBox["height"]);
        } else {
            console.log("something went wrong");
        }
        var x = this.ratio * neededViewBox["x"];
        var y = this.ratio * neededViewBox["y"];
        return { "x": x, "y": y, "height": height, "width": width };
    }

    canvasArea(image, x, y, width, height) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        //                   source region         dest. region
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        return canvas;
    }

    createSVG() {
        if (this.row == 0 || this.col == 0) {
            if (this.row == 0 && this.col == 0) {
                this.col = 10;
                this.row = 10;
                this.greater = this.row;
            } else {
                this.greater = this.col > this.row ? this.col : this.row;
            }
            if (this.image.width < this.image.height) {
                this.col = Math.round(this.image.width / (this.image.height / this.greater));
                this.row = this.greater
            } else {
                this.row = Math.round(this.image.height / (this.image.width / this.greater));
                this.col = this.greater;
            }
        }
        const NS = 'http://www.w3.org/2000/svg';
        this.svg = document.createElementNS(NS, 'svg');

        this.svg.setAttribute('xmlns', NS);
        var style = document.createElementNS(NS, 'style');
        style.innerHTML = `path{stroke:grey;}`;
        this.svg.appendChild(style);
        let defs = document.createElementNS(NS, "defs");
        //defs.innerHTML = `
        //<pattern id="img1" patternContentUnits="objectBoundingBox" patternUnits="userSpaceOnUse" width="${this.col}" height="${this.row}">
        //<image href="${this.image.src}" x="0" y="0"  width="${this.col}" height="${this.row}"></image>
        //</pattern>`;
        //defs.innerHTML = `
        //<pattern id="img1" patternContentUnits="objectBoundingBox" patternUnits="userSpaceOnUse" width="${this.col}" height="${this.row}">
        //</pattern>`;

        this.svg.appendChild(defs);
        let counter = 1;
        var area_coordinates = {};
        for (let y = 0; y < this.row; y++) {
            for (let x = 0; x < this.col; x++) {
                let path = document.createElementNS(NS, 'path');
                area_coordinates = {"x":x * (this.image.width / this.col), "y":y * (this.image.height / this.row), "width":(this.image.width / this.col), "height":(this.image.height / this.row)};
                path.setAttribute("stroke-width", this.strokeWidth);
                path.setAttribute("d", `M ${area_coordinates["x"]} ${area_coordinates["y"]} l ${area_coordinates["width"]} 0 l 0 ${area_coordinates["height"]} l -${area_coordinates["width"]} 0 z`);
                path.setAttribute("id", `${counter}`);
                var canvas = this.canvasArea(this.image, area_coordinates["x"], area_coordinates["y"], area_coordinates["width"], area_coordinates["height"]);
                path.setAttribute("fill", `url(#img${counter})`);
                path.offsetX = 0;
                path.offsetY = 0;
                var pattern = document.createElementNS(NS, "pattern")
                pattern.setAttribute("id",`img${counter}`);
                pattern.setAttribute("patternContentUnits","objectBoundingBox");
                pattern.setAttribute("patternUnits","userSpaceOnUse");
                pattern.setAttribute("height",`${area_coordinates["height"]}`);
                pattern.setAttribute("width" ,`${area_coordinates["width"]}`);
                pattern.appendChild(canvas);

                defs.appendChild(pattern);

                path.onmousedown = (e) => {
                    path.style.filter = "brightness(1)";
                    this.movingPuzzle = path;
                    let tile = path.getBoundingClientRect();
                    let { x, y } = this.svg.getBoundingClientRect();
                    console.log(
                        //path.offsetX,
                        //path.offsetY,
                        x,
                        y ,
                        );
                    this.offsetX = ((e.clientX - x ) / tile["width"])  + this.strokeWidth - path.offsetX;
                    this.offsetY = ((e.clientY - y ) / tile["height"]) + this.strokeWidth - path.offsetY;
                    this.svg.appendChild(path);
                };
                path.onmouseout = (e) => {
                    path.style.filter = "brightness(1)";
                }
                path.onmouseover = (e) => {
                    path.style.filter = "brightness(0.8)";
                }
                this.svg.appendChild(path);
                counter++;
            }
        }
        const neededViewBox = { "x": -this.strokeWidth, "y": -this.strokeWidth, "height": (this.row * area_coordinates["height"])+ this.strokeWidth * 2, "width": (this.col * area_coordinates["width"]) + this.strokeWidth * 2 };
        var newViewBox = this.handleResize(neededViewBox);
        this.svg.setAttribute('viewBox', `${newViewBox["x"]} ${newViewBox["y"]} ${newViewBox["width"]} ${newViewBox["height"]}`);
        document.onmousemove = (e) => {
            if (this.movingPuzzle) {
                let tile = this.movingPuzzle.getBoundingClientRect();
                let { x, y } = this.svg.getBoundingClientRect();
                let newX = ((e.clientX - x) / tile["width"])  -  this.offsetX;
                let newY = ((e.clientY - y) / tile["height"]) - this.offsetY;
                this.movingPuzzle.setAttribute("transform", `translate(${newX} ${newY})`);
                this.movingPuzzle.offsetX = newX
                this.movingPuzzle.offsetY = newY
            }
        }
        window.onresize = (e) => {
            newViewBox = this.handleResize(neededViewBox);
            this.svg.setAttribute('viewBox', `${newViewBox["x"]} ${newViewBox["y"]} ${newViewBox["width"]} ${newViewBox["height"]}`);
        };
        return this.svg;
    }

}
