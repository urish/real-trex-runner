// Real Lonely T-Rex Game: Bar Mount
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

nyloc_nut_hole_r = 7.8/2+1;
nyloc_nut_depth = 5;
hole_spacing = 9.78;
total_width = 2+hole_spacing*3;
height = 44;
bar_height = 4;

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

rotate([90,0,0])
union() {
    translate([0,0,12])
    cube([total_width,6,height-12]);

    translate([0,0,height-bar_height])
    cube([total_width,12,bar_height]);


    cube([1,6,12]);

    translate([1,0,0])
    nyloc_mount(6);

    translate([1+hole_spacing,0,0])
    cube([1,6,12]);

    translate([1+hole_spacing*2-1,0,0])
    cube([1,6,12]);

    translate([1+hole_spacing*2,0,0])
    nyloc_mount(6);

    translate([1+hole_spacing*3,0,0])
    cube([1,6,12]);
}