#GCode viewer
This app generates a 3D representation of GCode.

##Done:
* Parsing GCode
* Display path for straight lines
* Ability to set initial position of the tool (by using the configuration helper)
* Displaying arcs
* Different coloration for G0 vs G1/G2/G3 (maybe red for G0 and blue for G1)
* Interpreting relative position mode
* Orthogonal view
* Add the possibility to load an other GCode file
* Verify that the G2 and G3 commands are possible (i.e. radius big enough)
* Show size of the total operation (v1 needs that)
* Showing difference between inches/mm (v1 needs that)

##TODO:
###Functionalities
* Manage correctly each command used (v1 needs that)
* Add a "step-by-step" functionality
* Displaying 3D representation of the result
* Animation?
### UI
* Put a button for every functionnalities (v1 needs that)
* Resize base grid to match extents of cut in XY
* Auto zoom to extent of the part when loaded
* Ability to highlight based on line number to "step through" files
* Marker showing origin?
* Indicator of current tool location?
