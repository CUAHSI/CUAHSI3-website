export function useCategoryColor(category: string) {
  const defs: Record<string, { color: string; label: string }> = {
    'research':           { color: 'oklch(0.55 0.13 245)', label: 'Research' },
    'cyberinfrastructure':{ color: 'oklch(0.53 0.12 200)', label: 'Cyberinfrastructure' },
    'data-infrastructure':{ color: 'oklch(0.52 0.13 290)', label: 'Data infrastructure' },
    'training':           { color: 'oklch(0.54 0.12 150)', label: 'Training & programs' },
    'community':          { color: 'oklch(0.56 0.13 55)',  label: 'Community' },
  }
  const def = defs[category] ?? { color: '#15212B', label: category }
  return { color: def.color, label: def.label }
}
