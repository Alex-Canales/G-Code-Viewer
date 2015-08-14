/*jslint todo: true, browser: true, continue: true, white: true*/
/*global THREE, GCodeToGeometry*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

/**
 * This file contains the class managing the path view.
 */

var GCodeViewer = {};

//Class to create the meshes showing the measure of the path
GCodeViewer.TotalSize = function(scene) {
    "use strict";
    var that = this;

    that.remove = function() {
        that.scene.remove(that.textWidth);
        that.scene.remove(that.lineWidth);
        that.scene.remove(that.textLength);
        that.scene.remove(that.lineLength);
        that.scene.remove(that.textHeight);
        that.scene.remove(that.lineHeight);
    };

    that.add = function() {
        that.scene.add(that.textWidth);
        that.scene.add(that.lineWidth);
        that.scene.add(that.textLength);
        that.scene.add(that.lineLength);
        that.scene.add(that.textHeight);
        that.scene.add(that.lineHeight);
    };

    function createMeshText(message, options, color) {
        var material = new THREE.MeshBasicMaterial({ color: color,
            side: THREE.DoubleSide });
        var textShapes = THREE.FontUtils.generateShapes(message, options);
        var geo = new THREE.ShapeGeometry(textShapes);
        return new THREE.Mesh(geo, material);
    }

    //Really dumb function that return the size, on the axe, of a mesh
    //Should use bounding box!
    function sizeMesh(mesh, axe) {
        var v = mesh.geometry.vertices;
        if(v.length <= 1) {
            return 0;
        }
        return Math.abs(v[v.length - 1][axe] - v[0][axe]);
    }

    that.setMeshes = function(totalSize, displayInMm, initialPosition) {
        if(totalSize === undefined) {
            return;
        }
        var material = new THREE.LineBasicMaterial({ color : 0xffffff });
        var geometry = new THREE.Geometry();
        var type = (displayInMm === false) ? "in" : "mm";
        var d = (displayInMm === false) ? 1 : GCodeToGeometry.inchToMm;
        var width = Math.abs(totalSize.max.x - totalSize.min.x);
        var length = Math.abs(totalSize.max.y - totalSize.min.y);
        var height = Math.abs(totalSize.max.z - totalSize.min.z);
        var textW = (width * d).toFixed(2);
        var textL = (length * d).toFixed(2);
        var textH = (height * d).toFixed(2);
        var options = {'font' : 'helvetiker','weight' : 'normal',
            'style' : 'normal','size' : 1,'curveSegments' : 300};
        var color = 0xffffff;

        that.remove();

        // For x axe
        geometry.vertices.push(new THREE.Vector3(totalSize.min.x, -2 , 0));
        geometry.vertices.push(new THREE.Vector3(totalSize.max.x, -2 , 0));
        that.lineWidth =  new THREE.Line(geometry, material);
        that.textWidth = createMeshText(textW + " " + type, options, color);
        that.textWidth.position.x = that.lineWidth.geometry.vertices[0].x +
            width / 2;
        that.textWidth.position.y = that.lineWidth.geometry.vertices[0].y -
            (options.size + 1);
        that.textWidth.position.z = that.lineWidth.geometry.vertices[0].z;

        // For y axe
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-2, totalSize.min.y, 0));
        geometry.vertices.push(new THREE.Vector3(-2, totalSize.max.y, 0));
        that.lineLength =  new THREE.Line(geometry, material);
        that.textLength = createMeshText(textL + " " + type, options, color);
        that.textLength.rotateZ(-Math.PI/2);
        that.textLength.position.x = that.lineLength.geometry.vertices[0].x-
            (options.size + 1);
        that.textLength.position.y = that.lineLength.geometry.vertices[0].y+
            length / 2;
        that.textLength.position.z = that.lineLength.geometry.vertices[0].z;

        // For z axe
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-2, 0, totalSize.min.z));
        geometry.vertices.push(new THREE.Vector3(-2, 0, totalSize.max.z));
        that.lineHeight =  new THREE.Line(geometry, material);
        that.textHeight = createMeshText(textH + " " + type, options, color);
        that.textHeight.rotateX(Math.PI / 2);
        that.textHeight.position.x = that.lineHeight.geometry.vertices[0].x -
            sizeMesh(that.textHeight, "x") - options.size;
        that.textHeight.position.y = that.lineHeight.geometry.vertices[0].y;
        that.textHeight.position.z = that.lineHeight.geometry.vertices[0].z +
            height / 2;

        if(initialPosition !== undefined) {
            that.lineWidth.position.x += initialPosition.x;
            that.textWidth.position.x += initialPosition.x;
            that.lineLength.position.y += initialPosition.y;
            that.textLength.position.y += initialPosition.y;
            that.textHeight.position.z += initialPosition.z;
            that.lineHeight.position.z += initialPosition.z;
        }
    };

    // initialize
    that.scene = scene;
    that.textWidth = {};
    that.lineWidth = {};
    that.textLength = {};
    that.lineLength = {};
    that.textHeight = {};
    that.lineHeight = {};
};


