class Tile {
    constructor({ y, x }) {
        this.arrayPosition = { y, x };
        this.position = null;
        this.htmlObject = null;
        this.tileRight = null;
        this.tileDown = null;
        this.tileLeft = null;
        this.tileUp = null;
        this.connectedTiles = [null, null, null, null]
    }
    calculateNeighbors(array1) {
        if (typeof array1[this.arrayPosition.y][this.arrayPosition.x + 1] != "undefined") {
            this.tileRight = array1[this.arrayPosition.y][this.arrayPosition.x + 1];
        }
        if (typeof array1[this.arrayPosition.y][this.arrayPosition.x - 1] != "undefined") {
            this.tileLeft = array1[this.arrayPosition.y][this.arrayPosition.x - 1];
        }
        if (typeof array1[this.arrayPosition.y + 1] != "undefined") {
            if (typeof array1[this.arrayPosition.y + 1][this.arrayPosition.x] != "undefined") {
                this.tileDown = array1[this.arrayPosition.y + 1][this.arrayPosition.x];
            }
        }
        if (typeof array1[this.arrayPosition.y - 1] != "undefined") {
            if (typeof array1[this.arrayPosition.y - 1][this.arrayPosition.x] != "undefined") {
                this.tileUp = array1[this.arrayPosition.y - 1][this.arrayPosition.x];
            }
        }
    }
    setHtmlObject(htmlObject) {
        this.htmlObject = htmlObject;
    }

    checkSnap(tilesArray) {
        var closestTile = null;
        var closestDistance = null;
        tilesArray.forEach(row => {
            row.forEach(tile => {
                var distance = Math.sqrt(((this.position.x - tile.position.x) ** 2) + ((this.position.y - tile.position.y) ** 2));
                if (distance < closestDistance) {
                    closestTile = tile;
                    closestDistance = distance;
                }
                console.log(closestTile);
            });
            this.connectTiles(closestTile);
        });
    }

    connectTiles(tile) {
        var x = (this.position.x - tile.position.x > 0) ? tile.position.x - (tile.width / 2) : tile.position.x + (tile.width / 2);
        var y = (this.position.y - tile.position.x > 0) ? tile.position.y - (tile.height / 2) : tile.position.y + (tile.height / 2);
        var new_position = { y, x }
    }

