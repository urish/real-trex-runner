// Real Lonely T-Rex Game: Jump mechanism cap
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

pole_radius = 8/2;
pole_distance = 36.3;
width = 50;
depth = 13;
cap_tickness = 3;
hole_depth = 10;

module copy_mirror(vec=[0,1,0]) { 
    children(); 
    mirror(vec) children(); 
}

copy_mirror([1,0,0])
translate([-17/2, -depth/2,cap_tickness+hole_depth])
difference(){
   union() {
        cube([17/2, depth, 16]);

        translate([0,0,-6*sin(45)])
        rotate([0, -45, 0])
        cube([6, depth, 6]);
    }

    translate([8.5, 15, 8])
    rotate([90, 0, 0])
    cylinder(h = 32, r = 6);
};


difference() {
    translate([-width/2, -depth/2,0])
    cube([width, depth, cap_tickness+hole_depth]);
  
    translate([-pole_distance/2, 0, cap_tickness])
    cylinder(r=pole_radius+0.4, h=10);

    translate([pole_distance/2, 0, cap_tickness])
    cylinder(r=pole_radius+0.4, h=10);
}
