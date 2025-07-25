import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { 
  Radio, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Headphones,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Mic
} from 'lucide-react';

export default function Pricing() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (err) {
      // User not authenticated
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = async () => {
    if (currentUser) {
      // User is already logged in, redirect to app
      window.location.href = createPageUrl('Studio');
    } else {
      // User needs to login
      await User.loginWithRedirect(window.location.origin + createPageUrl('Studio'));
    }
  };

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for small stations and podcasters",
      features: [
        "Up to 1,000 tracks",
        "Basic AutoDJ",
        "Standard scheduling",
        "Email support",
        "Basic audio processing",
        "Single user account"
      ],
      popular: false,
      color: "border-slate-600"
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month",
      description: "Ideal for growing radio stations",
      features: [
        "Up to 10,000 tracks",
        "Smart AutoDJ with AI",
        "Advanced scheduling",
        "Priority support",
        "Professional audio processing",
        "Up to 5 user accounts",
        "Voice tracking",
        "Basic compliance tools"
      ],
      popular: true,
      color: "border-blue-500"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "per month",
      description: "For large stations and networks",
      features: [
        "Unlimited tracks",
        "Enterprise AutoDJ",
        "Multi-station management",
        "24/7 phone support",
        "Advanced audio processing",
        "Unlimited users",
        "Full voice tracking studio",
        "Complete compliance suite",
        "Custom integrations",
        "White-label options"
      ],
      popular: false,
      color: "border-purple-500"
    }
  ];

  const features = [
    {
      icon: <PlayCircle className="w-6 h-6" />,
      title: "Smart AutoDJ",
      description: "AI-powered music scheduling with artist separation, energy flow, and time-of-day programming"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Tracking",
      description: "Professional voice tracking studio with automatic crossfading and seamless integration"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Broadcast Compliance",
      description: "Built-in FCC compliance tools, DMCA reporting, and automated logging for legal requirements"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Reporting",
      description: "Detailed play logs, audience analytics, and performance metrics for your station"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Live Assist Mode",
      description: "Seamless transition between automation and live DJ control with cart wall and instant playback"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-User Support",
      description: "Role-based access control for DJs, program directors, and station managers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Radio className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">RadioPro Automation</h1>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Professional Radio Automation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Made Simple
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Power your radio station with intelligent automation, seamless live assist, 
              and professional-grade audio processing. Trusted by thousands of broadcasters worldwide.
            </p>

            {!isLoading && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  {currentUser ? 'Go to Studio' : 'Start Free Trial'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="text-slate-300 text-sm">
                  <strong>14-Day Free Trial</strong> • No Credit Card Required
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10,000+</div>
                <div className="text-slate-400 text-sm">Radio Stations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-slate-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-slate-400 text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-slate-400 text-sm">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">
            Everything You Need to Run Your Station
          </h3>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            From intelligent automation to live broadcasting, RadioPro provides all the tools 
            professional broadcasters need in one powerful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">
            Choose the Perfect Plan for Your Station
          </h3>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Start with our free trial, then select the plan that fits your needs. 
            All plans include our core automation features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative bg-slate-800/50 border-2 ${plan.color} ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">/{plan.period}</span>
                </div>
                <p className="text-slate-300">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={handleGetStarted}
                  className={`w-full py-3 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {currentUser ? 'Go to Studio' : 'Start Free Trial'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 mb-4">
            All plans include a 14-day free trial. No setup fees. Cancel anytime.
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-slate-500">
            <span>✓ No contracts</span>
            <span>✓ 30-day money back guarantee</span>
            <span>✓ Free migration assistance</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800/50 border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Radio Station?
          </h3>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of broadcasters who trust RadioPro for their automation needs. 
            Start your free trial today and experience the difference.
          </p>
          
          {!isLoading && (
            <div className="space-y-4">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg mr-4"
              >
                {currentUser ? 'Go to Studio Dashboard' : 'Start Your Free Trial Now'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {!currentUser && (
                <div className="text-slate-400 text-sm">
                  Already have an account? <button onClick={handleGetStarted} className="text-blue-400 hover:text-blue-300 underline">Sign in here</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}