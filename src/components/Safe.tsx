import { Component, ReactNode } from "react";

/** Si algo dentro falla al pintarse, la web sigue viva: pinta `fallback` (o nada, para efectos decorativos). */
export default class Safe extends Component<{ children: ReactNode; fallback?: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: unknown) { console.error("[Safe]", e); }
  render() { return this.state.err ? (this.props.fallback ?? null) : this.props.children; }
}
