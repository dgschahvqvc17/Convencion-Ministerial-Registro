import { Component, input } from '@angular/core';
import { DashboardStatsDto } from '../../models/api.types';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-head">
      <div>
        <span class="tricolor"><i></i><i></i><i></i></span>
        <p class="eyebrow">{{ eyebrow() }}</p>
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="muted">{{ subtitle() }}</p>
        }
      </div>
      <div class="actions"><ng-content /></div>
    </header>
  `,
  styles: `
    .page-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 26px;
      flex-wrap: wrap;
    }
    h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); color: #fff; margin-top: 10px; }
    p { margin: 6px 0 0; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
  `,
})
export class PageHeaderView {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <article class="stat glass">
      <span class="icon">{{ icon() }}</span>
      <div>
        <p class="label">{{ label() }}</p>
        <strong>{{ value() }}</strong>
      </div>
      <span class="hint">{{ hint() }}</span>
    </article>
  `,
  styles: `
    .stat {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      overflow: hidden;
      transition: transform .2s ease, border-color .2s ease;
    }
    .stat:hover { transform: translateY(-4px); border-color: rgba(247,181,0,.55); }
    .icon {
      display: grid; place-items: center;
      width: 48px; height: 48px; border-radius: 14px;
      font-size: 1.25rem;
      background: rgba(247,181,0,.14);
      border: 1px solid rgba(247,181,0,.35);
    }
    .label { margin: 0; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); }
    strong { display: block; font-family: var(--font-display); font-size: 1.8rem; color: var(--gold-light); }
    .hint { margin-left: auto; font-size: .72rem; color: var(--text-muted); }
  `,
})
export class StatCardView {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<string>();
  readonly hint = input<string>('');
}

@Component({
  selector: 'app-state-block',
  standalone: true,
  template: `
    <div class="state" aria-live="polite">
      @if (loading()) {
        <div class="spinner"></div>
        <strong>Cargando información…</strong>
      } @else if (error()) {
        <strong>No se pudo cargar la información</strong>
        <span>{{ error() }}</span>
      } @else if (empty()) {
        <strong>{{ emptyMessage() }}</strong>
        <span>Registre el primer elemento para comenzar.</span>
      }
    </div>
  `,
})
export class StateBlockView {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly empty = input(false);
  readonly emptyMessage = input('No hay registros todavía');
}

export function statsFromDto(dto: DashboardStatsDto | null) {
  return [
    { label: 'Departamentos / Regiones', value: dto?.regions ?? 0, icon: '◈', hint: ' Activos' },
    { label: 'Distritos', value: dto?.districts ?? 0, icon: '◇', hint: ' Activos' },
    { label: 'Iglesias', value: dto?.churches ?? 0, icon: '✦', hint: ' Activas' },
    { label: 'Pastores', value: dto?.pastors ?? 0, icon: '✝', hint: ' Registrados' },
    { label: 'Asistencia', value: dto?.attendance ?? 0, icon: '✓', hint: ' Registros' },
  ];
}