    checkForNeighbors(tilesArray) {
        // var check = true;
        // if (this.position == 0) {

        // }
        // if (this.tileRight) {
        //     if (tile.arrayPosition[x] == this.tileRight.arrayPosition) {
        //         console.log("has Right Tile");
        //     } else {
        //         check = false;
        //         console.log("Right");
        //         throw tile.arrayPosition;
        //     }
        // }
        // if (this.tileLeft) {
        //     if (tile.arrayPosition == this.tileLeft.arrayPosition) {
        //         console.log("has Left Tile");
        //     } else {
        //         check = false;
        //         console.log("Left");
        //         throw tile.arrayPosition;
        //     }
        // }
        // if (this.tileUp) {
        //     if (tile.arrayPosition == this.tileUp.arrayPosition) {
        //         console.log("has Up Tile");
        //     } else {
        //         check = false;
        //         console.log("Up");
        //         throw tile.arrayPosition;
        //     }
        // }
        // if (this.tileDown) {
        //     if (tile.arrayPosition == this.tileDown.arrayPosition) {
        //         console.log("has Down Tile");
        //     } else {
        //         check = false;
        //         console.log("Down");
        //         throw tile.arrayPosition;
        //     }
        // }
        // tilesArray.forEach(row => {
        //     row.forEach(tile => {
        //         if (this.tileRight) {
        //             if (tile.arrayPosition == this.tileRight.arrayPosition) {
        //                 console.log("has Right Tile");
        //             } else {
        //                 check = false;
        //                 console.log("Right");
        //                 throw tile.arrayPosition;
        //             }
        //         }
        //         if (this.tileLeft) {
        //             if (tile.arrayPosition == this.tileLeft.arrayPosition) {
        //                 console.log("has Left Tile");
        //             } else {
        //                 check = false;
        //                 console.log("Left");
        //                 throw tile.arrayPosition;
        //             }
        //         }
        //         if (this.tileUp) {
        //             if (tile.arrayPosition == this.tileUp.arrayPosition) {
        //                 console.log("has Up Tile");
        //             } else {
        //                 check = false;
        //                 console.log("Up");
        //                 throw tile.arrayPosition;
        //             }
        //         }
        //         if (this.tileDown) {
        //             if (tile.arrayPosition == this.tileDown.arrayPosition) {
        //                 console.log("has Down Tile");
        //             } else {
        //                 check = false;
        //                 console.log("Down");
        //                 throw tile.arrayPosition;
        //             }
        //         }
        //     });
        // });
        // if (check == false) {
        //     console.log("you win!");
        // }
    }
    debug() {
        console.log(this);
    }
    changePosition() {

    }
}


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
        this.svg = null;
        this.ViewBox = null;
        this.tilesArray = [];
        this.image.onload = () => {
            this.svg = this.createSVG();
            document.getElementById("puzzle".toLowerCase()).appendChild(this.svg);
            document.onmouseup = () => {
                if (this.movingPuzzle) {
                    this.movingPuzzle.htmlObject.style.filter = "brightness(0.8)";
                    this.movingPuzzle.checkSnap(this.tilesArray);
                    this.movingPuzzle = null;
                }
            };
        }
    }

    handleResize({ x, y, width, height }) {
        const padding = 1;

        width += padding * 2;
        height += padding * 2;
        x -= padding;
        y -= padding;

        const ratio = width / height;
        const ratioNeeded = window.innerWidth / window.innerHeight;

        this.ViewBox = ratioNeeded > ratio ? {
            "width": height * ratioNeeded,
            "height": height,
            "x": (width - height * ratioNeeded) / 2 - padding,
            "y": y
        } : {
            "width": width,
            "height": width / ratioNeeded,
            "x": x,
            "y": (height - width / ratioNeeded) / 2 - padding
        }

        return this.ViewBox;
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
        const neededViewBox = { "x": -this.strokeWidth, "y": -this.strokeWidth, "height": this.row + this.strokeWidth * 2, "width": this.col + this.strokeWidth * 2 };
        var newViewBox = this.handleResize(neededViewBox);
        this.svg.setAttribute('xmlns', NS);
        this.svg.setAttribute('viewBox', `${newViewBox["x"]} ${newViewBox["y"]} ${newViewBox["width"]} ${newViewBox["height"]}`);
        var style = document.createElementNS(NS, 'style');
        style.innerHTML = `path{stroke:grey;}`;
        this.svg.appendChild(style);
        let defs = document.createElementNS(NS, "defs");
        defs.innerHTML = `
        <clipPath id="clip">
            <rect x="0" y="0" height="1" width="1" / >
        </clipPath>
        <pattern id="img1" patternUnits="userSpaceOnUse" width="${this.col}" height="${this.row}">
            <image href="${this.image.src}" x="0" y="0"  width="${this.col}" height="${this.row}" preserveAspectRatio="xMidYMid slice"></image>
        </pattern>`;
        this.svg.appendChild(defs);

        this.createPaths(NS, defs);

        document.onmousemove = (e) => {
            if (this.movingPuzzle) {
                let tile = this.movingPuzzle.htmlObject.getBoundingClientRect();
                let { x, y, width, height } = this.svg.getBoundingClientRect();
                let relativeX = (e.clientX / width) * this.ViewBox.width + this.ViewBox.x - this.offsetX;
                let relativeY = (e.clientY / height) * this.ViewBox.height + this.ViewBox.y - this.offsetY;
                let absoluteX = relativeX;
                let absoluteY = relativeY;
                //console.log("__");
                //console.log(width  / tile.width);
                //console.log(height / tile.height);
                this.movingPuzzle.htmlObject.setAttribute("transform", `translate(${relativeX} ${relativeY})`);
                this.movingPuzzle.htmlObject.offsetX = relativeX
                this.movingPuzzle.htmlObject.offsetY = relativeY
            }
        }
        window.onresize = (e) => {
            newViewBox = this.handleResize(neededViewBox);
            this.svg.setAttribute('viewBox', `${newViewBox["x"]} ${newViewBox["y"]} ${newViewBox["width"]} ${newViewBox["height"]}`);
        };
        return this.svg;
    }

    createPaths(NS, defs) {

        let rowJiggle = new Array(this.row + 1).fill(0).map(v => new Array(this.col + 1).fill(0).map(v => Math.random() - .5));
        let colJiggle = new Array(this.col + 1).fill(0).map(v => new Array(this.row + 1).fill(0).map(v => Math.random() - .5));
        rowJiggle[0].fill(0);
        rowJiggle[this.row].fill(0);
        colJiggle[0].fill(0);
        colJiggle[this.col].fill(0);

        const ANGLE = 0 * Math.PI / 180;
        const DIST = .5;

        let p1x, p1y, p2x, p2y;

        for (let y = 0; y < this.row; y++) {
            this.tilesArray[y] = [];
            for (let x = 0; x < this.col; x++) {
                this.tilesArray[y][x] = new Tile({ y, x });
                let path = document.createElementNS(NS, 'path');

                p1x = Math.cos(ANGLE * rowJiggle[y][x]) * DIST
                p1y = Math.sin(ANGLE * rowJiggle[y][x]) * DIST
                p2x = Math.cos(ANGLE * rowJiggle[y][x + 1] + Math.PI) * DIST + 1
                p2y = Math.sin(ANGLE * rowJiggle[y][x + 1] + Math.PI) * DIST
                let topRow = `c ${p1x} ${p1y} ${p2x} ${p2y} 1 0`;

                p1x = Math.cos(ANGLE * rowJiggle[y + 1][x + 1] + Math.PI) * DIST
                p1y = Math.sin(ANGLE * rowJiggle[y + 1][x + 1] + Math.PI) * DIST
                p2x = Math.cos(ANGLE * rowJiggle[y + 1][x]) * DIST - 1
                p2y = Math.sin(ANGLE * rowJiggle[y + 1][x]) * DIST
                let bottomRow = `c ${p1x} ${p1y} ${p2x} ${p2y} -1 0`;

                p1x = Math.cos(ANGLE * colJiggle[x][y + 1] - Math.PI / 2) * DIST
                p1y = Math.sin(ANGLE * colJiggle[x][y + 1] - Math.PI / 2) * DIST
                p2x = Math.cos(ANGLE * colJiggle[x][y] + Math.PI / 2) * DIST
                p2y = Math.sin(ANGLE * colJiggle[x][y] + Math.PI / 2) * DIST - 1
                let leftRow = `c ${p1x} ${p1y} ${p2x} ${p2y} 0 -1`;

                p1x = Math.cos(ANGLE * colJiggle[x + 1][y] + Math.PI / 2) * DIST
                p1y = Math.sin(ANGLE * colJiggle[x + 1][y] + Math.PI / 2) * DIST
                p2x = Math.cos(ANGLE * colJiggle[x + 1][y + 1] - Math.PI / 2) * DIST
                p2y = Math.sin(ANGLE * colJiggle[x + 1][y + 1] - Math.PI / 2) * DIST + 1
                let rightRow = `c ${p1x} ${p1y} ${p2x} ${p2y} 0 1`;

                path.setAttribute("d", `M ${x} ${y} ${topRow} ${rightRow} ${bottomRow} ${leftRow}`);

                let clipPath = document.createElementNS(NS, 'clipPath');
                clipPath.setAttribute("id", `clip${y + "-" + x}`);
                clipPath.innerHTML = path.outerHTML; //`<path d="M ${x} ${y} l 1 0 l 0 1 l -1 0 z" / >`;

                defs.appendChild(clipPath);
                //path.setAttribute("d", `M ${x} ${y} l 1 0 l 0 1 l -1 0 z`);
                path.setAttribute("stroke-width", this.strokeWidth);
                path.setAttribute("fill", "url(#img1)");
                path.setAttribute("clip-path", `url(#clip${y + "-" + x})`);

                path.offsetX = 0;
                path.offsetY = 0;
                this.tilesArray[y][x].setHtmlObject(path);;
                path.onmousedown = (e) => {
                    path.style.filter = "brightness(1)";
                    this.movingPuzzle = this.tilesArray[y][x];
                    let tile = path.getBoundingClientRect();
                    let svgBCR = this.svg.getBoundingClientRect();
                    this.offsetX = (e.clientX / svgBCR.width) * this.ViewBox.width + this.ViewBox.x + this.strokeWidth - path.offsetX;
                    this.offsetY = (e.clientY / svgBCR.height) * this.ViewBox.height + this.ViewBox.y + this.strokeWidth - path.offsetY;
                    this.svg.appendChild(path);
                    // Bitte um Bestätigung der Korrektheit, dass this.movingPuzzle die Klasse refferenziert und nicht mehr nur das HTML Objekt
                    console.log(this.movingPuzzle.htmlObject == this.tilesArray[y][x].htmlObject);
                };
                path.onmouseout = (e) => {
                    path.style.filter = "brightness(1)";
                }
                path.onmouseover = (e) => {
                    path.style.filter = "brightness(0.8)";
                }
                this.svg.appendChild(path);
                this.tilesArray[y][x].setHtmlObject(path);
            }
        }
        this.tilesArray.forEach(row => {
            row.forEach(tile => {
                tile.calculateNeighbors(this.tilesArray)
            });
        });
        console.log(this.tilesArray);
    }
}
