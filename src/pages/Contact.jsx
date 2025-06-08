import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-white">
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

      <div className="px-6 pb-16 max-w-4xl mx-auto space-y-8">
        {[{
          icon: <Mail className="w-6 h-6 text-blue-400 mt-1" />,
          title: "Email",
          detail: "support@smarthome.in"
        },{
          icon: <Phone className="w-6 h-6 text-green-400 mt-1" />,
          title: "Phone",
          detail: "+91 98765 43210"
        },{
          icon: <MapPin className="w-6 h-6 text-purple-400 mt-1" />,
          title: "Address",
          detail: "401 Innovation Tower,\nConnaught Place, New Delhi, India"
        },{
          icon: <Clock className="w-6 h-6 text-orange-400 mt-1" />,
          title: "Business Hours",
          detail: "Mon–Fri: 9 AM–6 PM IST\nSat–Sun: 10 AM–4 PM IST"
        }].map(({icon, title, detail}, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            {icon}
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-blue-200 whitespace-pre-line">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Visit Our Office</h2>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1663229203856-8a363f07d881?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="New Delhi cityscape at night"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="text-center px-6">
                <h3 className="text-2xl font-bold text-white mb-2">New Delhi, India</h3>
                <p className="text-blue-200">Heart of Smart Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}