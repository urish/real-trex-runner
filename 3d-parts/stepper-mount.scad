// Real Lonely T-Rex Game: Stepper Mount (NEMA-14)
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

nyloc_nut_hole_r = 7.8/2+1;
nyloc_nut_depth = 5;
hole_spacing = 9.78;
stepper_size = 35.2;
stepper_hole_spacing = 26;
stepper_depth = 36;
side_padding = 2;
total_width = hole_spacing * 3 + side_padding * 2;

module nyloc_mount(depth=10) {
    translate([0,depth,0])
    rotate([90,0,0])
    difference() {
        cube([10,11,depth]);
        
        translate([5,6,0])
        cylinder(r=nyloc_nut_hole_r,h=nyloc_nut_depth,$fn=6);

        translate([5,6,5])
        cylinder(r=2.2,h=depth-nyloc_nut_depth);
    }
}


translate([0,0,11])
difference() {
    cube([total_width,2,8]);
    
    translate([total_width/2, 0, stepper_size/2])
    rotate([-90, 0, 0])
    cylinder(r=12, h=10);
    
    
    translate([(total_width-stepper_hole_spacing)/2, -1, (stepper_size-stepper_hole_spacing)/2])
    rotate([-90, 0, 0])
    cylinder(r=1.8, h=10);
    
    translate([(total_width-stepper_hole_spacing)/2+stepper_hole_spacing, -1, (stepper_size-stepper_hole_spacing)/2])
    rotate([-90, 0, 0])
    cylinder(r=1.8, h=10);

}

cube([side_padding, stepper_depth ,11]);

translate([side_padding,0,0])
    nyloc_mount(14);

translate([side_padding+hole_spacing,0,0])
    nyloc_mount(14);

translate([side_padding+hole_spacing*2,0,0])
    nyloc_mount(14);

translate([side_padding+hole_spacing*3,0,0])
cube([side_padding, stepper_depth, 11]);

intersection() {
    cube([total_width,stepper_depth,11]);
    
    translate([0,stepper_depth-11*tan(45)-5,0])
    rotate([45,0,0])
    translate([0,0,-15])
    cube([total_width,50,15]);
}
