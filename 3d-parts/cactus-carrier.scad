// Real Lonely T-Rex Game: Cactus Carrier
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=260;

body_length = 40;
body_width = 9;
body_height = 10;

hole_length = 11.5;
hole_width = 1.8;
hole_depth = 5;

difference() {
    union() {
        cube([body_length,body_width,body_height]);
        
        translate([0,body_width/2,0])
        cylinder(r=body_width/2,h=body_height);
    }
    
    translate([(body_length-hole_length)/2,(body_width-hole_width)/2,body_height-hole_depth])
    cube([hole_length,hole_width,body_height]);
}
