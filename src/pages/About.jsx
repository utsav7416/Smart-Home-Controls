import React from "react";
import { Brain, Zap, Shield, Users } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const Badge = ({ className, variant = 'default', children, ...props }) => {

  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <div className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
            About SmartHome AI
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Revolutionizing Home Automation
          </h1>
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            We're pioneering the future of intelligent home management through cutting-edge AI technology, 
            energy optimization, and seamless device integration.
          </p>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=400&fit=crop&auto=format"
              alt="Smart home technology display"
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-blue-200 mb-6">
                At SmartHome AI, we believe that technology should make life simpler, more efficient, 
                and more sustainable. Our mission is to create intelligent home automation systems 
                that learn from your habits and optimize energy consumption automatically.
              </p>
              <p className="text-blue-200">
                Through advanced machine learning algorithms and real-time analytics, we're building 
                the foundation for tomorrow's smart homes today.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&auto=format"
                alt="Modern smart home with mountain view"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-black/40 backdrop-blur-md border border-blue-400/30">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
                <p className="text-blue-200 text-sm">
                  Advanced machine learning algorithms that adapt to your lifestyle
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-green-400/30">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Energy Efficient</h3>
                <p className="text-blue-200 text-sm">
                  Optimize energy consumption and reduce your carbon footprint
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-purple-400/30">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Secure</h3>
                <p className="text-blue-200 text-sm">
                  Enterprise-grade security protecting your home and data
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-orange-400/30">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">User-Friendly</h3>
                <p className="text-blue-200 text-sm">
                  Intuitive interface designed for seamless user experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Our Vision for the Future</h2>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=400&fit=crop&auto=format"
              alt="Futuristic landscape representing innovation"
              className="w-full rounded-2xl shadow-2xl"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 rounded-2xl flex items-center justify-center">
              <div className="text-center max-w-3xl px-6 -mt-24">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Building Tomorrow's Smart Homes Today
                </h3>

                <p className="text-xl font-bold text-gray-900 mb-4">
                    We envision a world where homes are not just smart, but truly intelligent - 
                    anticipating needs, optimizing resources, and creating the perfect living environment 
                    for every family.
                </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}