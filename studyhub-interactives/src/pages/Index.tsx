import { Brain, MessageSquare, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const features = [
  {
    title: "MindMap AI",
    description: "Create and organize your study materials visually with AI",
    icon: Brain,
    href: "/mindmap/mindmap-ai",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    title: "MindMap Manual",
    description: "Create and organize your study materials visually manually",
    icon: Brain,
    href: "/mindmap/mindmap-manual",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    title: "Chat with PDF",
    description: "Ask questions and get answers from your study materials",
    icon: MessageSquare,
    href: "/pdf-chat",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "FlashCard",
    description: "Create and review flashcards for effective learning",
    icon: BookOpen,
    href: "/flashcard",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const Index = () => {
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
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Welcome to Jenome
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your all-in-one platform for interactive learning and study tools
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a href={feature.href} className="block h-full">
                <Card className={cn(
                  "group hover:shadow-lg transition-all duration-300 h-full overflow-hidden relative",
                  "hover:-translate-y-1"
                )}>
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                      `bg-gradient-to-br ${feature.gradient}`
                    )}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;