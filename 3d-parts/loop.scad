// Real Lonely T-Rex Game: Loop
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=60;

outer_radius = 65;
wall_width = 1;
tunnel_width = 15;
tunnel_height = 22; // 30;
lip_height = 5;
lip_inset = 2.5;
mount_cube_height = 15;
inner_radius = outer_radius - tunnel_width - wall_width * 2;

module copy_mirror(vec=[0,1,0]) { 
    children(); 
    mirror(vec) children(); 
}

module tunnel() {
    difference() {
        union() {
            difference() {
                cylinder(r=outer_radius, h=tunnel_height);
                translate([0,0,-1])
                cylinder(r=outer_radius-wall_width, h=tunnel_height-lip_height+1.001);


                translate([0,0,tunnel_height-lip_height])
                cylinder(r1=outer_radius-wall_width, r2=outer_radius-wall_width-lip_inset, h=lip_height+0.001);
            }           

            difference() {
                union() {
                    cylinder(r=outer_radius-wall_width-tunnel_width, h=tunnel_height-lip_height);

                    translate([0,0,tunnel_height-lip_height])
                    cylinder(r1=outer_radius-wall_width-tunnel_width, r2=outer_radius-wall_width-tunnel_width+lip_inset, h=lip_height);
                }
                
                translate([0,0,-1])
                cylinder(r=outer_radius-wall_width-tunnel_width-wall_width, h=tunnel_height+2);
            }

            difference() {
                cylinder(r=outer_radius, h=1);
                translate([0,0,-1])
                cylinder(r=outer_radius-wall_width-tunnel_width-wall_width, h=3);
            
                // slides at the end of tunnel
                translate([-3,-outer_radius,0])
                rotate([0,70,0])
                cube([1, outer_radius*2, 10]);
            }
        }

        
        translate([-300,-150,-1])
        cube([300,300,40]);
    }
}

module mounting() {
    translate([0,inner_radius-5.6,0])
        cube([10,5.4,mount_cube_height]);

    translate([0,inner_radius-5.6,0])
        cube([5,6,mount_cube_height]);
}

module mounting_holes() {
    translate([2+1.7,inner_radius+3,7])
    rotate([90,0,0])
    cylinder(r=1.7,h=10);
    
    // motor shaft + pulley
    translate([2+1.7-13,inner_radius-5.6+2,7-13])
    rotate([90,0,0])
    cylinder(r=12,h=2);

    translate([2+1.7-13,inner_radius-5.6+9,7-13])
    rotate([90,0,0])
    cylinder(r=11.5,h=6);

    translate([2+1.7,inner_radius+tunnel_width+3,7])
    rotate([90,0,0])
    cylinder(r=3,2,h=5.5+tunnel_width);
}

module leg_mounting() {
    rotate([0,0,10])
    translate([inner_radius-5,0,0])
    difference() {
        translate([0,-5,0])
        cube([5,10,5]);
        
        translate([2.5,0,0])
        cylinder(r=1.7,h=10);
    }
}

difference() {
    union() {
        tunnel();
        
        copy_mirror([0,1,0])
        mounting();
        
        copy_mirror([0,1,0])       
        leg_mounting();
    }
    
    copy_mirror([0,1,0])       
    mounting_holes();
}
