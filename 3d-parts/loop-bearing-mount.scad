// Real Lonely T-Rex Game: Loop Bearing Mounter
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=60;

side = 0; // 0 for left, 1 for right

loop_hole_inset = 3.7;
motor_hole_inset = 2;
hole_radius = 1.75;
height = 4;
width = 13;

mirror([0,side,0])
difference() {
    translate([0,0,0])
    cube([width,21,height]);

    translate([loop_hole_inset,17,-0.2])
    cylinder(h=height+1,r=1.7);

    translate([width/2+3.5, motor_hole_inset+hole_radius, -0.2])
    cylinder(r=hole_radius, h=height+1);

    translate([width/2-3.5, motor_hole_inset+hole_radius, 0])
    cylinder(r=1.68,h=16);
}
