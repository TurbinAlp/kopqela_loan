'use client';

import { useEffect, useState } from 'react';

export default function ClientOnlyToolbar() {
  const [mounted, setMounted] = useState(false);
  const [toolbarLoaded, setToolbarLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ToolbarComponent, setToolbarComponent] = useState<React.ComponentType<any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ReactPluginComponent, setReactPluginComponent] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !toolbarLoaded) {
      import("@stagewise/toolbar-next")
        .then((toolbarModule) => import("@stagewise-plugins/react").then((pluginModule) => {
          setToolbarComponent(() => toolbarModule.StagewiseToolbar);
          setReactPluginComponent(pluginModule.ReactPlugin);
          setToolbarLoaded(true);
        }))
        .catch(() => {
          // Silently fail if packages aren't available
          setToolbarLoaded(true);
        });
    }
  }, [mounted, toolbarLoaded]);

  // Don't render anything until mounted and toolbar loaded
  if (!mounted || !toolbarLoaded || !ToolbarComponent || !ReactPluginComponent) {
    return null;
  }

  return (
    <ToolbarComponent 
      config={{
        plugins: [ReactPluginComponent]
      }}
    />
  );
} 