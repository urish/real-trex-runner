// Real Lonely T-Rex Game: Background Plate Spacer
// Copyright (C) 2017, Uri Shaked and Ariella Eliassaf

$fn = 120;

difference() {
    union() {
        cylinder(h=1, r=5);
        cylinder(h=9, r=3.5);
    }
    
    cylinder(h=9, r=2.5);
}    