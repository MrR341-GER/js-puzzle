class Puzzle {
    constructor(row, col, strokeWidth, imagePath) {
        this.row = row;
        this.col = col;
        this.strokeWidth = strokeWidth;
        this.image = new Image();
        this.image.src = imagePath;
        this.offsetX = 0;
        this.offsetY = 0;
        this.movingPuzzle = null;
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

    createSVG() {
        if (this.row == 0 || this.col == 0) {
            if (this.row == 0 && this.col == 0) {
                this.col = 10;
                this.row = 10;
                var greater = this.row;
            } else {
                var greater = this.col < this.row ? this.row : this.col;
            }
            if (this.image.width < this.image.height) {
                this.col = Math.round(this.image.width / (this.image.height / greater));
                this.row = greater
            } else {
                this.row = Math.round(this.image.height / (this.image.width / greater));
                this.col = greater;
            }
            //console.log(this.row);
            //console.log(this.col);
        }
        const NS = 'http://www.w3.org/2000/svg';
        let svg = document.createElementNS(NS, 'svg');
        const neededViewBox = {"x": -this.strokeWidth, "y": -this.strokeWidth, "height": this.col + this.strokeWidth * 2, "width": this.row + this.strokeWidth * 2};

        var wantedViewBox = (neededViewBox) => {
            var height = window.innerHeight / window.innerWidth * neededViewBox["height"];
            var width = window.innerHeight / window.innerWidth * neededViewBox["width"];
            var x = window.innerHeight / window.innerWidth * neededViewBox["x"];
            var y = window.innerHeight / window.innerWidth * neededViewBox["y"];
            console.log({"x":x, "y":y, "height":height, "width": width});
            return {"x":x, "y":y, "height":height, "width": width};
        };
        var newViewBox = wantedViewBox(neededViewBox);
        svg.setAttribute('xmlns', NS);
        svg.setAttribute('viewBox', `${newViewBox["x"]} ${newViewBox["y"]} ${newViewBox["height"]} ${newViewBox["width"]}`);
        var style = document.createElementNS(NS, 'style');
        style.innerHTML = `path{stroke:grey;}`;
        svg.appendChild(style);
        let defs = document.createElementNS(NS, "defs");
        defs.innerHTML = `
        <pattern id="img1" patternUnits="userSpaceOnUse" width="${this.col}" height="${this.row}">
            <image href="${this.image.src}" x="0" y="0"  width="${this.col}" height="${this.row}"></image>
        </pattern>`;
        svg.appendChild(defs);
        for (let y = 0; y < this.row; y++) {
            for (let x = 0; x < this.col; x++) {
                let path = document.createElementNS(NS, 'path');
                path.setAttribute("d", `M ${x} ${y} l 1 0 l 0 1 l -1 0 z`);
                path.setAttribute("stroke-width", this.strokeWidth);
                path.setAttribute("fill", "url(#img1)");
                path.offsetX = 0;
                path.offsetY = 0;
                path.onmousedown = (e) => {
                    path.style.filter = "brightness(1)";
                    this.movingPuzzle = path;
                    let tile = path.getBoundingClientRect();
                    let { x, y } = this.svg.getBoundingClientRect();
                    this.offsetX = ((e.clientX - x) / tile["width"]) + this.strokeWidth - path.offsetX;
                    this.offsetY = ((e.clientY - y) / tile["height"]) + this.strokeWidth - path.offsetY;
                    svg.appendChild(path);
                };
                path.onmouseout = (e) => {
                    path.style.filter = "brightness(1)";
                }
                path.onmouseover = (e) => {
                    path.style.filter = "brightness(0.8)";
                }
                svg.appendChild(path);
            }
        }
        document.onmousemove = (e) => {
            if (this.movingPuzzle) {
                let tile = this.movingPuzzle.getBoundingClientRect();
                let { x, y } = this.svg.getBoundingClientRect();
                let newX = ((e.clientX - x) / tile["width"]) - this.offsetX;
                let newY = ((e.clientY - y) / tile["height"]) - this.offsetY;
                this.movingPuzzle.setAttribute("transform", `translate(${newX} ${newY})`);
                this.movingPuzzle.offsetX = newX
                this.movingPuzzle.offsetY = newY
            }
        }
        return svg;
    }

}
