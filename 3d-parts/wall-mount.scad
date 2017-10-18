// Real Lonely T-Rex Game: Wall Mount
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

width = 5.2;
wall_width = 3.2;

difference() {
    translate([-10,-4,0])
    cube([20,10,width]);
    
    translate([0,4.1,width-wall_width])
    union() {
       cylinder(h=wall_width+1, r=6.5);

       translate([-6.5,0,0])
       cube([6.5*2,6.5,wall_width+1]);
        
    }
    
    translate([0,4,-0.5])
    cylinder(h=3+1, r=1.7);
}


translate([-10,6,0])
    cube([20,2,width-wall_width]);

difference() {
    translate([-5,-18-4.1/2,0])
    cube([10,17,width]);

    translate([0,-14-4.1/2,0])
    cylinder(h=3,r=3.1);

    translate([0,-14-4.1/2,3])
    cylinder(h=4,r=1.7);

}