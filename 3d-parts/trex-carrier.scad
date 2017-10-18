// Real Lonely T-Rex Game: T-Rex Carrier
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn=120;

difference() {
    cube([10,10,7.5]);
    
    translate([3,3,0])
    cylinder(h=10, r=2.3);
    
    translate([0,7,2.5])
    rotate([0,90,0])
    cylinder(h=10, r=1.8);
}
