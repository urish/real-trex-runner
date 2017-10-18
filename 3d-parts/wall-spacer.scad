// Real Lonely T-Rex Game: Wall Spacer
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn = 120;

difference() {
    union() {
        cylinder(h=0.6, r=5);
        cylinder(h=11, r=3.3);
    }
    
    cylinder(h=11, r=2);
}    