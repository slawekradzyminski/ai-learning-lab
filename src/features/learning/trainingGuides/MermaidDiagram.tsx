import { useEffect, useId, useState } from 'react';

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const render = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        });
        const id = `training-guide-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const result = await mermaid.render(id, chart.trim());
        if (active) setSvg(result.svg);
      } catch {
        if (active) setError(true);
      }
    };
    void render();
    return () => { active = false; };
  }, [chart, reactId]);

  if (error) return <pre className="overflow-x-auto bg-slate-950 p-5 text-xs text-slate-200">{chart}</pre>;
  if (!svg) return <div className="h-48 animate-pulse bg-stone-100" aria-label="Rendering diagram" />;

  return (
    <div
      className="my-8 overflow-x-auto border-y border-stone-200 bg-white py-6 [&_svg]:mx-auto [&_svg]:max-w-full"
      data-testid="training-guide-mermaid"
      // Mermaid receives only trusted diagrams shipped with this application.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
