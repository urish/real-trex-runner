// Real Lonely T-Rex Game: Jump Motor Mount
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

module copy_mirror(vec=[0,1,0]) { 
    children(); 
    mirror(vec) children(); 
}

pole_radius = 8/2;
bearing_radius = 22.16/2;
bearing_distance = 36.3;
width = bearing_radius + 2;

    
translate([-25/2, -width/2,0])
cube([25, width, 6]);

difference() {
    translate([-(bearing_distance+22)/2, -width/2,0])
    cube([bearing_distance+22, width, 4]);
    
    copy_mirror([1,0,0])
    translate([-52.2/2,0,0])
    cylinder(r=3.7/2,h=5);

    translate([-bearing_distance/2,0,0])
    cylinder(r=pole_radius+1, h=5);

    translate([bearing_distance/2,0,0])
    cylinder(r=pole_radius+1, h=5);
}
