//
//  ViewController.m
//  HueController
//
//  Created by David Inglis on 7/29/14.
//  Copyright (c) 2014 dinglis. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()
            

@end

@implementation ViewController
            
- (void)viewDidLoad {
    [super viewDidLoad];
    NSLog(@"Hello");
    // Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
- (IBAction)buttonClicked:(id)sender {
    NSString *nodeString = [NSString stringWithFormat:@"http://helloworld-20553.onmodulus.net/updateBulb?bulb=%d&bri=%d&sat=%d&hue=%d&alert=none&effect=none", self.bulbPicker.selectedSegmentIndex, (int)lroundf(self.brightnessSlider.value), (int)lroundf(self.satSlider.value), (int)lroundf(self.hueSlider.value)];
    [self str:nodeString];
}

- (IBAction)blinkClicked:(id)sender {
     NSString *nodeString = [NSString stringWithFormat:@"http://helloworld-20553.onmodulus.net/updateBulb?bulb=%d&bri=%d&sat=%d&hue=%d&alert=lselect&effect=none", self.bulbPicker.selectedSegmentIndex, (int)lroundf(self.brightnessSlider.value), (int)lroundf(self.satSlider.value), (int)lroundf(self.hueSlider.value)];
    [self str:nodeString];
}

- (IBAction)gradClicked:(id)sender {
    NSString *nodeString = [NSString stringWithFormat:@"http://helloworld-20553.onmodulus.net/updateBulb?bulb=%d&bri=%d&sat=%d&hue=%d&alert=none&effect=colorloop", self.bulbPicker.selectedSegmentIndex, (int)lroundf(self.brightnessSlider.value), (int)lroundf(self.satSlider.value), (int)lroundf(self.hueSlider.value)];
    [self str:nodeString];
}

-(void)str:(NSString*)nodeString
{
    NSURLSession *session = [NSURLSession sharedSession];
    NSURL *nodeURL = [NSURL URLWithString:nodeString];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:nodeURL];
    [request setHTTPMethod: @"GET"];
    NSURLSessionDataTask *postDataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error)
    {
        NSLog(@"Sent request.");
    }];
    [postDataTask resume];
    NSLog(@"past request in code.");
    
    
    
}


@end