GCodeViewer.Path = function(scene) {
    "use strict";
    var that = this;

    function resetPathsGeo() {
        that.geoG0Undone = new THREE.Geometry();
        that.geoG1Undone = new THREE.Geometry();
        that.geoG2G3Undone = new THREE.Geometry();
        that.geoG0Done = new THREE.Geometry();
        that.geoG1Done = new THREE.Geometry();
        that.geoG2G3Done = new THREE.Geometry();
    }

    function resetPathsMesh() {
        that.meshG0Undone = {};
        that.meshG1Undone = {};
        that.meshG2G3Undone = {};
        that.meshG0Done = {};
        that.meshG1Done = {};
        that.meshG2G3Done = {};
    }

    that.remove = function() {
        that.scene.remove(that.meshG0Undone);
        that.scene.remove(that.meshG1Undone);
        that.scene.remove(that.meshG2G3Undone);
        that.scene.remove(that.meshG0Done);
        that.scene.remove(that.meshG1Done);
        that.scene.remove(that.meshG2G3Done);
    };

    that.add = function() {
        that.scene.add(that.meshG0Undone);
        that.scene.add(that.meshG1Undone);
        that.scene.add(that.meshG2G3Undone);
        that.scene.add(that.meshG0Done);
        that.scene.add(that.meshG1Done);
        that.scene.add(that.meshG2G3Done);
    };

    function getGeometryStraight(line) {
        var s = line.start, e = line.end;
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(s.x, s.y, s.z));
        geometry.vertices.push(new THREE.Vector3(e.x, e.y, e.z));
        return geometry;
    }

    function getGeometryCurve(line) {
        var i = 0, j = 0;
        var bez = line.beziers;
        var p0 = {}, p1 = {}, p2 = {}, p3 = {};
        var v = [];
        var geometry = new THREE.Geometry();

        for(i=0; i < bez.length; i++) {
            p0 = new THREE.Vector3(bez[i].p0.x, bez[i].p0.y, bez[i].p0.z);
            p1 = new THREE.Vector3(bez[i].p1.x, bez[i].p1.y, bez[i].p1.z);
            p2 = new THREE.Vector3(bez[i].p2.x, bez[i].p2.y, bez[i].p2.z);
            p3 = new THREE.Vector3(bez[i].p3.x, bez[i].p3.y, bez[i].p3.z);

            v = new THREE.CubicBezierCurve3(p0, p1, p2, p3).getPoints(32);
            for(j=0; j < v.length; j++) {
                geometry.vertices.push(v[j]);
            }
        }
        return geometry;
    }

    function setGeometries(lines) {
        var i = 0, j = 0;
        var geometry = new THREE.Geometry();

        if(lines.length === 0) {
            return;
        }

        for(i=0; i < lines.length; i++) {
            if(lines[i].type === "G0") {
                geometry = getGeometryStraight(lines[i]);
                that.geoG0Undone.merge(geometry);
            } else if(lines[i].type === "G1") {
                geometry = getGeometryStraight(lines[i]);
                that.geoG1Undone.merge(geometry);
            } else if(lines[i].type === "G2" || lines[i].type === "G3") {
                geometry = getGeometryCurve(lines[i]);
                that.geoG2G3Undone.vertices.push(geometry.vertices[0]);
                for(j=1; j < geometry.vertices.length-1; j++) {
                    that.geoG2G3Undone.vertices.push(geometry.vertices[j]);
                    that.geoG2G3Undone.vertices.push(geometry.vertices[j]);
                }
                if(geometry.vertices.length > 1) {
                    that.geoG2G3Undone.vertices.push(
                            geometry.vertices[geometry.vertices.length - 1]
                            );
                }
            }
        }
    }

    that.setMeshes = function(lines, initialPosition) {
        resetPathsGeo();
        resetPathsMesh();
        setGeometries(lines);
        that.lines = lines;
        that.initialPosition = { x : 0, y : 0, z : 0};

        that.meshG0Undone = new THREE.Line(that.geoG0Undone,
                that.matG0Undone, THREE.LinePieces);
        that.meshG1Undone = new THREE.Line(that.geoG1Undone,
                that.matG1Undone, THREE.LinePieces);
        that.meshG2G3Undone = new THREE.Line(that.geoG2G3Undone,
                that.matG2G3Undone, THREE.LinePieces);
        that.meshG0Done = new THREE.Line(that.geoG0Done,
                that.matG0Done, THREE.LinePieces);
        that.meshG1Done = new THREE.Line(that.geoG1Done,
                that.matG1Done, THREE.LinePieces);
        that.meshG2G3Done = new THREE.Line(that.geoG2G3Done,
                that.matG2G3Done, THREE.LinePieces);

        if(initialPosition !== undefined) {
            that.initialPosition.x = initialPosition.x;
            that.initialPosition.y = initialPosition.y;
            that.initialPosition.z = initialPosition.z;
            that.meshG0Undone.position.set(initialPosition.x,
                    initialPosition.y, initialPosition.z);
            that.meshG1Undone.position.set(initialPosition.x,
                    initialPosition.y, initialPosition.z);
            that.meshG2G3Undone.position.set(initialPosition.x,
                    initialPosition.y, initialPosition.z);
            that.meshG0Done.position.set(initialPosition.x,
                    initialPosition.y, initialPosition.z);
            that.meshG1Done.position.set(initialPosition.x,
                    initialPosition.y, initialPosition.z);
            that.meshG2G3Done.position.set(initialPosition.x,
                    initialPosition.y, initialPosition.z);
        }
    };

    //Return the next index
    function setPathFromVertices(path, vertices, index, end, type, lineNumber) {
        if(index >= vertices.length) {
            return -1;
        }

        while(index < vertices.length &&
                GCodeViewer.pointsEqual(vertices[index], end) === false)
        {
            path.push({
                point : GCodeViewer.copyPoint(vertices[index]),
                type : type,
                lineNumber : lineNumber
            });
            index++;
        }

        while(index < vertices.length &&
                GCodeViewer.pointsEqual(vertices[index], end) === true)
        {
            path.push({
                point : GCodeViewer.copyPoint(vertices[index]),
                type : type,
                lineNumber : lineNumber
            });
            index++;
        }

        return index;
    }

    function removeDoubloons(path) {
        var i = 0;

        for(i = 0; i < path.length; i++) {
            while(i < path.length - 1 &&
                    path[i].lineNumber === path[i+1].lineNumber &&
                    GCodeViewer.pointsEqual(path[i].point, path[i+1].point))
            {
                path.splice(i+1, 1);
            }
        }
    }

    that.getPath = function() {
        var path = [], vertices = [];
        var iLine = 0, iG0 = 0, iG1 = 0, iG2G3 = 0;
        var line = {}, end = {}, type = "", lineNumber = 0;

        if(that.lines === undefined) {
            return [];
        }

        //Copy all the vertices to the path
        for(iLine = 0; iLine < that.lines.length; iLine++) {
            line = that.lines[iLine];
            type = line.type;
            lineNumber = line.lineNumber;
            if(type === "G0") {
                vertices = that.meshG0Undone.geometry.vertices;
                end = line.end;
                iG0 = setPathFromVertices(path, vertices, iG0, end, type,
                        lineNumber);
                if(iG0 < 0) {
                    return [];
                }
            } else if(type === "G1") {
                vertices = that.meshG1Undone.geometry.vertices;
                end = line.end;
                iG1 = setPathFromVertices(path, vertices, iG1, end, type,
                        lineNumber);
                if(iG1 < 0) {
                    return [];
                }
            } else if(type === "G2" || type === "G3") {
                vertices = that.meshG2G3Undone.geometry.vertices;
                end = line.beziers[line.beziers.length - 1].p3;
                iG2G3 = setPathFromVertices(path, vertices, iG2G3, end, type,
                        lineNumber);
                if(iG2G3 < 0) {
                    return [];
                }
            } else {
                return [];  //unknown type
            }
        }

        removeDoubloons(path);

        return path;
    };

    //This is ridculous not to manage to update the vertices
    //Change the selectionned mesh
    function changeMesh(mesh, vertices, type, done) {
        var mat = {};
        var geo = new THREE.Geometry();
        geo.vertices = vertices;
        that.scene.remove(mesh);

        if(done === true) {
            if(type === "G0") {
                mat = that.matG0Done;
                that.meshG0Done = new THREE.Line(geo, mat, THREE.LinePieces);
                that.scene.add(that.meshG0Done);
            } else if(type === "G1") {
                mat = that.matG1Done;
                that.meshG1Done = new THREE.Line(geo, mat, THREE.LinePieces);
                that.scene.add(that.meshG1Done);
            } else {
                mat = that.matG2G3Done;
                that.meshG2G3Done = new THREE.Line(geo, mat, THREE.LinePieces);
                that.scene.add(that.meshG2G3Done);
            }
        } else {
            if(type === "G0") {
                mat = that.matG0Undone;
                that.meshG0Undone = new THREE.Line(geo, mat, THREE.LinePieces);
                that.scene.add(that.meshG0Undone);
            } else if(type === "G1") {
                mat = that.matG1Undone;
                that.meshG1Undone = new THREE.Line(geo, mat, THREE.LinePieces);
                that.scene.add(that.meshG1Undone);
            } else {
                mat = that.matG2G3Undone;
                that.meshG2G3Undone = new THREE.Line(geo, mat, THREE.LinePieces);
                that.scene.add(that.meshG2G3Undone);
            }
        }

    }

    //The bit did not reach yet on of the vertice
    that.isReachingPoint = function(pointPath, currentPosition) {
        var verticesDone = [], verticesUndone = [];
        var meshDone = {}, meshUndone = {};
        var p = currentPosition;
        // console.log("point is reaching");

        if(pointPath.type === "G0") {
            meshUndone = that.meshG0Undone;
            meshDone = that.meshG0Done;
            verticesUndone = that.meshG0Undone.geometry.vertices;
            verticesDone = that.meshG0Done.geometry.vertices;
        } else if(pointPath.type === "G1") {
            meshUndone = that.meshG1Undone;
            meshDone = that.meshG1Done;
            verticesUndone = that.meshG1Undone.geometry.vertices;
            verticesDone = that.meshG1Done.geometry.vertices;
        } else {  //I assume the types are correct
            meshUndone = that.meshG2G3Undone;
            meshDone = that.meshG2G3Done;
            verticesUndone = that.meshG2G3Undone.geometry.vertices;
            verticesDone = that.meshG2G3Done.geometry.vertices;
        }

        if(verticesDone.length < 2) {
            console.log("False for isReachingPoint");
            return false;
        }
        verticesUndone[0].set(p.x, p.y, p.z);
        verticesDone[verticesDone.length -1].set(p.x, p.y, p.z);
        changeMesh(meshDone, verticesDone, pointPath.type, true);
        changeMesh(meshUndone, verticesUndone, pointPath.type, false);

        return true;
    };

    //When the bit reached this point
    //pointPath is a cell of the path of type:
    //{ point : {x, y, z}, type, lineNumber }
    that.reachedPoint = function(pointPath) {
        //TODO: manage to change meshes
        var verticesDone = [], verticesUndone = [];
        var meshDone = {}, meshUndone = {};

        if(pointPath.type === "G0") {
            meshUndone = that.meshG0Undone;
            meshDone = that.meshG0Done;
            verticesUndone = that.meshG0Undone.geometry.vertices;
            verticesDone = that.meshG0Done.geometry.vertices;
        } else if(pointPath.type === "G1") {
            meshUndone = that.meshG1Undone;
            meshDone = that.meshG1Done;
            verticesUndone = that.meshG1Undone.geometry.vertices;
            verticesDone = that.meshG1Done.geometry.vertices;
        } else {  //I assume the types are correct
            meshUndone = that.meshG2G3Undone;
            meshDone = that.meshG2G3Done;
            verticesUndone = that.meshG2G3Undone.geometry.vertices;
            verticesDone = that.meshG2G3Done.geometry.vertices;
        }

        if(verticesUndone.length < 2) {
            console.log("False for reachedPoint");
            return false;
        }

        // //At the end of a whole command path, there will be three vertices,
        // // which is not a problem (but not optimized)
        // // One that now represents the end of the section
        // // An other used because of dashed line
        // // The last used for representing the bit position
        // //The important thing is that there must be in the same position
        // // an odd number of vertices
        // if(verticesDone.length > 0) {
        //     verticesDone[verticesDone.length -1].x = verticesUndone[0].x;
        //     verticesDone[verticesDone.length -1].y = verticesUndone[0].y;
        //     verticesDone[verticesDone.length -1].z = verticesUndone[0].z;
        // }
        // verticesDone.push(verticesUndone[0].clone());
        // verticesDone.push(verticesUndone[0].clone());
        // verticesUndone.splice(0, 2);

        if(GCodeViewer.samePosition(verticesUndone[0], verticesUndone[1])) {
            //Means we finished a whole line section
            //Remove the two, make sure
            // if(verticesDone.length > 0) {
            //     verticesDone[verticesDone.length -1].x = verticesUndone[1].x;
            //     verticesDone[verticesDone.length -1].y = verticesUndone[1].y;
            //     verticesDone[verticesDone.length -1].z = verticesUndone[1].z;
            // }
            console.log("Whole section done");
            // else {
            // The idea was two put two vertices but why? If no vertice was
            // added already, that means the start and end positions of this
            // line section was in the same place. So it does nothing
            // }
            verticesDone.push(verticesUndone[0].clone());
            verticesDone.push(verticesUndone[0].clone());
            verticesUndone.splice(0, 2);
            // console.log(verticesUndone[0]);
            // console.log(verticesUndone[1]);
            // console.log(GCodeViewer.samePosition(verticesUndone[0], verticesUndone[1]));
        } else {
            //Means we are a the start of a line section
            //Add the start of the line section and the vertice which will
            // follow the bit
            console.log("Start new section");
            verticesDone.push(verticesUndone[0].clone());
            verticesDone.push(verticesUndone[0].clone());
        }

        changeMesh(meshDone, verticesDone, pointPath.type, true);
        changeMesh(meshUndone, verticesUndone, pointPath.type, false);

        // console.log("Length done: " + verticesDone.length);
        // console.log("Length undone: " + verticesUndone.length);

        return true;
    };

    that.isReturningToPoint = function(pointPath, currentPosition) {
        console.log("back" + pointPath + " " + currentPosition);
    };

    //pointPath is a cell of the path of type:
    //{ point : {x, y, z}, type, lineNumber }
    that.returnedToPoint = function(pointPath) {
        //TODO: manage to change meshes
        console.log("back" + pointPath);
    };

    // initialize
    that.scene = scene;
    resetPathsGeo();
    resetPathsMesh();
    that.matG0Undone = new THREE.LineDashedMaterial(
            { color : 0x8877dd, dashSize : 7 });
    that.matG1Undone = new THREE.LineBasicMaterial(
            { color : 0xffffff });
    that.matG2G3Undone = new THREE.LineBasicMaterial(
            { color : 0xffffff });
    that.matG0Done = new THREE.LineDashedMaterial(
            { color : 0xff0000, dashSize : 2 });
    that.matG1Done = new THREE.LineBasicMaterial({ color : 0xff0000 });
    that.matG2G3Done = new THREE.LineBasicMaterial({ color : 0xff0000 });
};
