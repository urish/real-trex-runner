// Real Lonely T-Rex Game: Loop Motor Mounter
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=60;

side = -1; // 1 for right, -1 for left

rotate([90,0,0]) {
    translate([0,0,7 * side])
    union() {
        translate([8,5.3,0])
        intersection() {
            rotate([0,0,-40])
                cube([6,12,10]);
    
            cube([6,12,10]);
        };
        
        translate([8,0,0])
        cube([6,5.4,10]);
    
        translate([0,0,0])
        difference() {
            cube([8,5.4,10]);

            rotate([0,0,34])
            cube([10,6,10]);
        };

        translate([8,0,0])
        cube([6,5.4,10]);
    }
    

    difference() {
        cube([14,5.4,10]);

        translate([14,0,0])
        rotate([0,0,45])
            cube([6,12,10]);


        translate([5,7,5])
        rotate([90,0,0])
        cylinder(r=1.7,h=10);
    }
}