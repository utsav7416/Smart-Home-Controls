import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-black text-white">
      <div className="py-20 px-6 text-center">
        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-sm">
          Contact Us
        </div>
        <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
        <p className="text-xl text-blue-200 max-w-3xl mx-auto">
          Have questions about SmartHome AI? We'd love to hear from you.
          Reach out through any of the following ways.
        </p>
      </div>

      {/* Contact Section with Image and Text */}
      <div className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&h=500&fit=crop&crop=center"
              alt="Customer support team working with smart home technology"
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=500&fit=crop&crop=center"; 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-xl font-semibold mb-1">Expert Support Team</h3>
              <p className="text-blue-200">Always here to help you</p>
            </div>
          </div>

          {/* Right Side - Contact Information */}
          <div className="space-y-8">
            {[{
              icon: <Mail className="w-6 h-6 text-blue-400 mt-1" />,
              title: "Email",
              detail: "support@smarthome.in"
            },{
              icon: <Phone className="w-6 h-6 text-green-400 mt-1" />,
              title: "Phone", 
              detail: "+91 88268 34155"
            },{
              icon: <MapPin className="w-6 h-6 text-purple-400 mt-1" />,
              title: "Address",
              detail: "401 Innovation Tower,\nConnaught Place, New Delhi, India"
            },{
              icon: <Clock className="w-6 h-6 text-orange-400 mt-1" />,
              title: "Business Hours",
              detail: "Mon–Fri: 9 AM–6 PM IST\nSat–Sun: 10 AM–4 PM IST"
            }].map(({icon, title, detail}, idx) => (
              <div key={idx} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                {icon}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-blue-200 whitespace-pre-line">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Visit Our Office</h2>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1663229203856-8a363f07d881?q=80&w=1974&auto=format&fit=crop&crop=center"
              alt="New Delhi cityscape at night"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="text-center px-6">
                <h3 className="text-2xl font-bold text-white mb-2">New Delhi, India</h3>
                <p className="text-blue-200">The Heart of Smart Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}