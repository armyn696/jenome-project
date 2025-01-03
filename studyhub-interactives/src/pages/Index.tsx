import { Brain, MessageSquare, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const features = [
  {
    title: "MindMap",
    description: "Create and organize your study materials visually",
    icon: Brain,
    href: "/mindmap",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    title: "Chat with PDF",
    description: "Ask questions and get answers from your study materials",
    icon: MessageSquare,
    href: "http://localhost:8080",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "FlashCard",
    description: "Create and review flashcards for effective learning",
    icon: BookOpen,
    href: "http://localhost:5175",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Quiz",
    description: "Test your knowledge with interactive quizzes",
    icon: GraduationCap,
    href: "/quiz",
    gradient: "from-orange-500 to-red-500",
  },
];

const Index = () => {
  console.log("Rendering Index page");
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white relative overflow-hidden">
      {/* Floating shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <main className="container mx-auto px-4 py-16 relative">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
            Your Interactive Learning Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Enhance your learning experience with our suite of interactive study tools
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.a
              key={feature.title}
              href={feature.href}
              className="block group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={cn(
                "relative h-full overflow-hidden transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1",
                "border border-gray-100 backdrop-blur-sm bg-white/50",
                "hover:border-gray-200 rounded-xl"
              )}>
                <CardContent className="p-6">
                  <motion.div 
                    className={cn(
                      "w-16 h-16 rounded-xl mb-6 flex items-center justify-center",
                      "bg-gradient-to-br shadow-lg",
                      feature.gradient
                    )}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                  "bg-gradient-to-br",
                  feature.gradient
                )} />
              </Card>
            </motion.a>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;