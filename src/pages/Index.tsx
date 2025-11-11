import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { CheckCircle2, LayoutDashboard, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-1 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Manage Projects Like a Pro
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl">
              Organize your work, track progress, and collaborate with your team in a beautiful, intuitive interface.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Everything you need to succeed
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-card-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="h-8 w-8 text-card-blue-text" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Visual Boards</h3>
              <p className="text-muted-foreground">
                Organize tasks with beautiful, drag-and-drop boards that make project management a breeze.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-card-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-card-green-text" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work together seamlessly with real-time updates and team member assignments.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-card-purple rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-card-purple-text" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Experience blazing-fast performance with real-time updates and instant synchronization.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of teams who trust ProManage to get things done.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 ProManage. Built with React, TypeScript & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
