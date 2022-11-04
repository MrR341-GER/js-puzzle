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
        this.unique = false;
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
                let relativeX = (e.clientX / width) * this.ViewBox.width + this.ViewBox.x - this.offsetX + this.movingPuzzle.snappedX;
                let relativeY = (e.clientY / height) * this.ViewBox.height + this.ViewBox.y - this.offsetY + this.movingPuzzle.snappedY;
                const X_OFFSET_COORDS = this.ViewBox.x;
                const Y_OFFSET_COORDS = this.ViewBox.y;
                const X_RANGE_COORDS = this.ViewBox.width;
                const Y_RANGE_COORDS = this.ViewBox.height;
                const X_RANGE_PIXELS = width;
                const Y_RANGE_PIXELS = height;
                const X_CORNER_PIXELS = tile.x;
                const Y_CORNER_PIXELS = tile.y;
                const WIDTH_PIXELS = tile.width;
                const HEIGHT_PIXELS = tile.height;
                var x_point_pixels = X_CORNER_PIXELS + (WIDTH_PIXELS / 2);
                var y_point_pixels = Y_CORNER_PIXELS + (HEIGHT_PIXELS / 2);
                var pixels_per_coord_unit_x = X_RANGE_PIXELS / X_RANGE_COORDS;
                var pixels_per_coord_unit_y = Y_RANGE_PIXELS / Y_RANGE_COORDS;
                var x_point_cord = (X_OFFSET_COORDS) + (x_point_pixels / pixels_per_coord_unit_x);
                var y_point_cord = (Y_OFFSET_COORDS) + (y_point_pixels / pixels_per_coord_unit_y);
                this.movingPuzzle.changePosition(x_point_cord, y_point_cord);
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
    // relative Position der Maus zum linken oberen Eck der Kachel + relativer Abstand zu 0,0 im K-System im Ausgangszustand
    createPaths(NS, defs) {
        let rowJiggle = new Array(this.row + 1).fill(0).map(v => new Array(this.col + 1).fill(0).map(v => Math.random() - .5));
        let colJiggle = new Array(this.col + 1).fill(0).map(v => new Array(this.row + 1).fill(0).map(v => Math.random() - .5));
        let unique = false;
        rowJiggle[0].fill(0);
        rowJiggle[this.row].fill(0);
        colJiggle[0].fill(0);
        colJiggle[this.col].fill(0);
        const ANGLE = 0 * Math.PI / 180;
        if (ANGLE != 0) {
            unique = true;
        }
        const DIST = .5;
        let p1x, p1y, p2x, p2y;
        for (let y = 0; y < this.row; y++) {
            this.tilesArray[y] = [];
            for (let x = 0; x < this.col; x++) {
                this.tilesArray[y][x] = new Tile({ y, x }, unique);
                this.tilesArray[y][x].changePosition((x + 0.5), (y + 0.5));
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
                this.tilesArray[y][x].setHtmlObject(path);
                path.onmousedown = (e) => {
                    path.style.filter = "brightness(1)";
                    this.movingPuzzle = this.tilesArray[y][x];
                    let tile = path.getBoundingClientRect();
                    let svgBCR = this.svg.getBoundingClientRect();
                    this.offsetX = ((e.clientX / svgBCR.width) * this.ViewBox.width) + this.ViewBox.x - path.offsetX;
                    this.offsetY = ((e.clientY / svgBCR.height) * this.ViewBox.height) + this.ViewBox.y - path.offsetY;
                    this.svg.appendChild(path);
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
class Tile {
    constructor({ y, x }, unique = false) {
        this.arrayPosition = { y, x };
        this.unique = unique;
        // hideerrorposition
        this.position = { "x": 0, "y": 0 }//null;
        this.htmlObject = null;
        this.snappedX = 0;
        this.snappedY = 0;
        this.neighbors = { "left": null, "below": null, "right": null, "over": null }
        this.connectedTiles = { "left": null, "below": null, "right": null, "over": null }
    }
    calculateNeighbors(array1) {
        if (typeof array1[this.arrayPosition.y][this.arrayPosition.x + 1] != "undefined") {
            this.neighbors.right = array1[this.arrayPosition.y][this.arrayPosition.x + 1];
        }
        if (typeof array1[this.arrayPosition.y][this.arrayPosition.x - 1] != "undefined") {
            this.neighbors.left = array1[this.arrayPosition.y][this.arrayPosition.x - 1];
        }
        if (typeof array1[this.arrayPosition.y + 1] != "undefined") {
            if (typeof array1[this.arrayPosition.y + 1][this.arrayPosition.x] != "undefined") {
                this.neighbors.below = array1[this.arrayPosition.y + 1][this.arrayPosition.x];
            }
        }
        if (typeof array1[this.arrayPosition.y - 1] != "undefined") {
            if (typeof array1[this.arrayPosition.y - 1][this.arrayPosition.x] != "undefined") {
                this.neighbors.Over = array1[this.arrayPosition.y - 1][this.arrayPosition.x];
            }
        }
    }
    setHtmlObject(htmlObject) {
        this.htmlObject = htmlObject;
    }

    checkSnap(tilesArray) {
        var closestTile = null;
        var closestDistance = Number.MAX_VALUE;
        var accuracy = 0.9;
        this.snappedX = 0;
        this.snappedY = 0;
        tilesArray.forEach(row => {
            row.forEach(tile => {
                if (this != tile) {

                    var distance = Math.sqrt(((this.position.x - tile.position.x) ** 2) + ((this.position.y - tile.position.y) ** 2));

                    // console.log(this.position.x);
                    // console.log(this.position.y);
                    // console.log(tile.position.x);
                    // console.log(tile.position.y);
                    //console.log(closestDistance);
                    if (distance <= (2 - accuracy) && distance >= accuracy) {
                        if (distance < closestDistance) {
                            closestTile = tile;
                            closestDistance = distance;
                        }
                        else if (distance == closestDistance && Math.random() > 0.5) {
                            console.log("unlikely");
                            closestTile = tile;
                        }
                    }
                }
            });
        });

        if (closestDistance <= (2 - accuracy) && closestDistance >= accuracy) {
            if (this.unique) {
                var isLeft = (closestTile.position.x - this.position.x > accuracy);
                var isBelow = (this.position.y - closestTile.position.y > accuracy);
                var isRight = (this.position.x - closestTile.position.x > accuracy);
                var isOver = (closestTile.position.y - this.position.y > accuracy);
                switch (true) {
                    case (isLeft && !isBelow && !isRight && !isOver):
                        if (this == closestTile.neighbors.left) {
                            this.connectTiles(closestTile, accuracy);
                        }
                        break;
                    case (!isLeft && isBelow && !isRight && !isOver):
                        if (this == closestTile.neighbors.below) {
                            this.connectTiles(closestTile, accuracy);
                        }
                        break;
                    case (!isLeft && !isBelow && isRight && !isOver):
                        if (this == closestTile.neighbors.right) {
                            this.connectTiles(closestTile, accuracy);
                        }
                        break;
                    case (!isLeft && !isBelow && !isRight && isOver):
                        if (this == closestTile.neighbors.over) {
                            this.connectTiles(closestTile, accuracy);
                        }
                        break;
                    default:
                        console.log("unique: wrong piece");
                        allGood = false;
                        console.log(isLeft);
                        console.log(isBelow);
                        console.log(isRight);
                        console.log(isOver);
                        break;
                }

            } else {
                this.connectTiles(closestTile, accuracy);
            }
        } else {

            // console.log(closestDistance <= (2 - accuracy));
            // console.log(closestDistance >= accuracy);
        }

    }

    connectTiles(tile, accuracy) {
        var isLeft = (tile.position.x - this.position.x > accuracy)
        var isBelow = (this.position.y - tile.position.y > accuracy)
        var isRight = (this.position.x - tile.position.x > accuracy)
        var isOver = (tile.position.y - this.position.y > accuracy);
        var x = 0;
        var y = 0;
        var allGood = true;
        var snappedX = 0;
        var snappedY = 0;
        var thisLeft = this.connectedTiles.left;
        var thisBelow = this.connectedTiles.below;
        var thisRight = this.connectedTiles.right;
        var thisOver = this.connectedTiles.over;
        var tileLeft = tile.connectedTiles.left;
        var tileBelow = tile.connectedTiles.below;
        var tileRight = tile.connectedTiles.right;
        var tileOver = tile.connectedTiles.over;
        switch (true) {
            case (isLeft && !isBelow && !isRight && !isOver):
                x = tile.position.x - 1;
                y = tile.position.y;
                tileLeft = this;
                thisRight = tile;
                snappedX = -(this.position.x - tile.position.x + 1);
                snappedY = -(this.position.y - tile.position.y);
                break;
            case (!isLeft && isBelow && !isRight && !isOver):
                x = tile.position.x;
                y = tile.position.y + 1;
                tileBelow = this;
                thisOver = tile;
                snappedX = -(this.position.x - tile.position.x);
                snappedY = -(this.position.y - tile.position.y - 1);
                break;
            case (!isLeft && !isBelow && isRight && !isOver):
                x = tile.position.x + 1;
                y = tile.position.y;
                tileRight = this;
                thisLeft = tile;
                snappedX = -(this.position.x - tile.position.x - 1);
                snappedY = -(this.position.y - tile.position.y);
                break;
            case (!isLeft && !isBelow && !isRight && isOver):
                x = tile.position.x;
                y = tile.position.y - 1;
                tileOver = this;
                thisBelow = tile;
                snappedX = -(this.position.x - tile.position.x);
                snappedY = -(this.position.y - tile.position.y + 1);
                break;
            default:
                console.log("something went wrong");
                allGood = false;
                console.log(isLeft);
                console.log(isBelow);
                console.log(isRight);
                console.log(isOver);
                break;
        }
        if (allGood) {

            console.log(this.connectedTiles);
            // Beim snapping wird der weg bis zum snapping nicht verrechnet (Stelle unbekannt)
            // Wenn man mit der Maus das Tile nach dem snappen wieder aufnimmt, ohne die Maus zu bewegen,
            // bewegt sich das Tile wieder an die Stelle zurück bevor es ran gesnapt ist

            this.snappedX = snappedX;
            this.snappedY = snappedY;
            this.changePosition(x, y);
            this.htmlObject.setAttribute("transform", `translate(${(x - .5) - this.arrayPosition.x} ${(y - .5) - this.arrayPosition.y})`);


        }
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
        // if (this.tileOver) {
        //     if (tile.arrayPosition == this.tileOver.arrayPosition) {
        //         console.log("has Over Tile");
        //     } else {
        //         check = false;
        //         console.log("Over");
        //         throw tile.arrayPosition;
        //     }
        // }
        // if (this.tileBelow) {
        //     if (tile.arrayPosition == this.tileBelow.arrayPosition) {
        //         console.log("has Below Tile");
        //     } else {
        //         check = false;
        //         console.log("Below");
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
        //         if (this.tileOver) {
        //             if (tile.arrayPosition == this.tileOver.arrayPosition) {
        //                 console.log("has Over Tile");
        //             } else {
        //                 check = false;
        //                 console.log("Over");
        //                 throw tile.arrayPosition;
        //             }
        //         }
        //         if (this.tileBelow) {
        //             if (tile.arrayPosition == this.tileBelow.arrayPosition) {
        //                 console.log("has Below Tile");
        //             } else {
        //                 check = false;
        //                 console.log("Below");
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
    changePosition(x, y) {
        this.position = { x, y };
    }
}
