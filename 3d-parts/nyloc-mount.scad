// Real Lonely T-Rex Game: 6/32 Nyloc Nut Mount 
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

nyloc_nut_hole_r = 7.8/2+1;
nyloc_nut_depth = 5;
hole_spacing = 9.78;

module nyloc_mount(depth=10) {
    translate([0,depth,0])
    rotate([90,0,0])
    difference() {
        cube([10,12,depth]);
        
        translate([5,6,0])
        cylinder(r=nyloc_nut_hole_r,h=nyloc_nut_depth,$fn=6);

        translate([5,6,5])
        cylinder(r=2.2,h=depth-nyloc_nut_depth);
    }
}


cube([1,6,12]);

translate([1,0,0])
    nyloc_mount(6);

translate([1+hole_spacing,0,0])
cube([1,6,12]);
