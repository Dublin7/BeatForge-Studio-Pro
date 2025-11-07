import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import BeatGenerator from "@/pages/beat-generator";
import Sequencer from "@/pages/sequencer";
import Mixer from "@/pages/mixer";
import AudioEditor from "@/pages/audio-editor";
import PerformLive from "@/pages/perform-live";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/beat-generator" component={BeatGenerator} />
      <Route path="/sequencer" component={Sequencer} />
      <Route path="/mixer" component={Mixer} />
      <Route path="/audio-editor" component={AudioEditor} />
      <Route path="/perform-live" component={PerformLive} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set dark theme on mount (music production studio aesthetic)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
