// Real Lonely T-Rex Game: Loop Motor Mounter
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=60;

side = 0; // 0 for left, 1 for right

motor_hole_height = 9;
loop_hole_inset = 3.7;

mirror([0,side,0])
union() {
    rotate([0,-90,0])
    difference() {
        union() {
            translate([0,-23,0])
            cube([2,20,13]);
            
            translate([0,-11,3])
            rotate([90,0,45])
            cube([5,4,2.5]);
        }

        translate([-0.5,-10,-0.5])
        cube([3,9,3.5]);

        translate([-0.5,-18,loop_hole_inset])
        rotate([0,90,0])
        cylinder(h=6,r=1.7);
    }
       
    rotate([90,-90,0]) {
        difference() {
            translate([4.8,3,0])
            cube([motor_hole_height+0.2,4,10]);

            translate([motor_hole_height,5,5])
            rotate([90,0,0])
            cylinder(r=1.7,h=2);

            translate([motor_hole_height,8,5])
            rotate([90,0,0])
            cylinder(r=3.1,h=3);
        }

        translate([13-8.2-5*sin(45),3,5*cos(45)])
        rotate([0,45,0])
        cube([5,4,2.5]);
        
        translate([0,3,3])
        cube([5,4,7]);       
    }
}

