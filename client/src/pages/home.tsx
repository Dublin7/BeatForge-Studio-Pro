import { Link } from "wouter";
import { Play, Wand2, Sliders, Music2, Zap, Cloud, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Waveform visualization effect */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100 T500,100 T600,100 T700,100 T800,100 T900,100 T1000,100 T1100,100 T1200,100 T1300,100 T1400,100 T1500,100"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-primary"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/40" data-testid="badge-social-proof">
            <Sparkles className="w-3 h-3 mr-1" />
            Trusted by 10,000+ producers worldwide
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent" data-testid="text-hero-title">
            BeatForge Studio
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
            The Ultimate Web-Based Music Production Suite
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto" data-testid="text-hero-description">
            Create professional beats with AI-powered generation, advanced sequencing, 
            and studio-grade mixing tools — all in your browser
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/beat-generator">
              <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-start-creating">
                <Wand2 className="w-5 h-5" />
                Start Creating
              </Button>
            </Link>
            <Link href="/sequencer">
              <Button size="lg" variant="outline" className="gap-2 min-w-[200px]" data-testid="button-open-sequencer">
                <Music2 className="w-5 h-5" />
                Open Sequencer
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6" data-testid="text-no-installation">
            No installation required • Works offline • Export to WAV
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16" data-testid="text-features-title">
          Three Powerful Tools, One Platform
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* AI Beat Generator Card */}
          <Card className="hover-elevate transition-all duration-300 group" data-testid="card-feature-ai-generator">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Wand2 className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-4">AI Beat Generator</h3>
              <p className="text-muted-foreground mb-6">
                Create unique drum patterns instantly with AI. Choose your genre, 
                adjust complexity, and let the AI craft the perfect groove.
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Genre-aware pattern generation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Adjustable complexity & swing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Real-time preview & editing
                </li>
              </ul>

              <Link href="/beat-generator">
                <Button variant="outline" className="w-full" data-testid="button-try-ai-generator">
                  Try AI Generator
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Advanced Sequencer Card */}
          <Card className="hover-elevate transition-all duration-300 group" data-testid="card-feature-sequencer">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-md bg-chart-2/20 flex items-center justify-center mb-6 group-hover:bg-chart-2/30 transition-colors">
                <Music2 className="w-7 h-7 text-chart-2" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-4">Advanced Sequencer</h3>
              <p className="text-muted-foreground mb-6">
                Professional step sequencer with up to 16 tracks. Build complex 
                arrangements with precise control over every note.
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                  16 simultaneous tracks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                  Velocity & timing control
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                  Pattern chaining & loops
                </li>
              </ul>

              <Link href="/sequencer">
                <Button variant="outline" className="w-full" data-testid="button-open-sequencer-card">
                  Open Sequencer
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Professional Mixer Card */}
          <Card className="hover-elevate transition-all duration-300 group" data-testid="card-feature-mixer">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-md bg-chart-3/20 flex items-center justify-center mb-6 group-hover:bg-chart-3/30 transition-colors">
                <Sliders className="w-7 h-7 text-chart-3" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-4">Professional Mixer</h3>
              <p className="text-muted-foreground mb-6">
                Studio-quality mixing with EQ, effects, and real-time analysis. 
                Polish your tracks to perfection.
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                  3-band EQ per track
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                  Built-in reverb & delay
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                  Real-time spectrum analysis
                </li>
              </ul>

              <Link href="/mixer">
                <Button variant="outline" className="w-full" data-testid="button-open-mixer">
                  Open Mixer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16" data-testid="text-tech-stack-title">
            Powered by Modern Technology
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center" data-testid="card-tech-web-audio">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Web Audio API</h4>
                <p className="text-sm text-muted-foreground">
                  Professional-grade audio processing in the browser
                </p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-tech-tonejs">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-chart-2/20 flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-chart-2" />
                </div>
                <h4 className="font-semibold mb-2">Tone.js</h4>
                <p className="text-sm text-muted-foreground">
                  Framework for creating interactive music
                </p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-tech-ai">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-chart-3/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-chart-3" />
                </div>
                <h4 className="font-semibold mb-2">AI Generation</h4>
                <p className="text-sm text-muted-foreground">
                  OpenAI-powered intelligent beat creation
                </p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-tech-pwa">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-chart-4/20 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-chart-4" />
                </div>
                <h4 className="font-semibold mb-2">Progressive Web App</h4>
                <p className="text-sm text-muted-foreground">
                  Install and use offline on any device
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-cta-title">
            Ready to Create Your Next Hit?
          </h2>
          <p className="text-lg text-muted-foreground mb-12" data-testid="text-cta-description">
            No downloads, no installations, no limits. Start producing music right now.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/beat-generator">
              <Button size="lg" className="gap-2 min-w-[220px]" data-testid="button-cta-primary">
                <Wand2 className="w-5 h-5" />
                Generate Your First Beat
              </Button>
            </Link>
            <Link href="/sequencer">
              <Button size="lg" variant="secondary" className="gap-2 min-w-[220px]" data-testid="button-cta-secondary">
                <Music2 className="w-5 h-5" />
                Explore Sequencer
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8" data-testid="text-cta-subtext">
            Free to use • No account required • Export high-quality WAV files
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">
            BeatForge Studio — Where AI meets creativity in music production
          </p>
        </div>
      </footer>
    </div>
  );
}
