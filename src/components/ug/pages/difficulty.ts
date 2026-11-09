/**
 * The redesign's difficulty pill (`.diff.d-*` in app.css): one purple that gets
 * heavier as problems get harder. Maps the content's difficulty strings
 * (Very Easy ... Insane, plus a few legacy spellings) onto the export's scale.
 * Returns null when there's no difficulty to show.
 */
export function diffPill(
  difficulty: string | null | undefined
): { label: string; cls: string } | null {
  const d = (difficulty || '').trim().toLowerCase();
  switch (d) {
    case 'very easy':
      return { label: 'Very easy', cls: 'd-easy' };
    case 'easy':
    case 'medium-easy':
      return { label: 'Easy', cls: 'd-easy' };
    case 'normal':
    case 'medium':
      return { label: 'Medium', cls: 'd-med' };
    case 'hard':
      return { label: 'Hard', cls: 'd-hard' };
    case 'very hard':
      return { label: 'Very hard', cls: 'd-vhard' };
    case 'insane':
      return { label: 'Insane', cls: 'd-insane' };
    case 'olympiad':
      return { label: 'Olympiad', cls: 'd-insane' };
    default:
      return null;
  }
}
