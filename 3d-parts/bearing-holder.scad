// Real Lonely T-Rex Game: Bearing Holder
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;
base_height = 1;
nyloc_nut_hole_r = 7.8/2+1;
nyloc_nut_depth = 5;
hole_spacing = 9.78;

side = 0; // 0 = left, 1 = right

module nyloc_mount(depth=10) {
    translate([0,depth,0])
    rotate([90,0,0])
    difference() {
        cube([10,13,depth]);
        
        translate([5,6,0])
        cylinder(r=nyloc_nut_hole_r,h=nyloc_nut_depth,$fn=6);

        translate([5,6,5])
        cylinder(r=2.2,h=depth-nyloc_nut_depth);
    }
}

module bearing_holder() {
    translate([1,0,13])
    cube([hole_spacing*2+10, 14, base_height]);

    translate([hole_spacing*2+4,0,14])
    difference() {
        cube([hole_spacing-2, 14, 13]);
      
        translate([(hole_spacing-2)-3, 3.5, 0])
        cylinder(r=1.68,h=16);

        translate([(hole_spacing-2)-3, 10.5, 0])
        cylinder(r=1.68,h=16);
    }

    difference() {
        translate([1+5.7,0,7.34+base_height])
        rotate([0, -45, 0])
        cube([9, 14, 8]);
        
        cube([hole_spacing*3+2,14,12]);
    }

    translate([1+(hole_spacing*2+10-17)/2,0,8+base_height])
    difference(){
        translate([0, 0, 5])
        cube([17,14,24]);
        
        translate([8.5, 15, 18.5])
        rotate([90, 0, 0])
        cylinder(h = 32, r = 6);
    };

    cube([1,14,14]);

    translate([1,0,0])
        nyloc_mount(14);

    translate([1+hole_spacing,0,0])
        nyloc_mount(14);

    translate([1+hole_spacing*2,0,0])
        nyloc_mount(14);

    translate([1+hole_spacing*3,0,0])
    cube([1,14,14]);
}

mirror([side,0,0])
bearing_holder();
