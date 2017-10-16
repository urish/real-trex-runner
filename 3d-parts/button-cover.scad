$fn=240;

inner_radius = 25/2;
inner_brim_width = (46-25)/2;
outer_radius = 98.3/2;
brim_height = 2;
height = 38;

difference() {
    cylinder(r=outer_radius, h=height);

    translate([0,0,-0.5])
    cylinder(r=outer_radius-4, h=2);

    translate([0,0,1])
    cylinder(r=outer_radius-2.5, h=height-1+0.5);
}

difference() {
    cylinder(r=inner_radius+inner_brim_width, h=brim_height);

    translate([0,0,-0.5])
    cylinder(r=inner_radius, h=brim_height+1);
}

 for(angle = [0: 60 : 360]) {
     rotate([0,0,angle])
     translate([inner_radius,0,0])
     cube([outer_radius-inner_radius, 4, brim_height]);
 }
