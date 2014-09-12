//
//  ViewController.h
//  HueController
//
//  Copyright 2014 © Progress Software
//  Contributor: David Inglis

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController
@property (weak, nonatomic) IBOutlet UISegmentedControl *bulbPicker;
@property (weak, nonatomic) IBOutlet UISlider *brightnessSlider;
@property (weak, nonatomic) IBOutlet UISlider *satSlider;
@property (weak, nonatomic) IBOutlet UISlider *hueSlider;
@property (weak, nonatomic) IBOutlet UIButton *gradMode;
@property (weak, nonatomic) IBOutlet UIButton *update;


@end

