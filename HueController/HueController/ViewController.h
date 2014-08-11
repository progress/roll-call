//
//  ViewController.h
//  HueController
//
//  Created by David Inglis on 7/29/14.
//  Copyright (c) 2014 dinglis. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController
@property (weak, nonatomic) IBOutlet UISegmentedControl *bulbPicker;
@property (weak, nonatomic) IBOutlet UISlider *brightnessSlider;
@property (weak, nonatomic) IBOutlet UISlider *satSlider;
@property (weak, nonatomic) IBOutlet UISlider *hueSlider;
@property (weak, nonatomic) IBOutlet UIButton *gradMode;
@property (weak, nonatomic) IBOutlet UIButton *update;


@end

